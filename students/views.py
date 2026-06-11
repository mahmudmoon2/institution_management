from datetime import date
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from teachers.models import Teacher,TeacherAttendance
from .models import Student, StudentAttendance
from .serializers import StudentSerializer

# ১. আগের তৈরি করা StudentViewSet
# students/views.py

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('roll_number') # রোল নাম্বার অনুযায়ী সাজানো
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    # নতুন: ক্লাস এবং সেকশন অনুযায়ী ফিল্টার করার লজিক
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # URL এর প্যারামিটার থেকে ডাটা রিসিভ করা
        class_level = self.request.query_params.get('class_level', None)
        section = self.request.query_params.get('section', None)

        # যদি ক্লাস এবং সেকশন পাঠানো হয়, তবে ফিল্টার করবে
        if class_level:
            queryset = queryset.filter(class_level__id=class_level)
        if section:
            queryset = queryset.filter(section__id=section)

        # শুধু অ্যাকটিভ স্টুডেন্টদের দেখাবে
        return queryset.filter(is_active=True)


# ২. ড্যাশবোর্ডের স্ট্যাটস API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    today = date.today()
    
    # কোনো প্যাঁচ ছাড়া সরাসরি Student এবং Teacher মডেলের is_active চেক
    total_students = Student.objects.filter(is_active=True).count()
    total_teachers = Teacher.objects.filter(is_active=True).count()
    
    # আজকের দিনে কতজন প্রেজেন্ট
    students_present = StudentAttendance.objects.filter(date=today, status='Present').count()
    teachers_present = TeacherAttendance.objects.filter(date=today, status='Present').count()
    
    # পার্সেন্টেজ হিসাব করা
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

# ৩. লগইন করা ইউজারের প্রোফাইল নাম বের করার API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_info(request):
    user = request.user
    name = user.username
    
    if user.role == 'TEACHER' and hasattr(user, 'teacher_profile'):
        name = user.teacher_profile.name
    elif user.role == 'STUDENT' and hasattr(user, 'student_profile'):
        name = user.student_profile.name
        
    return Response({"name": name, "role": user.role})

# students/views.py এর নিচে যোগ করুন
from .models import StudentAttendance, MonthlyAttendanceSummary
from .serializers import StudentAttendanceSerializer, MonthlyAttendanceSummarySerializer

class StudentAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StudentAttendance.objects.all().order_by('-date')
    serializer_class = StudentAttendanceSerializer
    permission_classes = [IsAuthenticated]

    # শুধুমাত্র নির্দিষ্ট স্টুডেন্টের অ্যাটেনডেন্স ফিল্টার করার জন্য (ঐচ্ছিক)
    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get('student_id', None)
        if student_id is not None:
            queryset = queryset.filter(student__id=student_id)
        return queryset

class MonthlyAttendanceSummaryViewSet(viewsets.ModelViewSet):
    queryset = MonthlyAttendanceSummary.objects.all().order_by('-year', '-month')
    serializer_class = MonthlyAttendanceSummarySerializer
    permission_classes = [IsAuthenticated]