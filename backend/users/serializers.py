# backend/users/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    # Tambahkan field password dengan write_only agar tidak terbaca saat GET
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'phone_number', 'first_name', 'last_name']

    def create(self, validated_data):
        # Ambil password dari data
        password = validated_data.pop('password', None)
        # Buat instance user
        instance = self.Meta.model(**validated_data)
        
        # Set password (otomatis hashing)
        if password is not None:
            instance.set_password(password)
        
        instance.save()
        return instance