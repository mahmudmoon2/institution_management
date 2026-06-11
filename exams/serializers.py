from rest_framework import serializers
from .models import Grade, Exam, SubjectExam

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'

class SubjectExamSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = SubjectExam
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    # পরীক্ষার আন্ডারে থাকা সাবজেক্টগুলো একসাথেই দেখানোর জন্য
    subject_exams = SubjectExamSerializer(many=True, read_only=True)
    
    class Meta:
        model = Exam
        fields = '__all__'
        read_only_fields = ['created_by']
        
        
from .models import Result # ফাইলের উপরে Result ইম্পোর্ট করে নেবেন

class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_str = serializers.CharField(source='student.student_id', read_only=True)
    grade_name = serializers.CharField(source='grade.name', read_only=True, default="-")

    class Meta:
        model = Result
        fields = '__all__'
        read_only_fields = ['entered_by']
        
        
from .models import ClassTest, ClassTestResult

class ClassTestSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = ClassTest
        fields = '__all__'

class ClassTestResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = ClassTestResult
        fields = '__all__'