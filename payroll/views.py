from datetime import date
from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.db import transaction
from weasyprint import HTML
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import PayrollProfile, PayrollAttendance, LeaveRequest, Loan, MonthlySalary
from .serializers import (
    PayrollProfileSerializer, PayrollAttendanceSerializer,
    LeaveRequestSerializer, LoanSerializer, MonthlySalarySerializer,
)


# 1. Payroll Profile ViewSet
class PayrollProfileViewSet(viewsets.ModelViewSet):
    queryset = PayrollProfile.objects.all().order_by('-created_at')
    serializer_class = PayrollProfileSerializer
    permission_classes = [IsAuthenticated]


# 2. Attendance ViewSet
class PayrollAttendanceViewSet(viewsets.ModelViewSet):
    queryset = PayrollAttendance.objects.all().order_by('-date')
    serializer_class = PayrollAttendanceSerializer
    permission_classes = [IsAuthenticated]


# 3. Leave Request ViewSet
class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all().order_by('-created_at')
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]


# 4. Loan ViewSet
class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all().order_by('-loan_date')
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]


# 5. Monthly Salary ViewSet (with auto-calculation on create)
class MonthlySalaryViewSet(viewsets.ModelViewSet):
    queryset = MonthlySalary.objects.all().order_by('-year', '-month')
    serializer_class = MonthlySalarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee', None)
        month = self.request.query_params.get('month', None)
        year = self.request.query_params.get('year', None)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if month:
            queryset = queryset.filter(month=int(month))
        if year:
            queryset = queryset.filter(year=int(year))
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save(generated_by=self.request.user)
        # Auto-calculate net salary
        instance.calculate_net_salary()
        instance.save(update_fields=['net_payable'])

    def perform_update(self, serializer):
        instance = serializer.save()
        instance.calculate_net_salary()
        instance.save(update_fields=['net_payable'])


# 6. Bulk Generate Monthly Salary for all active employees
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_salary_bulk(request):
    """এক ক্লিকে সব অ্যাকটিভ এমপ্লয়ির জন্য মাসিক স্যালারি জেনারেট করে"""
    month = request.data.get('month')
    year = request.data.get('year')
    bonus = request.data.get('bonus', 0)

    if not month or not year:
        return Response({"error": "Month and Year are required"}, status=400)

    month = int(month)
    year = int(year)
    bonus = Decimal(str(bonus)) if bonus else Decimal('0.00')

    profiles = PayrollProfile.objects.filter(is_active=True)
    total_generated = 0
    skipped = 0

    with transaction.atomic():
        for profile in profiles:
            # Skip if already exists for this month/year
            if MonthlySalary.objects.filter(employee=profile, month=month, year=year).exists():
                skipped += 1
                continue

            # Count unpaid leave days for this month
            unpaid_days = LeaveRequest.objects.filter(
                employee=profile,
                leave_type='Unpaid',
                status='Approved',
                start_date__month=month,
                start_date__year=year,
            ).count()

            # Calculate unpaid leave deduction (daily rate)
            daily_rate = profile.basic_salary / Decimal(30)
            unpaid_deduction = daily_rate * Decimal(unpaid_days)

            # Get active loan EMI
            active_loan = Loan.objects.filter(
                employee=profile,
                is_active=True
            ).first()
            loan_deduction = active_loan.monthly_emi if active_loan else Decimal('0.00')

            # PF and Tax deduction
            pf_deduction = (profile.basic_salary * profile.provident_fund_pct) / Decimal(100)
            tax_deduction = (profile.basic_salary * profile.tax_pct) / Decimal(100)

            salary = MonthlySalary.objects.create(
                employee=profile,
                month=month,
                year=year,
                basic_salary=profile.basic_salary,
                house_rent=profile.house_rent,
                medical_allowance=profile.medical_allowance,
                transport_allowance=profile.transport_allowance,
                other_allowance=profile.other_allowance,
                bonus=bonus,
                provident_fund_deduction=pf_deduction,
                tax_deduction=tax_deduction,
                loan_deduction=loan_deduction,
                unpaid_leave_deduction=unpaid_deduction,
                generated_by=request.user,
            )
            salary.calculate_net_salary()
            salary.save(update_fields=['net_payable'])

            # Deduct loan EMI from remaining balance
            if active_loan and loan_deduction > 0:
                active_loan.remaining_balance -= loan_deduction
                if active_loan.remaining_balance <= 0:
                    active_loan.remaining_balance = Decimal('0.00')
                    active_loan.is_active = False
                active_loan.save(update_fields=['remaining_balance', 'is_active'])

            total_generated += 1

    return Response({
        "message": f"Payroll generated for {total_generated} employees. Skipped: {skipped} (already exists).",
        "generated": total_generated,
        "skipped": skipped,
        "month": month,
        "year": year,
    })


