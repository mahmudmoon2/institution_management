import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from teachers.models import Teacher
from staffs.models import Staff


class EmployeeType(models.TextChoices):
    TEACHER = 'TEACHER', 'Teacher'
    STAFF = 'STAFF', 'Staff'


class PayrollProfile(models.Model):
    """Teacher ও Staff উভয়ের জন্য unified payroll profile — bank info + salary details"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    employee_type = models.CharField(max_length=20, choices=EmployeeType.choices)
    teacher = models.OneToOneField(Teacher, on_delete=models.CASCADE, null=True, blank=True, related_name='payroll_profile')
    staff = models.OneToOneField(Staff, on_delete=models.CASCADE, null=True, blank=True, related_name='payroll_profile')

    bank_account_name = models.CharField(max_length=150)
    bank_account_number = models.CharField(max_length=50)
    routing_number = models.CharField(max_length=50)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    branch_name = models.CharField(max_length=100, null=True, blank=True)

    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    house_rent = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    medical_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    transport_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    other_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    provident_fund_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), help_text="PF deduction percentage (e.g., 10 for 10%)")
    tax_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), help_text="Tax deduction percentage")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def employee_name(self):
        if self.employee_type == 'TEACHER' and self.teacher:
            return self.teacher.name
        elif self.employee_type == 'STAFF' and self.staff:
            return self.staff.name
        return 'Unknown'

    @property
    def total_allowances(self):
        return (self.house_rent + self.medical_allowance +
                self.transport_allowance + self.other_allowance)

    def __str__(self):
        return f"{self.employee_name} ({self.employee_type})"

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(employee_type='TEACHER', teacher__isnull=False, staff__isnull=True) |
                    models.Q(employee_type='STAFF', teacher__isnull=True, staff__isnull=False)
                ),
                name='payroll_employee_type_match'
            )
        ]


class PayrollAttendance(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Half-Day', 'Half-Day'),
    )
    employee = models.ForeignKey(PayrollProfile, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Present')
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.employee_name} - {self.date} ({self.status})"


class LeaveRequest(models.Model):
    LEAVE_TYPE_CHOICES = (
        ('Casual', 'Casual Leave'),
        ('Sick', 'Sick Leave'),
        ('Earned', 'Earned Leave'),
        ('Maternity', 'Maternity Leave'),
        ('Paternity', 'Paternity Leave'),
        ('Unpaid', 'Leave Without Pay'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    employee = models.ForeignKey(PayrollProfile, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def total_days(self):
        return (self.end_date - self.start_date).days + 1

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.employee_name} - {self.leave_type} ({self.start_date} to {self.end_date})"


class Loan(models.Model):
    """Advance Salary / Loan to employees"""
    employee = models.ForeignKey(PayrollProfile, on_delete=models.CASCADE, related_name='loans')
    loan_date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    monthly_emi = models.DecimalField(max_digits=10, decimal_places=2)
    remaining_balance = models.DecimalField(max_digits=10, decimal_places=2)
    purpose = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text="False when fully repaid")
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-loan_date']

    def __str__(self):
        return f"{self.employee.employee_name} - Loan: {self.total_amount} (Remaining: {self.remaining_balance})"


class MonthlySalary(models.Model):
    """Payslip / Monthly salary record"""
    PAYMENT_STATUS_CHOICES = (
        ('Unpaid', 'Unpaid'),
        ('Paid', 'Paid'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(PayrollProfile, on_delete=models.CASCADE, related_name='salaries')
    month = models.IntegerField()
    year = models.IntegerField()

    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    house_rent = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    medical_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    transport_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    other_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    provident_fund_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    loan_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    unpaid_leave_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    other_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    net_payable = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='Unpaid')

    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'month', 'year')
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.employee.employee_name} - {self.month}/{self.year}"

    def calculate_net_salary(self):
        """Net Salary calculated: (basic + all allowances + bonus) - (pf + tax + loan + unpaid leave + other deductions)"""
        gross_pay = (
            self.basic_salary + self.house_rent + self.medical_allowance +
            self.transport_allowance + self.other_allowance + self.bonus
        )
        total_deductions = (
            self.provident_fund_deduction + self.tax_deduction +
            self.loan_deduction + self.unpaid_leave_deduction + self.other_deduction
        )
        self.net_payable = gross_pay - total_deductions
        return self.net_payable