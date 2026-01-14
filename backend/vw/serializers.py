from rest_framework import serializers
from .models import VWPackage, VWDestinasi, VWEdukasi

class VWDestinasiSerializer(serializers.ModelSerializer):
    class Meta:
        model = VWDestinasi
        fields = ['id', 'name', 'image', 'description']

class VWEdukasiSerializer(serializers.ModelSerializer):
    class Meta:
        model = VWEdukasi
        fields = ['id', 'title', 'image', 'description']

class VWPackageSerializer(serializers.ModelSerializer):
    destinations = VWDestinasiSerializer(many=True, read_only=True)
    educations = VWEdukasiSerializer(many=True, read_only=True)

    class Meta:
        model = VWPackage
        fields = ['id', 'name', 'price', 'duration', 'image', 'description', 'destinations', 'educations']