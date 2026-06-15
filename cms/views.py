from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from weasyprint import HTML
from .models import HeroSlide, Notice, Event, FAQ, Blog, ContactMessage, EventGalleryImage, EventRegistration
from .serializers import (
    HeroSlideSerializer, NoticeSerializer, EventSerializer, FAQSerializer,
    BlogSerializer, ContactMessageSerializer, EventGalleryImageSerializer, EventRegistrationSerializer
)
from students.models import Student

# ---------- অনুমোদন: শুধু অ্যাডমিন (প্রয়োজনে) ----------
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

# ---------- HeroSlide (পাবলিক শুধু পড়া) ----------
class HeroSlideViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HeroSlide.objects.filter(is_active=True).order_by('order')
    serializer_class = HeroSlideSerializer
    permission_classes = [AllowAny]

# ---------- Notice (পাবলিক GET, প্রটেক্টেড POST/PUT/DELETE) ----------
class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = NoticeSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        # বর্তমানে যেকোনো লগইন ব্যবহারকারী নোটিস যোগ করতে পারবে। শুধু অ্যাডমিন চাইলে [IsAdminUser()] ব্যবহার করো।
        return [IsAuthenticated()]

    @action(detail=True, methods=['get'], url_path='download-pdf')
    def download_pdf(self, request, pk=None):
        notice = self.get_object()
        html_string = render_to_string('cms/notice_pdf.html', {'notice': notice})
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="notice_{notice.id}.pdf"'
        pisa_status = pisa.CreatePDF(html_string, dest=response)
        if pisa_status.err:
            return HttpResponse('Error generating PDF')
        return response

# ---------- Event (পাবলিক GET, প্রটেক্টেড POST/PUT/DELETE) ----------
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date_time')
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['get'], url_path='gallery')
    def gallery(self, request, pk=None):
        event = self.get_object()
        images = event.gallery_images.all()
        serializer = EventGalleryImageSerializer(images, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='register')
    def register(self, request, pk=None):
        event = self.get_object()
        serializer = EventRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(event=event)
            return Response({'status': 'success', 'message': 'Registration submitted'}, status=201)
        return Response(serializer.errors, status=400)

# ---------- FAQ, Blog, ContactMessage আগের মতোই রাখা যায় ----------
class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQ.objects.filter(is_active=True).order_by('order')
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]

class BlogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Blog.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = BlogSerializer
    permission_classes = [AllowAny]

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Your message has been sent. Thank you!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)