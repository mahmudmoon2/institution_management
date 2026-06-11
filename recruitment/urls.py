from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostingViewSet, ApplicationViewSet

router = DefaultRouter()
router.register(r'jobs', JobPostingViewSet, basename='job')
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
]