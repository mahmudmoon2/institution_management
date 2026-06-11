import uuid
from rest_framework import serializers
from .models import Teacher
from users.models import User

class TeacherSerializer(serializers.ModelSerializer):
    major_subject_name = serializers.CharField(source='major_subject.name', read_only=True, default='')

    class Meta:
        model = Teacher
        fields = '__all__'
        read_only_fields = ('user', 'teacher_id')

    # teachers/serializers.py এর ভেতরে

    def create(self, validated_data):
        generated_id = f"TCH-{uuid.uuid4().hex[:4].upper()}"
        
        # টিচারের জন্য একটি ডিফল্ট ইউজার অ্যাকাউন্ট তৈরি করা
        user = User.objects.create_user(
            username=generated_id,
            email=validated_data.get('email', f"{generated_id}@idealacademy.com"), # ইমেইল থাকলে ব্যবহার করবে
            password='teacher123',
            role='TEACHER',
            is_active=True # নিশ্চিত করা যেন ইউজার অ্যাকটিভ থাকে
        )
        
        teacher = Teacher.objects.create(
            user=user,
            teacher_id=generated_id,
            **validated_data
        )
        return teacher
    
# teachers/serializers.py এর নিচে যোগ করুন
from .models import TeacherAttendance, ClassHistory

class TeacherAttendanceSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)

    class Meta:
        model = TeacherAttendance
        fields = '__all__'

class ClassHistorySerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = ClassHistory
        fields = '__all__'
        read_only_fields = ('teacher',)