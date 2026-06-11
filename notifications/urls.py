from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InternalNotificationViewSet, SMSLogViewSet, SendBulkSMSView

router = DefaultRouter()
router.register(r'internal', InternalNotificationViewSet, basename='internal-notification')
router.register(r'sms-logs', SMSLogViewSet, basename='sms-log')

urlpatterns = [
    path('', include(router.urls)),
    path('send-bulk-sms/', SendBulkSMSView.as_view(), name='send_bulk_sms'),
]