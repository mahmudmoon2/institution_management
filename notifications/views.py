from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import InternalNotification, SMSLog
from .serializers import InternalNotificationSerializer, SMSLogSerializer

class InternalNotificationViewSet(viewsets.ModelViewSet):
    queryset = InternalNotification.objects.all().order_by('-sent_at')
    serializer_class = InternalNotificationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class SMSLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    লগ শুধুমাত্র রিড-ওনলি হবে। কেউ লগ ডিলিট বা এডিট করতে পারবে না।
    """
    queryset = SMSLog.objects.all().order_by('-sent_at')
    serializer_class = SMSLogSerializer
    permission_classes = [IsAuthenticated]

class SendBulkSMSView(APIView):
    """
    Bulk SMS পাঠানোর লোকাল এন্ডপয়েন্ট (ডাটাবেসে লগ সেভ হয়, লোকালি সিমুলেটেড)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        recipients = request.data.get('recipients', [])
        message = request.data.get('message', '')
        sms_type = request.data.get('sms_type', 'Custom')

        if not recipients or not message:
            return Response({"error": "Recipients and message are required."}, status=status.HTTP_400_BAD_REQUEST)

        logs = []
        for phone in recipients:
            # লোকাল SMS সিস্টেম: মেসেজ ডাটাবেসে লগ হয়
            delivery_status = 'Sent'

            logs.append(
                SMSLog(
                    recipient_phone=phone,
                    message_body=message,
                    sms_type=sms_type,
                    status=delivery_status,
                    sent_by=request.user
                )
            )
        
        # ডাটাবেসে একসাথে সব লগ সেভ করা (Bulk Create)
        SMSLog.objects.bulk_create(logs)

        return Response({
            "message": f"Successfully logged {len(logs)} messages to local database.",
            "total_sent": len(logs)
        }, status=status.HTTP_200_OK)
