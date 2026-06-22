import uuid
from decimal import Decimal
from rest_framework import serializers
from .models import Staff, StaffDepartment, StaffDesignation
from users.models import User
from payroll.models import PayrollProfile


class StaffDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffDepartment
        fields = '__all__'


class StaffDesignationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = StaffDesignation
        fields = '__all__'


class StaffSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_title = serializers.CharField(source='designation.title', read_only=True)

    # Payroll fields (write-only — stored in PayrollProfile, not Staff)
    basic_salary = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)
    house_rent = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)
    medical_allowance = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)
    transport_allowance = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)
    other_allowance = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)
    provident_fund_pct = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, write_only=True)
    tax_pct = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, write_only=True)
    bank_account_name = serializers.CharField(required=False, write_only=True)
    bank_account_number = serializers.CharField(required=False, write_only=True)
    routing_number = serializers.CharField(required=False, write_only=True)
    bank_name = serializers.CharField(required=False, write_only=True)
    branch_name = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = Staff
        fields = '__all__'
        read_only_fields = ('user', 'staff_id')

    def create(self, validated_data):
        # Extract payroll-only fields before creating Staff
        payroll_fields = [
            'basic_salary', 'house_rent', 'medical_allowance',
            'transport_allowance', 'other_allowance',
            'provident_fund_pct', 'tax_pct',
            'bank_account_name', 'bank_account_number', 'routing_number',
            'bank_name', 'branch_name',
        ]
        payroll_data = {k: validated_data.pop(k, None) for k in payroll_fields if k in validated_data}

        generated_id = f"STF-{uuid.uuid4().hex[:4].upper()}"

        # Create a user account for staff
        user = User.objects.create_user(
            username=generated_id,
            password='staff123',
            role='STUDENT',  # Using STUDENT role since we don't have a STAFF role; staff uses basic login
            is_active=True
        )

        staff = Staff.objects.create(
            user=user,
            staff_id=generated_id,
            **validated_data
        )

        # Auto-create PayrollProfile if salary data provided
        has_salary = any(v for v in [payroll_data.get('basic_salary'), payroll_data.get('bank_account_number')] if v)
        if has_salary:
            PayrollProfile.objects.create(
                employee_type='STAFF',
                staff=staff,
                basic_salary=payroll_data.get('basic_salary') or Decimal('0.00'),
                house_rent=payroll_data.get('house_rent') or Decimal('0.00'),
                medical_allowance=payroll_data.get('medical_allowance') or Decimal('0.00'),
                transport_allowance=payroll_data.get('transport_allowance') or Decimal('0.00'),
                other_allowance=payroll_data.get('other_allowance') or Decimal('0.00'),
                provident_fund_pct=payroll_data.get('provident_fund_pct') or Decimal('0.00'),
                tax_pct=payroll_data.get('tax_pct') or Decimal('0.00'),
                bank_account_name=payroll_data.get('bank_account_name') or '',
                bank_account_number=payroll_data.get('bank_account_number') or '',
                routing_number=payroll_data.get('routing_number') or '',
                bank_name=payroll_data.get('bank_name') or '',
                branch_name=payroll_data.get('branch_name') or '',
            )

        return staff