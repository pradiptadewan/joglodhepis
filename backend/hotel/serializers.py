from rest_framework import serializers
from .models import RoomType, RoomImage, Facility

class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = ['id', 'name']

class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ['id', 'image']

class RoomTypeSerializer(serializers.ModelSerializer):
    images = RoomImageSerializer(many=True, read_only=True)
    facilities = FacilitySerializer(many=True, read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = RoomType
        fields = '__all__'