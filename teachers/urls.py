from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet, TeacherAttendanceViewSet, ClassHistoryViewSet

router = DefaultRouter()
router.register(r'teacher-attendance', TeacherAttendanceViewSet, basename='teacher-attendance')
router.register(r'class-history', ClassHistoryViewSet, basename='class-history')

# r'list' এর বদলে r'' ব্যবহার করা হলো (সবচেয়ে নিচে রাখবেন)
router.register(r'', TeacherViewSet, basename='teacher') 

urlpatterns = [
    path('', include(router.urls)),
]