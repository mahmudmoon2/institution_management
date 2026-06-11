from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, StudentAttendanceViewSet, MonthlyAttendanceSummaryViewSet

router = DefaultRouter()
router.register(r'student-attendance', StudentAttendanceViewSet, basename='student-attendance')
router.register(r'monthly-attendance', MonthlyAttendanceSummaryViewSet, basename='monthly-attendance')

# r'list' এর বদলে r'' ব্যবহার করা হলো (সবচেয়ে নিচে রাখবেন)
router.register(r'', StudentViewSet, basename='student') 

urlpatterns = [
    path('', include(router.urls)),
]