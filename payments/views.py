from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import FeeCategory, Payment
from .serializers import FeeCategorySerializer, PaymentSerializer

class FeeCategoryViewSet(viewsets.ModelViewSet):
    queryset = FeeCategory.objects.all().order_by('id')
    serializer_class = FeeCategorySerializer
    permission_classes = [IsAuthenticated]

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    # পেমেন্ট সেভ হওয়ার সময় কে পেমেন্ট রিসিভ করছে (অ্যাডমিন), তা অটোমেটিক সেভ হবে
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)