from django.contrib import admin
from .models import ClassLevel, Section, Group, Subject, ClassRoutine

@admin.register(ClassLevel)
class ClassLevelAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'class_level')
    list_filter = ('class_level',)
    search_fields = ('name',)

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'class_level')
    list_filter = ('class_level',)
    search_fields = ('name', 'code')

@admin.register(ClassRoutine)
class ClassRoutineAdmin(admin.ModelAdmin):
    list_display = ('class_level', 'section', 'day', 'period', 'subject', 'teacher', 'start_time', 'end_time', 'is_active')
    list_filter = ('class_level', 'section', 'day', 'is_active')
    search_fields = ('class_level__name', 'section__name', 'subject__name', 'teacher__name')
