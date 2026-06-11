import uuid
from rest_framework import serializers
from .models import Student
from users.models import User

class StudentSerializer(serializers.ModelSerializer):
    # ফর্ম থেকে ডাটা পাঠানোর সুবিধার জন্য ক্লাস এবং সেকশনের নামও রিড-অনলি হিসেবে পাঠাবো
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'
        # user এবং student_id আমরা ব্যাকএন্ড থেকে জেনারেট করব, তাই এগুলো read_only
        read_only_fields = ('user', 'student_id')

    # students/serializers.py এর ভেতরে

    def create(self, validated_data):
        # একটি ইউনিক স্টুডেন্ট আইডি জেনারেট করা (যেমন: STU-8F3A)
        generated_id = f"STU-{uuid.uuid4().hex[:4].upper()}"

        # স্টুডেন্টের জন্য একটি ডিফল্ট ইউজার অ্যাকাউন্ট তৈরি করা (is_active=True সহ)
        user = User.objects.create_user(
            username=generated_id,
            password='student123',  # ডিফল্ট পাসওয়ার্ড
            role='STUDENT',
            is_active=True # নিশ্চিত করা যেন ইউজার অ্যাকটিভ থাকে
        )

        # স্টুডেন্ট প্রোফাইল সেভ করা
        student = Student.objects.create(
            user=user,
            student_id=generated_id,
            **validated_data
        )
        return student
    
    # students/serializers.py এর নিচে যোগ করুন
from .models import StudentAttendance, MonthlyAttendanceSummary

class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.name', read_only=True)

    class Meta:
        model = StudentAttendance
        fields = '__all__'

class MonthlyAttendanceSummarySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = MonthlyAttendanceSummary
        fields = '__all__'