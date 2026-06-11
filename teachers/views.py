from academics import serializers
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Teacher
from .serializers import TeacherSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all().order_by('-created_at')
    serializer_class = TeacherSerializer
    
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