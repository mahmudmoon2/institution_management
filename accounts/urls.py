from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HeadViewSet, DailyTransactionViewSet, generate_accounts_report_pdf

router = DefaultRouter()
router.register(r'heads', HeadViewSet, basename='head')
router.register(r'transactions', DailyTransactionViewSet, basename='transaction')

urlpatterns = [
    path('report/pdf/', generate_accounts_report_pdf, name='accounts-report-pdf'), # নতুন পাথ
    path('', include(router.urls)),
]