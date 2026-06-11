import uuid
from django.db import models
from django.conf import settings
from academics.models import Subject

class Teacher(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # [cite: 118]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_profile')
    name = models.CharField(max_length=150) # [cite: 118]
    teacher_id = models.CharField(max_length=50, unique=True) # [cite: 118]
    email = models.EmailField(unique=True) # [cite: 118]
    phone = models.CharField(max_length=20) # [cite: 118]
    photo = models.ImageField(upload_to='teachers/photos/', null=True, blank=True) # [cite: 118]
    major_subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, related_name='teachers') # [cite: 118]
    joining_date = models.DateField() # [cite: 118]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES) # [cite: 118]
    present_address = models.TextField() # [cite: 118]
    permanent_address = models.TextField() # [cite: 118]
    nid_image = models.ImageField(upload_to='teachers/nid/', null=True, blank=True) # [cite: 118]
    is_active = models.BooleanField(default=True) # [cite: 118]
    created_at = models.DateTimeField(auto_now_add=True) # [cite: 118]
    updated_at = models.DateTimeField(auto_now=True) # [cite: 118]

    def __str__(self):
        return f"{self.name} ({self.teacher_id})"
    
# teachers/models.py এর নিচে যোগ করুন
class TeacherAttendance(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('On-Leave', 'On-Leave'),
    )
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('teacher', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.teacher.name} - {self.date} ({self.status})"


class ClassHistory(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='class_histories')
    date = models.DateField()
    subject = models.ForeignKey('academics.Subject', on_delete=models.CASCADE, related_name='class_histories')
    class_level = models.ForeignKey('academics.ClassLevel', on_delete=models.CASCADE)
    section = models.ForeignKey('academics.Section', on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()
    topic_covered = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-start_time']

    def __str__(self):
        return f"{self.teacher.name} - {self.class_level.name} ({self.subject.name}) on {self.date}"