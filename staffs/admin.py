from django.contrib import admin
from .models import StaffDepartment, StaffDesignation, Staff

@admin.register(StaffDepartment)
class StaffDepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(StaffDesignation)
class StaffDesignationAdmin(admin.ModelAdmin):
    list_display = ('title', 'department')
    list_filter = ('department',)
    search_fields = ('title',)

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('name', 'staff_id', 'designation', 'department', 'phone', 'joining_date', 'salary', 'status')
    list_filter = ('status', 'department', 'gender')
    search_fields = ('name', 'staff_id', 'email', 'phone')
    readonly_fields = ('user', 'staff_id')