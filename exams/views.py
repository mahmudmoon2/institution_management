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
    
    
    
from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from weasyprint import HTML

from .models import SubjectExam, Exam

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_routine_pdf(request):
    exam_id = request.query_params.get('exam_id')
    
    if exam_id:
        routines = SubjectExam.objects.filter(exam_id=exam_id).order_by('exam_date', 'exam_time')
        exam_info = Exam.objects.filter(id=exam_id).first()
    else:
        routines = SubjectExam.objects.all().order_by('exam_date', 'exam_time')
        exam_info = None

    context = {
        'routines': routines,
        'exam_info': exam_info,
        'request': request
    }

    html_string = render_to_string('exams/exam_routine_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    filename = f"Routine_{exam_info.name.replace(' ', '_')}.pdf" if exam_info else "All_Exam_Routines.pdf"
    response['Content-Disposition'] = f'inline; filename="{filename}"'
    
    return response

from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from weasyprint import HTML

from .models import Exam, SubjectExam, Result, Grade
from students.models import Student

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_tabulation_sheet_pdf(request, exam_id):
    exam = Exam.objects.filter(id=exam_id).first()
    if not exam:
        return HttpResponse("Exam not found.", status=404)

    # Get class students ordered by roll number
    students = Student.objects.filter(class_level=exam.class_level).order_by('roll_number')
    
    # Get subjects for this exam
    subject_exams = SubjectExam.objects.filter(exam=exam).order_by('id')
    
    # Get all results for this exam
    results = Result.objects.filter(exam=exam)
    
    # Get all grades ordered highest to lowest
    grades = list(Grade.objects.all().order_by('-gpa_value'))

    tabulation_data = []

    for student in students:
        student_results = results.filter(student=student)
        
        marks_data = []
        total_marks = 0
        total_gpa = 0
        has_failed = False
        
        for sub_exam in subject_exams:
            res = student_results.filter(subject=sub_exam.subject).first()
            if res:
                marks_data.append({
                    'marks': res.marks_obtained,
                    'grade': res.grade.name if res.grade else '-'
                })
                total_marks += res.marks_obtained
                gpa = res.grade.gpa_value if res.grade else 0
                total_gpa += gpa
                if gpa == 0:
                    has_failed = True
            else:
                marks_data.append({
                    'marks': '-',
                    'grade': '-'
                })

        # Calculate Final GPA and Grade
        final_gpa = 0
        final_grade_name = 'N/A'
        
        if len(student_results) < len(subject_exams):
            final_grade_name = 'Incomplete'
        elif has_failed:
            final_grade_name = 'F'
        elif len(subject_exams) > 0:
            avg_gpa = total_gpa / len(subject_exams)
            final_gpa = round(avg_gpa, 2)
            
            # Find matching grade
            for g in grades:
                if g.gpa_value <= avg_gpa:
                    final_grade_name = g.name
                    break
            if final_grade_name == 'N/A':
                 final_grade_name = 'F'

        tabulation_data.append({
            'student': student,
            'marks_data': marks_data,
            'total_marks': total_marks,
            'gpa': f"{final_gpa:.2f}",
            'grade': final_grade_name
        })

    context = {
        'exam': exam,
        'subject_exams': subject_exams,
        'tabulation_data': tabulation_data,
        'request': request
    }

    html_string = render_to_string('exams/tabulation_sheet_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    filename = f"Tabulation_Sheet_{exam.name.replace(' ', '_')}.pdf"
    response['Content-Disposition'] = f'inline; filename="{filename}"'
    
    return response


from django.shortcuts import get_object_or_404
# ... (আগের ইমপোর্টগুলো থাকবেই)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_marksheet_pdf(request, exam_id, student_id):
    exam = get_object_or_404(Exam, id=exam_id)
    student = get_object_or_404(Student, id=student_id)
    
    subject_exams = SubjectExam.objects.filter(exam=exam).order_by('id')
    results = Result.objects.filter(exam=exam, student=student)
    grades = list(Grade.objects.all().order_by('-gpa_value'))
    
    marks_data = []
    total_marks = 0
    total_gpa = 0
    has_failed = False
    
    for sub_exam in subject_exams:
        res = results.filter(subject=sub_exam.subject).first()
        if res:
            gpa_val = res.grade.gpa_value if res.grade else 0
            marks_data.append({
                'subject': sub_exam.subject.name,
                'full_marks': sub_exam.full_marks,
                'pass_marks': sub_exam.pass_marks,
                'obtained': res.marks_obtained,
                'grade': res.grade.name if res.grade else '-',
                'gpa': gpa_val
            })
            total_marks += res.marks_obtained
            total_gpa += gpa_val
            if gpa_val == 0:
                has_failed = True
        else:
            marks_data.append({
                'subject': sub_exam.subject.name,
                'full_marks': sub_exam.full_marks,
                'pass_marks': sub_exam.pass_marks,
                'obtained': '-',
                'grade': '-',
                'gpa': '-'
            })
            
    final_gpa = 0
    final_grade_name = 'N/A'
    
    if len(results) < len(subject_exams):
        final_grade_name = 'Incomplete'
    elif has_failed:
        final_grade_name = 'F'
    elif len(subject_exams) > 0:
        avg_gpa = total_gpa / len(subject_exams)
        final_gpa = round(avg_gpa, 2)
        for g in grades:
            if g.gpa_value <= avg_gpa:
                final_grade_name = g.name
                break
        if final_grade_name == 'N/A':
             final_grade_name = 'F'
             
    context = {
        'exam': exam,
        'student': student,
        'marks_data': marks_data,
        'total_marks': total_marks,
        'gpa': f"{final_gpa:.2f}",
        'grade': final_grade_name,
        'request': request
    }
    
    html_string = render_to_string('exams/marksheet_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    filename = f"Marksheet_{student.student_id}_{exam.name.replace(' ', '_')}.pdf"
    response['Content-Disposition'] = f'inline; filename="{filename}"'
    
    return response

from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from weasyprint import HTML

from .models import Exam, SubjectExam
from students.models import Student

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_admit_cards_pdf(request, exam_id):
    exam = get_object_or_404(Exam, id=exam_id)
    
    # ওই এক্সামের ক্লাসের সকল স্টুডেন্ট রোল নাম্বার অনুযায়ী
    students = Student.objects.filter(class_level=exam.class_level).order_by('roll_number')
    
    # ওই এক্সামের রুটিন
    routine = SubjectExam.objects.filter(exam=exam).order_by('exam_date', 'exam_time')

    context = {
        'exam': exam,
        'students': students,
        'routine': routine,
        'request': request
    }

    html_string = render_to_string('exams/admit_card_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    filename = f"Admit_Cards_{exam.name.replace(' ', '_')}.pdf"
    response['Content-Disposition'] = f'inline; filename="{filename}"'
    
    return response