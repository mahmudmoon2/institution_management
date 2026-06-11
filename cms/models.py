import uuid
from django.db.models import SlugField
from django.utils.text import slugify
from django.db import models
from students.models import Student   # 👈 যোগ করুন (Student মডেল ইম্পোর্ট)

class HeroSlide(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image = models.ImageField(upload_to='cms/hero_slides/')
    
    title_en = models.CharField(max_length=255)
    title_bn = models.CharField(max_length=255, blank=True, null=True)
    
    subtitle_en = models.TextField()
    subtitle_bn = models.TextField(blank=True, null=True)
    
    cta_button_1_text = models.CharField(max_length=50, blank=True, default="Learn More")
    cta_button_1_link = models.CharField(max_length=200, blank=True, default="/about-us")
    
    cta_button_2_text = models.CharField(max_length=50, blank=True, default="Admission Info")
    cta_button_2_link = models.CharField(max_length=200, blank=True, default="/admissions")
    
    order = models.PositiveIntegerField(default=0, help_text="Order in which slides appear")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title_en


class Notice(models.Model):
    CATEGORY_CHOICES = [
        ('Academic', 'Academic'),
        ('Administrative', 'Administrative'),
        ('Exam', 'Exam'),
        ('Event', 'Event'),
        ('General', 'General'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    title_en = models.CharField(max_length=255)
    title_bn = models.CharField(max_length=255, blank=True, null=True)
    
    description_en = models.TextField()
    description_bn = models.TextField(blank=True, null=True)
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    date = models.DateField(auto_now_add=True)
    
    pdf_file = models.FileField(upload_to='cms/notices/pdfs/', blank=True, null=True) 
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title_en} ({self.category})"


class Event(models.Model):
    STATUS_CHOICES = [
        ('Upcoming', 'Upcoming'),
        ('Past', 'Past')
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    title_en = models.CharField(max_length=255)
    title_bn = models.CharField(max_length=255, blank=True, null=True)
    
    cover_image = models.ImageField(upload_to='cms/events/')
    date_time = models.DateTimeField()
    venue = models.CharField(max_length=255)
    
    description_en = models.TextField()
    description_bn = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Upcoming')
    created_at = models.DateTimeField(auto_now_add=True)
    registration_link = models.URLField(blank=True, null=True, help_text="External registration URL for upcoming events")

    class Meta:
        ordering = ['-date_time']

    def __str__(self):
        return self.title_en


class EventGalleryImage(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to='events/gallery/')
    caption_en = models.CharField(max_length=255, blank=True, help_text="English caption")
    caption_bn = models.CharField(max_length=255, blank=True, help_text="Bengali caption")
    order = models.PositiveIntegerField(default=0, help_text="Sort order")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.event.title_en} - {self.caption_en or 'Image'}"



class EventRegistration(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField(blank=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.event.title_en}"


class FAQ(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    question_en = models.CharField(max_length=255)
    question_bn = models.CharField(max_length=255, blank=True, null=True)
    
    answer_en = models.TextField()
    answer_bn = models.TextField(blank=True, null=True)
    
    category = models.CharField(max_length=100, default='General', help_text="e.g. Admissions, Academic, General")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.question_en


class Blog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title_en = models.CharField(max_length=255)
    title_bn = models.CharField(max_length=255, blank=True, null=True)
    slug = models.SlugField(unique=True, blank=True)
    description_en = models.TextField()
    description_bn = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='cms/blogs/')
    author = models.CharField(max_length=100)
    date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title_en)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title_en


class ContactMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.subject}"