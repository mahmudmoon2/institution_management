import uuid
from rest_framework import serializers
from .models import Student, StudentAttendance, MonthlyAttendanceSummary
from users.models import User

class StudentSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ('user', 'student_id')

    def create(self, validated_data):
        generated_id = f"STU-{uuid.uuid4().hex[:4].upper()}"

        user = User.objects.create_user(
            username=generated_id,
            password='student123',
            role='STUDENT',
            is_active=True
        )

        student = Student.objects.create(
            user=user,
            student_id=generated_id,
            **validated_data
        )
        return student


class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    student_class_name = serializers.CharField(source='student.class_level.name', read_only=True)
    student_class_id = serializers.CharField(source='student.class_level.id', read_only=True)
    student_section_name = serializers.CharField(source='student.section.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.name', read_only=True)

    class Meta:
        model = StudentAttendance
        fields = '__all__'


class MonthlyAttendanceSummarySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = MonthlyAttendanceSummary
        fields = '__all__'