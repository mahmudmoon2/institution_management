from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import JobPosting, Application
from .serializers import JobPostingSerializer, ApplicationSerializer

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all().order_by('-created_at')
    serializer_class = JobPostingSerializer
    permission_classes = [AllowAny] # পাবলিক ওয়েবসাইটে জব দেখানোর জন্য AllowAny দেওয়া হলো

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().order_by('-applied_at')
    serializer_class = ApplicationSerializer
    permission_classes = [AllowAny] # ক্যান্ডিডেটরা যেন লগইন ছাড়াই অ্যাপ্লাই করতে পারে