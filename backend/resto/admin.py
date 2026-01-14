from django.contrib import admin
from .models import Menu, Drink


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'is_package', 'has_flavor_option', 'min_order_qty')
    list_filter = ('is_package', 'has_flavor_option') 
    search_fields = ('name',)
    
    fieldsets = (
        ('Info Utama', {
            'fields': ('name', 'price', 'image', 'is_package')
        }),
        ('Khusus Menu Harian', {
            'classes': ('collapse',),
            'fields': ('description', 'has_flavor_option'), 
        }),
        ('Khusus Menu Paket', {
            'classes': ('collapse',),
            'fields': ('package_content', 'min_order_qty'),
        }),
    )

@admin.register(Drink)
class DrinkAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'serving_type', 'has_sugar_option') 
    list_filter = ('serving_type', 'has_sugar_option')
    search_fields = ('name',)