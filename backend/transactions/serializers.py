from rest_framework import serializers
from .models import Order, OrderItemHotel, OrderItemResto, OrderItemVW
from hotel.serializers import RoomTypeSerializer
from resto.serializers import MenuSerializer, DrinkSerializer
from vw.serializers import VWPackageSerializer

class OrderItemHotelSerializer(serializers.ModelSerializer):
    room_detail = RoomTypeSerializer(source='room_type', read_only=True)
    class Meta:
        model = OrderItemHotel
        fields = ['id', 'room_type', 'room_detail', 'check_in', 'check_out', 'price_at_booking']

class OrderItemRestoSerializer(serializers.ModelSerializer):
    menu_detail = MenuSerializer(source='menu', read_only=True)
    drink_detail = DrinkSerializer(source='drink', read_only=True)
    class Meta:
        model = OrderItemResto
        fields = ['id', 'menu', 'menu_detail', 'drink', 'drink_detail', 'note', 'quantity', 'price_at_booking']

class OrderItemVWSerializer(serializers.ModelSerializer):
    vw_detail = VWPackageSerializer(source='vw_package', read_only=True)
    class Meta:
        model = OrderItemVW
        fields = ['id', 'vw_package', 'vw_detail', 'trip_date', 'total_unit', 'price_at_booking']

class OrderSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    hotel_items = OrderItemHotelSerializer(many=True, read_only=True)
    resto_items = OrderItemRestoSerializer(many=True, read_only=True)
    vw_items = OrderItemVWSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_name', 'status', 'created_at', 
            'total_amount_gateway', 'has_vw_booking', 'vw_payment_status',
            'special_request', 'midtrans_id', 'payment_method',
            'hotel_items', 'resto_items', 'vw_items',
            'customer_name', 'customer_phone', 'room_number', 'special_request',
            
        ]