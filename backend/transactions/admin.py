from django.contrib import admin
from .models import Order, OrderItemHotel, OrderItemResto, OrderItemVW

class HotelInline(admin.TabularInline):
    model = OrderItemHotel
    extra = 0

class RestoInline(admin.TabularInline):
    model = OrderItemResto
    extra = 0

class VWInline(admin.TabularInline):
    model = OrderItemVW
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total_amount_gateway', 'special_request', 'created_at')
    readonly_fields = ('created_at', 'special_request')
    list_filter = ('status', 'vw_payment_status', 'has_vw_booking')
    inlines = [HotelInline, RestoInline, VWInline]

admin.site.register(Order, OrderAdmin)