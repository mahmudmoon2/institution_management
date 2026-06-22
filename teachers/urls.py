from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet, TeacherAttendanceViewSet, ClassHistoryViewSet, teacher_id_card_pdf, teacher_appointment_letter_pdf, live_class_history

router = DefaultRouter()
router.register(r'teacher-attendance', TeacherAttendanceViewSet, basename='teacher-attendance')
router.register(r'class-history', ClassHistoryViewSet, basename='class-history')

# r'list' এর বদলে r'' ব্যবহার করা হলো (সবচেয়ে নিচে রাখবেন)
router.register(r'', TeacherViewSet, basename='teacher') 

urlpatterns = [
    path('id-card/<str:teacher_id>/pdf/', teacher_id_card_pdf, name='teacher-id-card-pdf'),
    path('appointment-letter/<str:teacher_id>/pdf/', teacher_appointment_letter_pdf, name='teacher-appointment-letter-pdf'),
    path('live-class-history/', live_class_history, name='live-class-history'),
    path('', include(router.urls)),
]
