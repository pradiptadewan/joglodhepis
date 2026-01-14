from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, CheckoutView, CheckStatusOrderView, AdminOrderViewSet 

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-order')

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('check-status/', CheckStatusOrderView.as_view(), name='check-status'),
]