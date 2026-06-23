from datetime import date
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from weasyprint import HTML
import qrcode
import base64
from io import BytesIO
from weasyprint import HTML
from teachers.models import Teacher, TeacherAttendance
from academics.models import ClassLevel
from .models import Student, StudentAttendance, MonthlyAttendanceSummary
from .serializers import StudentSerializer, StudentAttendanceSerializer, MonthlyAttendanceSummarySerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('roll_number')
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        class_level = self.request.query_params.get('class_level', None)
        section = self.request.query_params.get('section', None)

        if class_level:
            queryset = queryset.filter(class_level__id=class_level)
        if section:
            queryset = queryset.filter(section__id=section)

        return queryset


class StudentAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StudentAttendance.objects.all().order_by('-date')
    serializer_class = StudentAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get('student_id', None)
        date_param = self.request.query_params.get('date', None)
        if student_id is not None:
            queryset = queryset.filter(student__id=student_id)
        if date_param and date_param != '':
            queryset = queryset.filter(date=date_param)
        return queryset


class MonthlyAttendanceSummaryViewSet(viewsets.ModelViewSet):
    queryset = MonthlyAttendanceSummary.objects.all().order_by('-year', '-month')
    serializer_class = MonthlyAttendanceSummarySerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    today = date.today()
    
    total_students = Student.objects.filter(is_active=True).count()
    total_teachers = Teacher.objects.filter(is_active=True).count()
    
    students_present = StudentAttendance.objects.filter(date=today, status='Present').count()
    teachers_present = TeacherAttendance.objects.filter(date=today, status='Present').count()
    
    student_percentage = round((students_present / total_students) * 100) if total_students > 0 else 0
    teacher_percentage = round((teachers_present / total_teachers) * 100) if total_teachers > 0 else 0

    return Response({
        "total_students": total_students,
        "total_teachers": total_teachers,
        "students_present": students_present,
        "teachers_present": teachers_present,
        "student_percentage": student_percentage,
        "teacher_percentage": teacher_percentage,
        "chartData": [
            {"name": "Jan", "revenue": 40000, "students": 1000},
            {"name": "Feb", "revenue": 45000, "students": 1050},
            {"name": "Mar", "revenue": 42000, "students": 1100},
            {"name": "Apr", "revenue": 50000, "students": 1120},
            {"name": "May", "revenue": 48000, "students": 1150},
            {"name": "Jun", "revenue": 55000, "students": 1200},
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_info(request):
    user = request.user
    name = user.get_full_name().strip() or user.username  # fallback to username
    
    if user.role == 'TEACHER':
        from teachers.models import Teacher
        teacher = Teacher.objects.filter(user=user).first()
        if teacher:
            name = teacher.name
    elif user.role == 'STUDENT' and hasattr(user, 'student_profile'):
        name = user.student_profile.name
    elif user.role == 'ADMIN':
        name = user.get_full_name().strip() or user.first_name or user.username
    elif user.role == 'STAFF':
        from staffs.models import Staff
        staff = Staff.objects.filter(user=user).first()
        if staff:
            name = staff.name
    elif user.role == 'PARENT':
        # Parent username = child's student_id, resolve to guardian name
        from students.models import Student
        child = Student.objects.filter(student_id=user.username, is_active=True).first()
        if child:
            name = child.guardian_name or child.name
    
    role_display = user.get_role_display()
    return Response({"name": name, "role": role_display})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_id_card_pdf(request, student_id):
    student = get_object_or_404(Student, student_id=student_id)
    
    # --- QR Code জেনারেশন লজিক ---
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=4,
        border=0,
    )
    # QR কোডে স্টুডেন্টের বেসিক ইনফো বা লিংক দিতে পারেন
    qr_data = f"Name: {student.name}\nID: {student.student_id}\nBlood: {student.blood_group}"
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
    # --------------------------------
    
    context = {
        'student': student,
        'request': request,
        'qr_code': qr_code_base64 # HTML-এ পাঠানোর জন্য
    }
    
    html_string = render_to_string('students/id_card_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
    
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="ID_Card_{student.student_id}.pdf"'
    
    return response


# ==================== Attendance Summary API for Admin ====================

from django.db.models import Count, Q

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_summary(request):
    """Admin dashboard-এ দেখানোর জন্য আজকের attendance summary"""
    today = date.today()
    date_param = request.query_params.get('date', str(today))
    
    try:
        target_date = date.fromisoformat(date_param)
    except ValueError:
        target_date = today

    # Get all active students
    total_active = Student.objects.filter(is_active=True).count()
    
    # Get today's attendance
    today_attendance = StudentAttendance.objects.filter(date=target_date)
    
    present_count = today_attendance.filter(status='Present').count()
    absent_count = today_attendance.filter(status='Absent').count()
    late_count = today_attendance.filter(status='Late').count()
    holiday_count = today_attendance.filter(status='Holiday').count()
    recorded_count = today_attendance.count()
    unrecorded = total_active - recorded_count

    # Class-wise breakdown
    class_breakdown = []
    class_levels = ClassLevel.objects.all()
    for cls in class_levels:
        total_in_class = Student.objects.filter(class_level=cls, is_active=True).count()
        present_in_class = today_attendance.filter(student__class_level=cls, status='Present').count()
        absent_in_class = today_attendance.filter(student__class_level=cls, status='Absent').count()
        late_in_class = today_attendance.filter(student__class_level=cls, status='Late').count()
        recorded_in_class = today_attendance.filter(student__class_level=cls).count()
        
        if total_in_class > 0:
            class_breakdown.append({
                'class_name': cls.name,
                'total_students': total_in_class,
                'present': present_in_class,
                'absent': absent_in_class,
                'late': late_in_class,
                'recorded': recorded_in_class,
                'unrecorded': total_in_class - recorded_in_class,
            })

    return Response({
        'date': str(target_date),
        'total_active_students': total_active,
        'present': present_count,
        'absent': absent_count,
        'late': late_count,
        'holiday': holiday_count,
        'recorded': recorded_count,
        'unrecorded': unrecorded,
        'class_breakdown': class_breakdown,
    })


# ==================== Attendance Report PDF ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_report_pdf(request):
    """Admin attendance report PDF for a given date & optional class"""
    date_param = request.query_params.get('date', str(date.today()))
    class_id = request.query_params.get('class_level', None)
    
    try:
        target_date = date.fromisoformat(date_param)
    except ValueError:
        target_date = date.today()

    attendance_records = StudentAttendance.objects.filter(date=target_date).select_related('student__class_level', 'student__section')
    
    if class_id:
        attendance_records = attendance_records.filter(student__class_level_id=class_id)
    
    attendance_records = attendance_records.order_by('student__class_level__name', 'student__roll_number')

    total = attendance_records.count()
    present_count = attendance_records.filter(status='Present').count()
    absent_count = attendance_records.filter(status='Absent').count()
    late_count = attendance_records.filter(status='Late').count()

    context = {
        'date': target_date,
        'records': attendance_records,
        'total': total,
        'present_count': present_count,
        'absent_count': absent_count,
        'late_count': late_count,
        'request': request,
    }

    html_string = render_to_string('students/attendance_report_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="Attendance_Report_{target_date}.pdf"'
    return response
