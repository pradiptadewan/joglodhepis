from django.contrib import admin
from django.db import models
from django.forms import CheckboxSelectMultiple
from .models import RoomType, RoomImage, Facility

class RoomImageInline(admin.TabularInline):
    model = RoomImage
    extra = 3

class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'location', 'price_per_night', 'capacity', 'total_rooms')
    list_filter = ('category',) 
    inlines = [RoomImageInline]
    
    formfield_overrides = {
        models.ManyToManyField: {'widget': CheckboxSelectMultiple},
    }

admin.site.register(Facility)
admin.site.register(RoomType, RoomTypeAdmin)