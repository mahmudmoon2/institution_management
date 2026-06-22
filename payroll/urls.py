from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PayrollProfileViewSet,
    PayrollAttendanceViewSet,
    LeaveRequestViewSet,
    LoanViewSet,
    MonthlySalaryViewSet,
    generate_salary_bulk,
    generate_payslip_pdf,
    generate_salary_statement_pdf,
    generate_collective_statement_pdf,
)

router = DefaultRouter()
router.register(r'profiles', PayrollProfileViewSet, basename='payroll-profile')
router.register(r'attendance', PayrollAttendanceViewSet, basename='payroll-attendance')
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')
router.register(r'loans', LoanViewSet, basename='loan')
router.register(r'salaries', MonthlySalaryViewSet, basename='monthly-salary')

urlpatterns = [
    path('generate-salary/', generate_salary_bulk, name='generate-salary-bulk'),
    path('payslip/<str:salary_id>/pdf/', generate_payslip_pdf, name='payslip-pdf'),
    path('statement/<str:employee_id>/pdf/', generate_salary_statement_pdf, name='salary-statement-pdf'),
    path('collective-statement/pdf/', generate_collective_statement_pdf, name='collective-statement-pdf'),
    path('', include(router.urls)),
]
