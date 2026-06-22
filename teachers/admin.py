from django.contrib import admin
from .models import Teacher, TeacherAttendance, ClassHistory

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('name', 'teacher_id', 'major_subject', 'email', 'phone', 'joining_date', 'is_active')
    search_fields = ('name', 'teacher_id', 'email', 'phone')
    list_filter = ('is_active', 'gender', 'major_subject')
    readonly_fields = ('user', 'teacher_id')

@admin.register(TeacherAttendance)
class TeacherAttendanceAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'date', 'status')
    list_filter = ('status', 'date')
    search_fields = ('teacher__name',)
    date_hierarchy = 'date'

@admin.register(ClassHistory)
class ClassHistoryAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'subject', 'class_level', 'section', 'date', 'topic_covered')
    list_filter = ('class_level', 'section', 'date')
    search_fields = ('teacher__name', 'subject__name', 'topic_covered')
    date_hierarchy = 'date'