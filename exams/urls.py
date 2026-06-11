from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GradeViewSet, ExamViewSet, SubjectExamViewSet, ResultViewSet
from .views import ClassTestViewSet, ClassTestResultViewSet

router = DefaultRouter()

# নির্দিষ্ট নামের রাউটগুলো আগে রেজিস্টার করতে হবে
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'subject-exams', SubjectExamViewSet, basename='subject-exam')
router.register(r'results', ResultViewSet, basename='result')
router.register(r'class-tests', ClassTestViewSet, basename='class-test')
router.register(r'class-test-results', ClassTestResultViewSet, basename='class-test-result')

# ডিফল্ট বা ব্ল্যাঙ্ক রাউটটি (r'') সবসময় সবার শেষে রাখতে হয়!
router.register(r'', ExamViewSet, basename='exam')

urlpatterns = [
    path('', include(router.urls)),
]