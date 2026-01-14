from datetime import timedelta
from django.utils import timezone
from .models import Order

def batalkan_pesanan_expired():
    # 1. Tentukan batas waktu
    batas_waktu = timezone.now() - timedelta(minutes=8)

    expired_orders = Order.objects.filter(
        status='PENDING', 
        created_at__lt=batas_waktu
    )

    jumlah = expired_orders.count()

    if jumlah > 0:
        expired_orders.update(status='CANCEL')
    else:
        pass