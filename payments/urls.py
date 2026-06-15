# payments/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeeCategoryViewSet, PaymentViewSet, receipt_pdf

router = DefaultRouter()
router.register(r'fee-categories', FeeCategoryViewSet, basename='fee-category')
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = [
    path('receipt/<str:receipt_number>/pdf/', receipt_pdf, name='receipt-pdf'),
    path('', include(router.urls)),
]