from rest_framework import viewsets
from .models import Menu, Drink
from .serializers import MenuSerializer, DrinkSerializer

class MenuViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer
    filterset_fields = ['category', 'is_package']

class DrinkViewSet(viewsets.ModelViewSet):
    queryset = Drink.objects.all()
    serializer_class = DrinkSerializer