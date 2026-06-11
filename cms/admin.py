from django.contrib import admin
from django import forms
from django.shortcuts import render, redirect
from django.urls import path
from django.http import HttpResponseRedirect
from django.contrib import messages
from .models import HeroSlide, Notice, Event, FAQ, Blog, ContactMessage, EventGalleryImage, EventRegistration
from students.models import Student

# ========== 1. EventGalleryImage এর জন্য কাস্টম অ্যাডমিন ==========
class EventGalleryImageAdmin(admin.ModelAdmin):
    list_display = ('event', 'caption_en', 'order', 'created_at')
    list_filter = ('event',)
    search_fields = ('caption_en', 'caption_bn')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('add-multiple/', self.add_multiple_view, name='cms_eventgalleryimage_add_multiple'),
        ]
        return custom_urls + urls

    def add_multiple_view(self, request):
        if request.method == 'POST':
            event_id = request.POST.get('event')
            caption_en = request.POST.get('caption_en', '')
            caption_bn = request.POST.get('caption_bn', '')
            order = request.POST.get('order', 0)
            files = request.FILES.getlist('images')  # multiple files

            if not event_id:
                messages.error(request, "Please select an event.")
                return redirect('admin:cms_eventgalleryimage_add_multiple')
            if not files:
                messages.error(request, "Please select at least one image.")
                return redirect('admin:cms_eventgalleryimage_add_multiple')

            try:
                event = Event.objects.get(id=event_id)
            except Event.DoesNotExist:
                messages.error(request, "Selected event does not exist.")
                return redirect('admin:cms_eventgalleryimage_add_multiple')

            for img in files:
                EventGalleryImage.objects.create(
                    event=event,
                    image=img,
                    caption_en=caption_en,
                    caption_bn=caption_bn,
                    order=order
                )
            messages.success(request, f"{len(files)} image(s) uploaded successfully.")
            return redirect('admin:cms_eventgalleryimage_changelist')
        else:
            # GET request: show form
            events = Event.objects.all()
            context = {
                'events': events,
                'title': 'Add Multiple Gallery Images',
                'opts': self.model._meta,
                'app_label': self.model._meta.app_label,
            }
            return render(request, 'admin/cms/eventgalleryimage/add_multiple.html', context)

    def add_view(self, request, form_url='', extra_context=None):
        # Redirect to custom add-multiple view
        return HttpResponseRedirect('../add-multiple/')

admin.site.register(EventGalleryImage, EventGalleryImageAdmin)

# ========== 2. অন্যান্য মডেলের অ্যাডমিন ==========
@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'order', 'is_active')
    list_editable = ('order', 'is_active')

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'category', 'date', 'is_active')
    list_filter = ('category', 'is_active', 'date')
    search_fields = ('title_en', 'title_bn')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'date_time', 'venue', 'status')
    list_filter = ('status',)

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question_en', 'category', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    list_filter = ('category',)

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'author', 'date', 'is_active')
    search_fields = ('title_en', 'author')
    prepopulated_fields = {'slug': ('title_en',)}

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at', 'is_read')
    list_filter = ('is_read',)
    search_fields = ('name', 'email', 'subject')

@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('name', 'event', 'email', 'registered_at')
    list_filter = ('event',)
    search_fields = ('name', 'email', 'phone')
    # No raw_id_fields or student references