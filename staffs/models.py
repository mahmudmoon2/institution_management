import uuid
from django.db import models
from django.conf import settings

class StaffDepartment(models.Model):
    """স্টাফ ডিপার্টমেন্ট (যেমন: Administration, Accounts, Library, Lab, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class StaffDesignation(models.Model):
    """স্টাফ পদবি (যেমন: Accountant, Librarian, Lab Assistant, Office Assistant, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=150, unique=True)
    department = models.ForeignKey(StaffDepartment, on_delete=models.CASCADE, related_name='designations')

    def __str__(self):
        return f"{self.title} ({self.department.name})"


class Staff(models.Model):
    """নন-টিচিং স্টাফ মডেল"""
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('On-Leave', 'On-Leave'),
        ('Terminated', 'Terminated'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='staff_profile', null=True, blank=True)
    staff_id = models.CharField(max_length=50, unique=True)

    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)

    designation = models.ForeignKey(StaffDesignation, on_delete=models.SET_NULL, null=True, related_name='staffs')
    department = models.ForeignKey(StaffDepartment, on_delete=models.SET_NULL, null=True, related_name='staff_members')

    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=10, null=True, blank=True)
    religion = models.CharField(max_length=50, null=True, blank=True)

    present_address = models.TextField()
    permanent_address = models.TextField()

    nid_number = models.CharField(max_length=30, null=True, blank=True)
    nid_image = models.ImageField(upload_to='staffs/nid/', null=True, blank=True)
    photo = models.ImageField(upload_to='staffs/photos/', null=True, blank=True)

    joining_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    notes = models.TextField(blank=True, null=True)

    appointment_letter_generated = models.BooleanField(default=False)
    appointment_letter_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.staff_id} ({self.designation.title if self.designation else 'N/A'})"

    def save(self, *args, **kwargs):
        if not self.staff_id:
            prefix = f"STF-{uuid.uuid4().hex[:4].upper()}"
            self.staff_id = prefix
        super().save(*args, **kwargs)