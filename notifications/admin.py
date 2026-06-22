from django.contrib import admin
from .models import InternalNotification, SMSLog

@admin.register(InternalNotification)
class InternalNotificationAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'is_read', 'sent_at')
    list_filter = ('is_read',)
    search_fields = ('sender__username', 'recipient__username', 'message_body')
    readonly_fields = ('sent_at',)

@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ('recipient_phone', 'sms_type', 'status', 'sent_at', 'sent_by')
    list_filter = ('sms_type', 'status')
    search_fields = ('recipient_phone', 'message_body')
    readonly_fields = ('sent_at',)