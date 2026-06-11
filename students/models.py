import uuid
from django.db import models
from django.conf import settings
from academics.models import ClassLevel, Section, Group
from teachers.models import Teacher

class Student(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # 
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    name = models.CharField(max_length=150) # 
    student_id = models.CharField(max_length=50, unique=True) # auto-generated roll format 
    
    class_level = models.ForeignKey(ClassLevel, on_delete=models.RESTRICT, related_name='students') # 
    section = models.ForeignKey(Section, on_delete=models.RESTRICT, related_name='students') # 
    roll_number = models.IntegerField() # 
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True, related_name='students') # 
    
    date_of_birth = models.DateField() # 
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES) # 
    blood_group = models.CharField(max_length=10, null=True, blank=True) # 
    religion = models.CharField(max_length=50, null=True, blank=True) # 
    
    present_address = models.TextField() # 
    permanent_address = models.TextField() # 
    
    guardian_name = models.CharField(max_length=150) # 
    guardian_phone = models.CharField(max_length=20) # 
    guardian_email = models.EmailField(null=True, blank=True) # optional 
    guardian_nid_image = models.ImageField(upload_to='guardians/nid/', null=True, blank=True) # 
    
    photo = models.ImageField(upload_to='students/photos/', null=True, blank=True) # 
    guide_teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='guided_students') # 
    
    is_active = models.BooleanField(default=True) # 
    admission_date = models.DateField() # 
    created_at = models.DateTimeField(auto_now_add=True) # 
    updated_at = models.DateTimeField(auto_now=True) # 

    def __str__(self):
        return f"{self.name} - {self.student_id}"
    
    
    
# students/models.py এর নিচে যোগ করুন
class StudentAttendance(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Holiday', 'Holiday'),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES)
    recorded_by = models.ForeignKey('teachers.Teacher', on_delete=models.SET_NULL, null=True, related_name='recorded_student_attendances')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date') # এক দিনে একজন স্টুডেন্টের ডাবল অ্যাটেনডেন্স রোধ করতে
        ordering = ['-date']

    def __str__(self):
        return f"{self.student.name} - {self.date} ({self.status})"


class MonthlyAttendanceSummary(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='monthly_summaries')
    year = models.IntegerField()
    month = models.IntegerField()
    total_days = models.IntegerField(default=0)
    present_days = models.IntegerField(default=0)
    absent_days = models.IntegerField(default=0)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ('student', 'year', 'month')

    def __str__(self):
        return f"{self.student.name} - {self.month}/{self.year} ({self.attendance_percentage}%)"