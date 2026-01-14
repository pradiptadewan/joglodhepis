from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import time
import midtransclient

from .models import Order, OrderItemHotel, OrderItemResto, OrderItemVW
from .serializers import OrderSerializer
from hotel.models import RoomType
from resto.models import Menu, Drink
from vw.models import VWPackage

class AdminOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = OrderSerializer
    queryset = Order.objects.all().order_by('-created_at')

    def get_queryset(self):
        queryset = Order.objects.all().order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response({'status': 'success', 'current_status': order.status})
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = Order.objects.filter(user=self.request.user)
        batas_waktu = timezone.now() - timedelta(minutes=10)
        
        pending_expired = queryset.filter(
            status='PENDING', 
            created_at__lt=batas_waktu
        ).exclude(payment_method='hotel')
        
        if pending_expired.exists():
            pending_expired.update(status='CANCEL')
            
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        
        if order.status == 'PENDING':
            order.status = 'CANCEL'
            order.save()
            return Response({'status': 'success', 'message': 'Pesanan berhasil dibatalkan'})
        
        return Response(
            {'error': 'Pesanan tidak dapat dibatalkan'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        order = self.get_object()

        if order.status != 'PENDING':
            return Response({'error': 'Pesanan bukan status pending'}, status=status.HTTP_400_BAD_REQUEST)

        if order.payment_method == 'hotel':
             return Response({'error': 'Metode pembayaran ini tidak memerlukan pembayaran online'}, status=status.HTTP_400_BAD_REQUEST)

        if order.created_at < timezone.now() - timedelta(minutes=10):
            order.status = 'CANCEL'
            order.save()
            return Response({'error': 'Waktu pembayaran habis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            snap = midtransclient.Snap(
                is_production=getattr(settings, 'MIDTRANS_IS_PRODUCTION', False),
                server_key=getattr(settings, 'MIDTRANS_SERVER_KEY', '')
            )

            midtrans_order_id = f"INV-{order.id}-{int(time.time())}"

            order.midtrans_id = midtrans_order_id
            order.save()

            param = {
                "transaction_details": {
                    "order_id": midtrans_order_id,
                    "gross_amount": int(order.total_amount_gateway)
                },
                "customer_details": {
                    "first_name": request.user.first_name or "Guest",
                    "email": request.user.email,
                }
            }

            transaction = snap.create_transaction(param)
            
            return Response({
                'token': transaction['token'],
                'redirect_url': transaction['redirect_url']
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        data = request.data
        user = request.user
        user_note = data.get('note', '')
        customer_name = data.get('customer_name', user.first_name or 'Guest')
        customer_phone = data.get('customer_phone', '')
        room_number = data.get('room_number', '')
        payment_method = data.get('payment_method', 'bca')

        initial_status = 'PENDING'
        if payment_method == 'hotel':
            initial_status = 'PAY_AT_HOTEL'
        
        order = Order.objects.create(
            user=user, 
            status=initial_status,
            special_request=user_note,
            payment_method=payment_method,
            customer_name=customer_name,
            customer_phone=customer_phone,
            room_number=room_number,
        )
        
        total_gateway = 0
        has_vw = False
        midtrans_items = []

        try:
            hotel_items = data.get('hotel_items', [])
            for item in hotel_items:
                room = RoomType.objects.get(id=item['room_type_id'])
                d1 = datetime.strptime(item['check_in'], "%Y-%m-%d")
                d2 = datetime.strptime(item['check_out'], "%Y-%m-%d")
                nights = (d2 - d1).days
                if nights < 1: nights = 1
                
                total_price = room.price_per_night * nights
                
                OrderItemHotel.objects.create(
                    order=order,
                    room_type=room,
                    check_in=item['check_in'],
                    check_out=item['check_out'],
                    price_at_booking=total_price
                )
                total_gateway += total_price

                midtrans_items.append({
                    "id": f"ROOM-{room.id}",
                    "price": int(room.price_per_night),
                    "quantity": nights,
                    "name": f"Room: {room.name}"[:50]
                })

            resto_items = data.get('resto_items', [])
            for item in resto_items:
                menu_id = item['menu_id']
                qty = int(item['quantity'])
                item_type = item.get('item_type', 'food')
                item_note = item.get('note', '')

                price_per_item = 0
                item_name = ""
                menu_obj = None
                drink_obj = None

                if item_type == 'drink':
                    drink_obj = Drink.objects.get(id=menu_id)
                    price_per_item = drink_obj.price
                    item_name = drink_obj.name
                else:
                    menu_obj = Menu.objects.get(id=menu_id)
                    if menu_obj.is_package and qty < menu_obj.min_order_qty:
                        raise Exception(f"Menu {menu_obj.name} minimal {menu_obj.min_order_qty} porsi")
                    price_per_item = menu_obj.price
                    item_name = menu_obj.name

                total_price = price_per_item * qty
                total_gateway += total_price

                OrderItemResto.objects.create(
                    order=order,
                    menu=menu_obj,
                    drink=drink_obj,
                    quantity=qty,
                    price_at_booking=total_price,
                    note=item_note
                )

                midtrans_items.append({
                    "id": f"{item_type.upper()}-{menu_id}",
                    "price": int(price_per_item),
                    "quantity": qty,
                    "name": item_name[:50]
                })

            vw_items = data.get('vw_items', [])
            if vw_items:
                has_vw = True
                for item in vw_items:
                    vw = VWPackage.objects.get(id=item['vw_id'])
                    qty = int(item['total_unit'])
                    vw_total = vw.price * qty 
                    
                    OrderItemVW.objects.create(
                        order=order,
                        vw_package=vw,
                        trip_date=item['trip_date'],
                        total_unit=qty,
                        price_at_booking=vw_total
                    )

            order.total_amount_gateway = total_gateway
            order.has_vw_booking = has_vw
            if has_vw:
                order.vw_payment_status = 'WAITING'
            order.save()

            if payment_method == 'hotel':
                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            snap = midtransclient.Snap(
                is_production=getattr(settings, 'MIDTRANS_IS_PRODUCTION', False),
                server_key=getattr(settings, 'MIDTRANS_SERVER_KEY', '')
            )

            midtrans_order_id = f"INV-{order.id}-{int(time.time())}"
            order.midtrans_id = midtrans_order_id
            order.save()
            
            param = {
                "transaction_details": {
                    "order_id": midtrans_order_id,
                    "gross_amount": int(total_gateway)
                },
                "item_details": midtrans_items,
                "customer_details": {
                    "first_name": user.first_name if user.first_name else "Guest",
                    "last_name": user.last_name if user.last_name else "",
                    "email": user.email,
                }
            }

            transaction_response = snap.create_transaction(param)
            snap_token = transaction_response['token']

            serializer = OrderSerializer(order)
            response_data = serializer.data
            response_data['token'] = snap_token
            response_data['midtrans_order_id'] = midtrans_order_id

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CheckStatusOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        midtrans_order_id = request.data.get('order_id')
        
        if not midtrans_order_id:
            return Response({'error': 'Order ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        core = midtransclient.CoreApi(
            is_production=getattr(settings, 'MIDTRANS_IS_PRODUCTION', False),
            server_key=getattr(settings, 'MIDTRANS_SERVER_KEY', ''),
            client_key=getattr(settings, 'MIDTRANS_CLIENT_KEY', '')
        )

        try:
            transaction_status_response = core.transactions.status(midtrans_order_id)
            transaction_status = transaction_status_response['transaction_status']
            fraud_status = transaction_status_response.get('fraud_status', '') 

            try:
                real_order_id = midtrans_order_id.split('-')[1]
                order = Order.objects.get(id=real_order_id)
            except (IndexError, Order.DoesNotExist):
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

            previous_status = order.status
            
            if transaction_status == 'capture':
                if fraud_status == 'challenge':
                    order.status = 'PENDING'
                else:
                    order.status = 'PAID'
            elif transaction_status == 'settlement':
                order.status = 'PAID'
            elif transaction_status in ['pending', 'authorize']:
                order.status = 'PENDING'
            elif transaction_status in ['deny', 'cancel', 'expire', 'failure']:
                order.status = 'FAILED'

            order.save()

            return Response({
                'status': 'success',
                'order_id': order.id,
                'previous_status': previous_status,
                'new_status': order.status,
                'midtrans_status': transaction_status
            })

        except Exception as e:
            print(f"Error updating status: {str(e)}") 
            return Response({'status': 'pending', 'message': str(e)}, status=status.HTTP_200_OK)