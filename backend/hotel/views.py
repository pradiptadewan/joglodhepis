from rest_framework import viewsets
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import RoomType
from .serializers import RoomTypeSerializer
from transactions.models import OrderItemHotel

class RoomTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer

    def get_queryset(self):
        queryset = RoomType.objects.all()
        
        # 1. Ambil parameter dari URL
        check_in_param = self.request.query_params.get('check_in')
        check_out_param = self.request.query_params.get('check_out')

        if not check_in_param or not check_out_param:
            today = timezone.now().date()
            tomorrow = today + timedelta(days=1)
            
            check_in_param = today.strftime('%Y-%m-%d')
            check_out_param = tomorrow.strftime('%Y-%m-%d')

        try:
            valid_pending_time = timezone.now() - timedelta(minutes=8)

            booked_room_ids = OrderItemHotel.objects.filter(
                check_in__lt=check_out_param,
                check_out__gt=check_in_param
            ).filter(
                Q(order__status='PAID') | 
                Q(order__status='PENDING', order__created_at__gt=valid_pending_time)
            ).values_list('room_type_id', flat=True)

            for room in queryset:
                if room.id in booked_room_ids:
                    room.total_rooms = 0
                else:
                    room.total_rooms = 1 

        except Exception as e:
            print(f"Error filtering rooms: {e}")
            pass

        return queryset