from rest_framework import viewsets
from .models import VWPackage, VWDestinasi
from .serializers import VWPackageSerializer, VWDestinasiSerializer

class VWPackageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VWPackage.objects.all()
    serializer_class = VWPackageSerializer
    lookup_field = 'id'

class VWDestinasiViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VWDestinasi.objects.all()
    serializer_class = VWDestinasiSerializer