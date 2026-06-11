from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Grade, Exam, SubjectExam
from .serializers import GradeSerializer, ExamSerializer, SubjectExamSerializer

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all().order_by('-gpa_value')
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all().order_by('-start_date')
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    # পরীক্ষাটি কে তৈরি করেছে (অ্যাডমিন), তা অটোমেটিক সেভ হবে
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class SubjectExamViewSet(viewsets.ModelViewSet):
    queryset = SubjectExam.objects.all().order_by('exam_date')
    serializer_class = SubjectExamSerializer
    permission_classes = [IsAuthenticated]
    
from .models import Result
from .serializers import ResultSerializer

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all().order_by('-created_at')
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]

    # নতুন রেজাল্ট তৈরি হওয়ার সময়
    def perform_create(self, serializer):
        result_instance = serializer.save(entered_by=self.request.user)
        self._calculate_and_assign_grade(result_instance)
        
    # রেজাল্ট আপডেট (এডিট) করার সময়
    def perform_update(self, serializer):
        result_instance = serializer.save()
        self._calculate_and_assign_grade(result_instance)

    # অটোমেটিক গ্রেড ক্যালকুলেশনের কোর লজিক
    def _calculate_and_assign_grade(self, result):
        try:
            # সাবজেক্টের Full Marks বের করা
            subject_exam = SubjectExam.objects.filter(exam=result.exam, subject=result.subject).first()
            if not subject_exam:
                return
                
            full_marks = subject_exam.full_marks
            
            # শতকরা (Percentage) হিসাব করা
            percentage = (result.marks_obtained / full_marks) * 100
            
            # পার্সেন্টেজের সাথে মিলিয়ে গ্রেড বের করা
            grade = Grade.objects.filter(min_percentage__lte=percentage, max_percentage__gte=percentage).first()
            
            if grade:
                result.grade = grade
                result.save()
        except Exception as e:
            print(f"Error calculating grade for result {result.id}:", e)
            
            
from .models import ClassTest, ClassTestResult
from .serializers import ClassTestSerializer, ClassTestResultSerializer

class ClassTestViewSet(viewsets.ModelViewSet):
    queryset = ClassTest.objects.all().order_by('-date')
    serializer_class = ClassTestSerializer
    permission_classes = [IsAuthenticated]

class ClassTestResultViewSet(viewsets.ModelViewSet):
    queryset = ClassTestResult.objects.all().order_by('-created_at')
    serializer_class = ClassTestResultSerializer
    permission_classes = [IsAuthenticated]