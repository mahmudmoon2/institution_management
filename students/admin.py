from django.contrib import admin
from .models import Student, StudentAttendance, MonthlyAttendanceSummary

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'student_id', 'class_level', 'section', 'roll_number', 'gender', 'guardian_phone', 'is_active')
    search_fields = ('name', 'student_id', 'guardian_phone')
    list_filter = ('is_active', 'gender', 'class_level', 'section', 'group')
    readonly_fields = ('user', 'student_id')

@admin.register(StudentAttendance)
class StudentAttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'status', 'recorded_by')
    list_filter = ('status', 'date')
    search_fields = ('student__name',)
    date_hierarchy = 'date'

@admin.register(MonthlyAttendanceSummary)
class MonthlyAttendanceSummaryAdmin(admin.ModelAdmin):
    list_display = ('student', 'year', 'month', 'present_days', 'absent_days', 'attendance_percentage')
    list_filter = ('year', 'month')
    search_fields = ('student__name',)