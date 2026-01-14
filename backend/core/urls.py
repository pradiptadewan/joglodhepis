from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from hotel.views import RoomTypeViewSet
from resto.views import MenuViewSet, DrinkViewSet
from vw.views import VWPackageViewSet, VWDestinasiViewSet

router = DefaultRouter()
router.register(r'rooms', RoomTypeViewSet)
router.register(r'menus', MenuViewSet)
router.register(r'drinks', DrinkViewSet)
router.register(r'packages', VWPackageViewSet) 
router.register(r'vw-destinations', VWDestinasiViewSet) 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    
    path('api/', include('transactions.urls')), 
    
    path('api/', include(router.urls)), 
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)