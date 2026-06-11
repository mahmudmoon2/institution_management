from rest_framework import serializers
from .models import InternalNotification, SMSLog

class InternalNotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    recipient_name = serializers.CharField(source='recipient.username', read_only=True)

    class Meta:
        model = InternalNotification
        fields = '__all__'

class SMSLogSerializer(serializers.ModelSerializer):
    sent_by_name = serializers.CharField(source='sent_by.username', read_only=True)

    class Meta:
        model = SMSLog
        fields = '__all__'