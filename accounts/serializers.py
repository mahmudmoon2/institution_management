from rest_framework import serializers
from .models import Head, DailyTransaction

class HeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Head
        fields = '__all__'

class DailyTransactionSerializer(serializers.ModelSerializer):
    head_name = serializers.CharField(source='head.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True)

    class Meta:
        model = DailyTransaction
        fields = '__all__'