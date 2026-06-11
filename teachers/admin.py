from django.contrib import admin
from .models import Teacher

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('name', 'teacher_id', 'major_subject', 'phone', 'is_active')
    search_fields = ('name', 'teacher_id', 'phone')
    list_filter = ('is_active', 'gender', 'major_subject')