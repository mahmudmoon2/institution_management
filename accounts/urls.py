from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HeadViewSet, DailyTransactionViewSet

router = DefaultRouter()
router.register(r'heads', HeadViewSet, basename='head')
router.register(r'transactions', DailyTransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]