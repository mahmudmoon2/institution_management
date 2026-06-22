import uuid
from decimal import Decimal
from rest_framework import serializers
from .models import Teacher
from users.models import User
from academics.models import Subject
from payroll.models import PayrollProfile

class TeacherSerializer(serializers.ModelSerializer):
    major_subject_name = serializers.CharField(source='major_subject.name', read_only=True, default='')
    # Explicit PrimaryKeyRelatedField to allow null & empty values
    major_subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        allow_null=True,
        required=False
    )
    photo = serializers.ImageField(required=False, allow_null=True)
    nid_image = serializers.ImageField(required=False, allow_null=True)

    # Payroll fields (write-only — stored in PayrollProfile, not Teacher)
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
        model = Teacher
        fields = '__all__'
        read_only_fields = ('user', 'teacher_id')

    def create(self, validated_data):
        # Extract payroll-only fields before creating Teacher
        payroll_fields = [
            'basic_salary', 'house_rent', 'medical_allowance',
            'transport_allowance', 'other_allowance',
            'provident_fund_pct', 'tax_pct',
            'bank_account_name', 'bank_account_number', 'routing_number',
            'bank_name', 'branch_name',
        ]
        payroll_data = {k: validated_data.pop(k, None) for k in payroll_fields if k in validated_data}

        generated_id = f"TCH-{uuid.uuid4().hex[:4].upper()}"
        
        # টিচারের জন্য একটি ডিফল্ট ইউজার অ্যাকাউন্ট তৈরি করা
        user = User.objects.create_user(
            username=generated_id,
            email=validated_data.get('email', f"{generated_id}@idealacademy.com"),
            password='teacher123',
            role='TEACHER',
            is_active=True
        )
        
        teacher = Teacher.objects.create(
            user=user,
            teacher_id=generated_id,
            **validated_data
        )

        # Auto-create PayrollProfile if salary data provided
        has_salary = any(v for v in [payroll_data.get('basic_salary'), payroll_data.get('bank_account_number')])
        if has_salary:
            PayrollProfile.objects.create(
                employee_type='TEACHER',
                teacher=teacher,
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

        return teacher
    
# teachers/serializers.py এর নিচে যোগ করুন
from .models import TeacherAttendance, ClassHistory

class TeacherAttendanceSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)

    class Meta:
        model = TeacherAttendance
        fields = '__all__'

class ClassHistorySerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = ClassHistory
        fields = '__all__'
        read_only_fields = ('teacher',)