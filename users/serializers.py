from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        role = self.context['request'].data.get('role')  # ফ্রন্টএন্ড থেকে role আসবে

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError('Invalid credentials')

        # রোল চেক — Student ও Parent একই Portal শেয়ার করে
        if role:
            if role == 'STUDENT':
                if user.role not in ['STUDENT', 'PARENT']:
                    raise serializers.ValidationError(f'You are not authorized as {role}')
            elif user.role != role:
                raise serializers.ValidationError(f'You are not authorized as {role}')

        data = super().validate(attrs)
        data['role'] = user.role  # টোকেন রেসপন্সে রোল যোগ করুন
        return data