# 7. PDF Payslip Generation
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_payslip_pdf(request, salary_id):
    salary = get_object_or_404(MonthlySalary, id=salary_id)
    today = date.today()

    gross_pay = (
        salary.basic_salary + salary.house_rent + salary.medical_allowance +
        salary.transport_allowance + salary.other_allowance + salary.bonus
    )
    total_deductions = (
        salary.provident_fund_deduction + salary.tax_deduction +
        salary.loan_deduction + salary.unpaid_leave_deduction + salary.other_deduction
    )

    context = {
        'salary': salary,
        'date': today,
        'gross_pay': gross_pay,
        'total_deductions': total_deductions,
        'request': request,
    }

    html_string = render_to_string('payroll/payslip_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    filename = f"Payslip_{salary.employee.employee_name.replace(' ', '_')}_{salary.month}_{salary.year}.pdf"
    response['Content-Disposition'] = f'inline; filename="{filename}"'

    return response


# 8. Full Salary Statement PDF (multi-month)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_salary_statement_pdf(request, employee_id):
    profile = get_object_or_404(PayrollProfile, id=employee_id)
    today = date.today()

    # Get all salary records ordered by year/month
    salaries = MonthlySalary.objects.filter(employee=profile).order_by('-year', '-month')

    statement_data = []
    total_gross = Decimal('0.00')
    total_deductions = Decimal('0.00')
    total_net = Decimal('0.00')
    total_bonus = Decimal('0.00')

    months_names = [
        '', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    for s in salaries:
        gross = s.basic_salary + s.house_rent + s.medical_allowance + s.transport_allowance + s.other_allowance + s.bonus
        deductions = s.provident_fund_deduction + s.tax_deduction + s.loan_deduction + s.unpaid_leave_deduction + s.other_deduction

        statement_data.append({
            'month_name': f"{months_names[s.month]} {s.year}",
            'basic_salary': s.basic_salary,
            'house_rent': s.house_rent,
            'medical_allowance': s.medical_allowance,
            'transport_allowance': s.transport_allowance,
            'other_allowance': s.other_allowance,
            'bonus': s.bonus,
            'gross_pay': gross,
            'pf_deduction': s.provident_fund_deduction,
            'tax_deduction': s.tax_deduction,
            'loan_deduction': s.loan_deduction,
            'unpaid_leave_deduction': s.unpaid_leave_deduction,
            'other_deduction': s.other_deduction,
            'total_deductions': deductions,
            'net_payable': s.net_payable,
            'payment_status': s.payment_status,
        })
        total_gross += gross
        total_deductions += deductions
        total_net += s.net_payable
        total_bonus += s.bonus

    context = {
        'profile': profile,
        'statement_data': statement_data,
        'total_gross': total_gross,
        'total_deductions': total_deductions,
        'total_net': total_net,
        'total_bonus': total_bonus,
        'date': today,
        'request': request,
    }

    html_string = render_to_string('payroll/salary_statement_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    emp_name = profile.employee_name.replace(' ', '_')
    response['Content-Disposition'] = f'inline; filename="Salary_Statement_{emp_name}.pdf"'
    return response


# 9. Collective Institution Salary Statement PDF (monthly/yearly)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_collective_statement_pdf(request):
    month = request.query_params.get('month')
    year = request.query_params.get('year')
    today = date.today()

    months_names = [
        '', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    salaries = MonthlySalary.objects.all().order_by('employee__employee_type', 'employee__teacher__name', 'employee__staff__name')
    
    if month and year:
        month = int(month)
        year = int(year)
        salaries = salaries.filter(month=month, year=year)
        period_label = f"{months_names[month]} {year}"
    elif year:
        year = int(year)
        salaries = salaries.filter(year=year)
        period_label = f"Year {year}"
    else:
        period_label = "All Records"

    statement_data = []
    total_gross = Decimal('0.00')
    total_deductions = Decimal('0.00')
    total_net = Decimal('0.00')
    total_bonus = Decimal('0.00')

    for s in salaries:
        gross = s.basic_salary + s.house_rent + s.medical_allowance + s.transport_allowance + s.other_allowance + s.bonus
        deductions = s.provident_fund_deduction + s.tax_deduction + s.loan_deduction + s.unpaid_leave_deduction + s.other_deduction

        statement_data.append({
            'employee_name': s.employee.employee_name,
            'employee_type': s.employee.get_employee_type_display(),
            'month_name': f"{months_names[s.month]} {s.year}",
            'basic_salary': s.basic_salary,
            'house_rent': s.house_rent,
            'medical_allowance': s.medical_allowance,
            'transport_allowance': s.transport_allowance,
            'other_allowance': s.other_allowance,
            'bonus': s.bonus,
            'gross_pay': gross,
            'pf_deduction': s.provident_fund_deduction,
            'tax_deduction': s.tax_deduction,
            'loan_deduction': s.loan_deduction,
            'unpaid_leave_deduction': s.unpaid_leave_deduction,
            'other_deduction': s.other_deduction,
            'total_deductions': deductions,
            'net_payable': s.net_payable,
            'payment_status': s.payment_status,
        })
        total_gross += gross
        total_deductions += deductions
        total_net += s.net_payable
        total_bonus += s.bonus

    context = {
        'period_label': period_label,
        'statement_data': statement_data,
        'total_gross': total_gross,
        'total_deductions': total_deductions,
        'total_net': total_net,
        'total_bonus': total_bonus,
        'date': today,
        'request': request,
        'total_employees': salaries.values('employee').distinct().count(),
    }

    html_string = render_to_string('payroll/collective_statement_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    filename = f"Institution_Salary_Statement_{period_label.replace(' ', '_')}.pdf"
    response['Content-Disposition'] = f'inline; filename="{filename}"'
    return response
