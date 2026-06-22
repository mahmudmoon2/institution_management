from django.contrib import admin
from .models import Grade, Exam, SubjectExam, Result, AdmitCard, ClassTest, ClassTestResult

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('name', 'min_percentage', 'max_percentage', 'gpa_value', 'remarks')
    ordering = ('-gpa_value',)

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('name', 'class_level', 'academic_year', 'start_date', 'end_date')
    list_filter = ('academic_year', 'class_level')
    search_fields = ('name',)

@admin.register(SubjectExam)
class SubjectExamAdmin(admin.ModelAdmin):
    list_display = ('exam', 'subject', 'full_marks', 'pass_marks', 'exam_date', 'exam_time')
    list_filter = ('exam',)

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('student', 'exam', 'subject', 'marks_obtained', 'grade')
    list_filter = ('exam', 'grade')
    search_fields = ('student__name',)

@admin.register(AdmitCard)
class AdmitCardAdmin(admin.ModelAdmin):
    list_display = ('student', 'exam', 'is_published', 'generated_at')
    list_filter = ('is_published',)

@admin.register(ClassTest)
class ClassTestAdmin(admin.ModelAdmin):
    list_display = ('topic', 'subject', 'class_level', 'section', 'date', 'max_marks')
    list_filter = ('class_level', 'section')
    search_fields = ('topic',)

@admin.register(ClassTestResult)
class ClassTestResultAdmin(admin.ModelAdmin):
    list_display = ('class_test', 'student', 'marks_obtained')