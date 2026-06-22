from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassLevelViewSet, SectionViewSet, SubjectViewSet, GroupViewSet, class_summary

router = DefaultRouter()
router.register(r'classes', ClassLevelViewSet, basename='classlevel')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    # রাউটারের আগে কাস্টম API-এর পাথ রাখতে হয়
    path('class-summary/', class_summary, name='class-summary'),
    path('', include(router.urls)),
]