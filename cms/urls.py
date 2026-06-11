from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HeroSlideViewSet, NoticeViewSet, EventViewSet, FAQViewSet,
    BlogViewSet, ContactMessageViewSet
)

router = DefaultRouter()
router.register(r'hero-slides', HeroSlideViewSet)
router.register(r'notices', NoticeViewSet)
router.register(r'events', EventViewSet)
router.register(r'faqs', FAQViewSet)
router.register(r'blogs', BlogViewSet)
router.register(r'contact', ContactMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]