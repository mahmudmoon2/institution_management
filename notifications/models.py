import uuid
from django.db import models
from django.conf import settings

class InternalNotification(models.Model):
    """
    সিস্টেমের ভেতরের মেসেজ (যেমন: Teacher থেকে Parent কে মেসেজ)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_notifications', on_delete=models.CASCADE)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_notifications', on_delete=models.CASCADE)
    message_body = models.TextField()
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient}"

class SMSLog(models.Model):
    """
    SMS বা WhatsApp এর মাধ্যমে পাঠানো মেসেজের লগ
    """
    SMS_TYPE_CHOICES = (
        ('Attendance', 'Attendance'),
        ('Result', 'Result'),
        ('Fee-Reminder', 'Fee Reminder'),
        ('Custom', 'Custom Bulk Message'),
    )
    STATUS_CHOICES = (
        ('Sent', 'Sent'),
        ('Failed', 'Failed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_phone = models.CharField(max_length=20)
    message_body = models.TextField()
    sms_type = models.CharField(max_length=20, choices=SMS_TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Sent')
    sent_at = models.DateTimeField(auto_now_add=True)
    sent_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.sms_type} to {self.recipient_phone} ({self.status})"