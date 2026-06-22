from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StaffViewSet,
    StaffDepartmentViewSet,
    StaffDesignationViewSet,
    generate_appointment_letter_pdf,
)

router = DefaultRouter()
router.register(r'designations', StaffDesignationViewSet, basename='staff-designation')
router.register(r'departments', StaffDepartmentViewSet, basename='staff-department')
router.register(r'', StaffViewSet, basename='staff')

urlpatterns = [
    path('appointment-letter/<str:staff_id>/pdf/', generate_appointment_letter_pdf, name='appointment-letter-pdf'),
    path('', include(router.urls)),
]