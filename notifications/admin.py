from django.contrib import admin
from .models import InternalNotification, SMSLog, ParentMessage, ParentMessageReply

@admin.register(InternalNotification)
class InternalNotificationAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'is_read', 'sent_at')
    list_filter = ('is_read',)
    search_fields = ('sender__username', 'recipient__username', 'message_body')
    readonly_fields = ('sent_at',)

@admin.register(ParentMessage)
class ParentMessageAdmin(admin.ModelAdmin):
    list_display = ('student', 'sender', 'is_read', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('student__name', 'sender__username', 'message_body')
    readonly_fields = ('created_at',)

@admin.register(ParentMessageReply)
class ParentMessageReplyAdmin(admin.ModelAdmin):
    list_display = ('message', 'sender', 'created_at')
    search_fields = ('sender__username', 'message_body')
    readonly_fields = ('created_at',)

@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ('recipient_phone', 'sms_type', 'status', 'sent_at', 'sent_by')
    list_filter = ('sms_type', 'status')
    search_fields = ('recipient_phone', 'message_body')
    readonly_fields = ('sent_at',)