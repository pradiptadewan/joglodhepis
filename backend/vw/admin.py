from django.contrib import admin
from .models import VWPackage, VWDestinasi, VWEdukasi

class VWPackageAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration')
    filter_horizontal = ('destinations', 'educations',) 

admin.site.register(VWPackage, VWPackageAdmin)
admin.site.register(VWDestinasi)
admin.site.register(VWEdukasi)