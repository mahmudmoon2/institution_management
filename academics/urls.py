from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClassLevelViewSet, SectionViewSet, SubjectViewSet, GroupViewSet, 
    ClassRoutineViewSet, class_summary, my_routine_today, my_weekly_routine
)

router = DefaultRouter()
router.register(r'classes', ClassLevelViewSet, basename='classlevel')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'routines', ClassRoutineViewSet, basename='classroutine')

urlpatterns = [
    # রাউটারের আগে কাস্টম API-এর পাথ রাখতে হয়
    path('class-summary/', class_summary, name='class-summary'),
    path('my-routine/today/', my_routine_today, name='my-routine-today'),
    path('my-routine/weekly/', my_weekly_routine, name='my-routine-weekly'),
    path('', include(router.urls)),
]
