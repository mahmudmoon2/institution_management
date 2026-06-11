from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Head, DailyTransaction
from .serializers import HeadSerializer, DailyTransactionSerializer

class HeadViewSet(viewsets.ModelViewSet):
    queryset = Head.objects.all().order_by('name')
    serializer_class = HeadSerializer
    permission_classes = [IsAuthenticated]

class DailyTransactionViewSet(viewsets.ModelViewSet):
    queryset = DailyTransaction.objects.all().order_by('-date', '-created_at')
    serializer_class = DailyTransactionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)