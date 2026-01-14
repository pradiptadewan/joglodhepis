from django.db import models
from django.conf import settings
from hotel.models import RoomType
from resto.models import Menu, Drink
from vw.models import VWPackage

class Order(models.Model):
    STATUS_CHOICES = (
        ('CART', 'In Cart'),
        ('PENDING', 'Pending Payment'),
        ('PAID', 'Paid'),
        ('PAY_AT_HOTEL', 'Pay at Hotel'),
        ('FAILED', 'Failed'),
        ('CANCEL', 'Cancelled'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CART')
    total_amount_gateway = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    midtrans_id = models.CharField(max_length=100, blank=True, null=True)
    has_vw_booking = models.BooleanField(default=False)
    vw_payment_status = models.CharField(max_length=20, default='NONE')
    special_request = models.TextField(blank=True, null=True, verbose_name="Catatan User")
    customer_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="Nama Pemesan")
    customer_phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="No HP / WA")
    room_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Nomor Kamar/Meja")
    
    PAYMENT_METHOD_CHOICES = (
        ('bca', 'Bank Transfer / QRIS'),
        ('hotel', 'Pay at Hotel'),
    )
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='bca')

    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"

class OrderItemHotel(models.Model):
    order = models.ForeignKey(Order, related_name='hotel_items', on_delete=models.CASCADE)
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    price_at_booking = models.DecimalField(max_digits=10, decimal_places=2)

class OrderItemResto(models.Model):
    order = models.ForeignKey(Order, related_name='resto_items', on_delete=models.CASCADE)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, null=True, blank=True)
    drink = models.ForeignKey(Drink, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.IntegerField()
    price_at_booking = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.CharField(max_length=255, blank=True, null=True)

class OrderItemVW(models.Model):
    order = models.ForeignKey(Order, related_name='vw_items', on_delete=models.CASCADE)
    vw_package = models.ForeignKey(VWPackage, on_delete=models.CASCADE)
    trip_date = models.DateField()
    total_unit = models.IntegerField()
    price_at_booking = models.DecimalField(max_digits=10, decimal_places=2)