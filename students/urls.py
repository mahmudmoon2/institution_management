from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, StudentAttendanceViewSet, MonthlyAttendanceSummaryViewSet, student_id_card_pdf, attendance_summary, attendance_report_pdf

router = DefaultRouter()
router.register(r'student-attendance', StudentAttendanceViewSet, basename='student-attendance')
router.register(r'monthly-attendance', MonthlyAttendanceSummaryViewSet, basename='monthly-attendance')

# r'list' এর বদলে r'' ব্যবহার করা হলো (সবচেয়ে নিচে রাখবেন)
router.register(r'', StudentViewSet, basename='student') 

urlpatterns = [
    # IMPORTANT: Custom routes MUST come before the router to avoid being swallowed
    path('attendance-summary/', attendance_summary, name='attendance-summary'),
    path('attendance-report/pdf/', attendance_report_pdf, name='attendance-report-pdf'),
    path('id-card/<str:student_id>/pdf/', student_id_card_pdf, name='student-id-card-pdf'),
    path('', include(router.urls)),
]
