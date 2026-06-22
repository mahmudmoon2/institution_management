from rest_framework import serializers
from .models import PayrollProfile, PayrollAttendance, LeaveRequest, Loan, MonthlySalary


class PayrollProfileSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(read_only=True)
    employee_type_display = serializers.CharField(source='get_employee_type_display', read_only=True)

    class Meta:
        model = PayrollProfile
        fields = '__all__'


class PayrollAttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.employee_name', read_only=True)

    class Meta:
        model = PayrollAttendance
        fields = '__all__'


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.employee_name', read_only=True)
    total_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveRequest
        fields = '__all__'


class LoanSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.employee_name', read_only=True)

    class Meta:
        model = Loan
        fields = '__all__'


class MonthlySalarySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.employee_name', read_only=True)
    employee_type = serializers.CharField(source='employee.employee_type', read_only=True)
    bank_account_name = serializers.CharField(source='employee.bank_account_name', read_only=True)
    bank_account_number = serializers.CharField(source='employee.bank_account_number', read_only=True)
    routing_number = serializers.CharField(source='employee.routing_number', read_only=True)
    bank_name = serializers.CharField(source='employee.bank_name', read_only=True)
    branch_name = serializers.CharField(source='employee.branch_name', read_only=True)
    gross_pay = serializers.SerializerMethodField()
    total_deductions = serializers.SerializerMethodField()

    class Meta:
        model = MonthlySalary
        fields = '__all__'

    def get_gross_pay(self, obj):
        return (
            obj.basic_salary + obj.house_rent + obj.medical_allowance +
            obj.transport_allowance + obj.other_allowance + obj.bonus
        )

    def get_total_deductions(self, obj):
        return (
            obj.provident_fund_deduction + obj.tax_deduction +
            obj.loan_deduction + obj.unpaid_leave_deduction + obj.other_deduction
        )