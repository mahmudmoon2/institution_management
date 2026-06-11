import uuid
from django.db import models

class JobPosting(models.Model):
    """
    স্কুলের জব সার্কুলার বা নিয়োগ বিজ্ঞপ্তি
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=150)
    description = models.TextField()
    requirements = models.TextField()
    vacancies = models.IntegerField(default=1)
    deadline = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.department}"

class Application(models.Model):
    """
    প্রার্থীদের জমা দেওয়া জব অ্যাপ্লিকেশন
    """
    STATUS_CHOICES = (
        ('Applied', 'Applied'),
        ('Shortlisted', 'Shortlisted'),
        ('Selected', 'Selected'),
        ('Rejected', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    applicant_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    resume = models.FileField(upload_to='resumes/')
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    notes = models.TextField(blank=True, null=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.applicant_name} applied for {self.job.title}"