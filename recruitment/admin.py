from django.contrib import admin
from .models import JobPosting, Application

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'vacancies', 'deadline', 'is_active')
    list_filter = ('is_active', 'department')
    search_fields = ('title', 'department', 'description')

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant_name', 'job', 'email', 'phone', 'status', 'applied_at')
    list_filter = ('status', 'job')
    search_fields = ('applicant_name', 'email', 'phone')
    date_hierarchy = 'applied_at'