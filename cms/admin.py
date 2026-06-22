from django.contrib import admin
from .models import HeroSlide, Notice, Event, EventGalleryImage, EventRegistration, FAQ, Blog, ContactMessage

@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('title_en', 'title_bn')

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'category', 'date', 'is_active')
    list_filter = ('category', 'is_active', 'date')
    search_fields = ('title_en', 'title_bn', 'description_en')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'date_time', 'venue', 'status')
    list_filter = ('status',)
    search_fields = ('title_en', 'venue')

@admin.register(EventGalleryImage)
class EventGalleryImageAdmin(admin.ModelAdmin):
    list_display = ('event', 'caption_en', 'order')
    list_filter = ('event',)

@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('event', 'name', 'email', 'phone', 'registered_at')
    search_fields = ('name', 'email', 'phone')

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question_en', 'category', 'order', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('question_en', 'answer_en')

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'author', 'date', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('title_en', 'author')
    prepopulated_fields = {'slug': ('title_en',)}

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'is_read', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('name', 'email', 'subject', 'message')