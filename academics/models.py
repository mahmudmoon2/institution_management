import uuid
from django.db import models

class ClassLevel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True) # যেমন: Class 6, Class 10

    def __str__(self):
        return self.name

class Section(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50) # যেমন: Padma, Meghna
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='sections')

    def __str__(self):
        return f"{self.name} ({self.class_level.name})"

class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True) # যেমন: Science, Arts, Commerce

    def __str__(self):
        return self.name

class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


# ===================== WEEKLY CLASS ROUTINE =====================
class ClassRoutine(models.Model):
    """Stores weekly class routine for each class & section"""
    DAY_CHOICES = [
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='routines')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='routines')
    day = models.CharField(max_length=20, choices=DAY_CHOICES)
    period = models.PositiveIntegerField(help_text='Period number (1, 2, 3...)')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='routines')
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.SET_NULL, null=True, blank=True, related_name='routines')
    room_number = models.CharField(max_length=50, blank=True, null=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['class_level', 'section', 'day', 'period']
        unique_together = ('class_level', 'section', 'day', 'period')

    def __str__(self):
        return f"{self.class_level.name} {self.section.name} | {self.day} P{self.period} - {self.subject.name}"