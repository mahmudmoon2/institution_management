from academics import serializers
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML
import qrcode
import base64
from io import BytesIO
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Teacher
from .serializers import TeacherSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all().order_by('-created_at')
    serializer_class = TeacherSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("=== Teacher create validation errors ===")
            print(serializer.errors)
            return Response(serializer.errors, status=400)
        return super().create(request, *args, **kwargs)
    
    def get_permissions(self):
        """
        GET রিকোয়েস্ট (লিস্ট ও ডিটেইল) পাবলিক – লগইন লাগবে না।
        POST, PUT, PATCH, DELETE এ শুধুমাত্র অথেনটিকেটেড ইউজার।
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    
# teachers/views.py এর নিচে যোগ করুন
from .models import TeacherAttendance, ClassHistory
from .serializers import TeacherAttendanceSerializer, ClassHistorySerializer

class TeacherAttendanceViewSet(viewsets.ModelViewSet):
    queryset = TeacherAttendance.objects.all().order_by('-date')
    serializer_class = TeacherAttendanceSerializer
    permission_classes = [IsAuthenticated]

# teachers/views.py এর ClassHistoryViewSet আপডেট করুন:
class ClassHistoryViewSet(viewsets.ModelViewSet):
    queryset = ClassHistory.objects.all().order_by('-date', '-start_time')
    serializer_class = ClassHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # শুধু লগইন করা টিচারের হিস্ট্রি দেখাবে
        if hasattr(self.request.user, 'teacher_profile'):
            queryset = queryset.filter(teacher=self.request.user.teacher_profile)
        return queryset

    # নতুন: ফর্ম সাবমিট হলে অটোমেটিক লগইন করা টিচারকে সেভ করবে
    def perform_create(self, serializer):
        # চেক করবে লগইন করা ইউজারের টিচার প্রোফাইল আছে কি না (যেমন- আসল টিচার)
        if hasattr(self.request.user, 'teacher_profile'):
            serializer.save(teacher=self.request.user.teacher_profile)
        else:
            # যদি অ্যাডমিন টেস্ট করে, তবে ডাটাবেসের প্রথম টিচারকে ডামি হিসেবে সেভ করবে
            from .models import Teacher
            first_teacher = Teacher.objects.first()
            if first_teacher:
                serializer.save(teacher=first_teacher)
            else:
                raise serializers.ValidationError("No teacher exists in the database to assign this record to.")


# ==================== Teacher ID Card PDF ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_id_card_pdf(request, teacher_id):
    teacher = get_object_or_404(Teacher, id=teacher_id)
    
    # --- QR Code Generation ---
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=4,
        border=0,
    )
    qr_data = f"Name: {teacher.name}\nID: {teacher.teacher_id}\nSubject: {teacher.major_subject.name if teacher.major_subject else 'N/A'}"
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    context = {
        'teacher': teacher,
        'request': request,
        'qr_code': qr_code_base64,
    }
    
    html_string = render_to_string('teachers/id_card_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
    
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="ID_Card_{teacher.teacher_id}.pdf"'
    return response


# 10. Live Class History API for Admin Dashboard
from django.db.models import Max

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def live_class_history(request):
    """Admin dashboard-এ দেখানোর জন্য সাম্প্রতিক ক্লাস হিস্ট্রি"""
    # Get today's class histories plus recent ones
    class_histories = ClassHistory.objects.select_related('teacher', 'subject', 'class_level', 'section').order_by('-date', '-start_time')[:30]
    
    data = []
    for ch in class_histories:
        # Determine status: Running / Ended
        import datetime as dt
        now = dt.datetime.now().time()
        status = 'Ended'
        if ch.end_time and ch.start_time and ch.date == dt.date.today():
            if ch.start_time <= now <= ch.end_time:
                status = 'Running'
        
        data.append({
            'id': str(ch.id),
            'teacher_name': ch.teacher.name,
            'subject_name': ch.subject.name,
            'class_name': ch.class_level.name,
            'section_name': ch.section.name,
            'date': ch.date.isoformat(),
            'start_time': ch.start_time.strftime('%I:%M %p') if ch.start_time else '',
            'end_time': ch.end_time.strftime('%I:%M %p') if ch.end_time else '',
            'topic_covered': ch.topic_covered,
            'status': status,
            'created_at': ch.created_at.isoformat(),
        })
    
    return Response(data)


# ==================== Teacher Appointment Letter PDF ====================

from datetime import date

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_appointment_letter_pdf(request, teacher_id):
    teacher = get_object_or_404(Teacher, id=teacher_id)
    today = date.today()

    context = {
        'teacher': teacher,
        'date': today,
        'request': request,
    }

    html_string = render_to_string('teachers/appointment_letter_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    filename = f"Appointment_Letter_{teacher.name.replace(' ', '_')}.pdf"
    response['Content-Disposition'] = f'inline; filename="{filename}"'
    return response
