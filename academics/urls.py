from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassLevelViewSet, SectionViewSet, SubjectViewSet

router = DefaultRouter()
router.register(r'classes', ClassLevelViewSet, basename='classlevel')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'subjects', SubjectViewSet, basename='subject')

urlpatterns = [
    path('', include(router.urls)),
]