from django.contrib import admin
from .models import PayrollProfile, PayrollAttendance, LeaveRequest, Loan, MonthlySalary

@admin.register(PayrollProfile)
class PayrollProfileAdmin(admin.ModelAdmin):
    list_display = ('employee_name', 'employee_type', 'basic_salary', 'house_rent', 'medical_allowance', 'transport_allowance', 'provident_fund_pct', 'tax_pct', 'is_active')
    list_filter = ('employee_type', 'is_active')
    search_fields = ('teacher__name', 'staff__name', 'bank_account_number')
    readonly_fields = ('employee_name',)

@admin.register(PayrollAttendance)
class PayrollAttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'status', 'check_in_time', 'check_out_time')
    list_filter = ('status', 'date')
    search_fields = ('employee__teacher__name', 'employee__staff__name')
    date_hierarchy = 'date'

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'total_days', 'status')
    list_filter = ('leave_type', 'status')
    search_fields = ('employee__teacher__name', 'employee__staff__name', 'reason')
    date_hierarchy = 'start_date'

@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ('employee', 'total_amount', 'monthly_emi', 'remaining_balance', 'loan_date', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('employee__teacher__name', 'employee__staff__name')
    date_hierarchy = 'loan_date'

@admin.register(MonthlySalary)
class MonthlySalaryAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month', 'year', 'basic_salary', 'net_payable', 'payment_status')
    list_filter = ('payment_status', 'year', 'month')
    search_fields = ('employee__teacher__name', 'employee__staff__name')
    readonly_fields = ('net_payable',)