from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'student_id', 'class_level', 'section', 'is_active')
    search_fields = ('name', 'student_id', 'guardian_phone')
    list_filter = ('class_level', 'section', 'group', 'is_active')