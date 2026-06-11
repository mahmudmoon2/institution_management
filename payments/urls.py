from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeeCategoryViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'fee-categories', FeeCategoryViewSet, basename='fee-category')

# ডিফল্ট রাউটটি সবার নিচে রাখতে হবে
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]