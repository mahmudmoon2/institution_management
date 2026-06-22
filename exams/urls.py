from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GradeViewSet, 
    ExamViewSet, 
    SubjectExamViewSet, 
    ResultViewSet,
    ClassTestViewSet, 
    ClassTestResultViewSet,
    generate_routine_pdf,
    generate_tabulation_sheet_pdf,
    generate_marksheet_pdf,
    generate_admit_cards_pdf  # <-- এটি ইমপোর্ট করা থাকতে হবে
)

router = DefaultRouter()

# Register ViewSets with unique basenames
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'subject-exams', SubjectExamViewSet, basename='subject-exam')
router.register(r'results', ResultViewSet, basename='result')
router.register(r'class-tests', ClassTestViewSet, basename='class-test')
router.register(r'class-test-results', ClassTestResultViewSet, basename='classtestresult') 

# The empty route must be registered LAST
router.register(r'', ExamViewSet, basename='exam')

urlpatterns = [
    # Custom API routes MUST be placed BEFORE the router.urls inclusion
    path('routine/pdf/', generate_routine_pdf, name='exam-routine-pdf'),
    path('tabulation/pdf/<str:exam_id>/', generate_tabulation_sheet_pdf, name='tabulation-sheet-pdf'),
    path('marksheet/pdf/<str:exam_id>/<str:student_id>/', generate_marksheet_pdf, name='marksheet-pdf'),
    
    # অ্যাডমিট কার্ডের জন্য এই রাউটটি যুক্ত করা হয়েছে
    path('admit-cards/pdf/<str:exam_id>/', generate_admit_cards_pdf, name='admit-cards-pdf'), 
    
    path('', include(router.urls)),
]