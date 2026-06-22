from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Head, DailyTransaction
from .serializers import HeadSerializer, DailyTransactionSerializer

from datetime import datetime
from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from weasyprint import HTML

from .models import DailyTransaction
from payments.models import PaymentReceipt

class HeadViewSet(viewsets.ModelViewSet):
    queryset = Head.objects.all().order_by('name')
    serializer_class = HeadSerializer
    permission_classes = [IsAuthenticated]

class DailyTransactionViewSet(viewsets.ModelViewSet):
    queryset = DailyTransaction.objects.all().order_by('-date', '-created_at')
    serializer_class = DailyTransactionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_accounts_report_pdf(request):
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')

    if not start_date_str or not end_date_str:
        return HttpResponse("Please provide both start_date and end_date.", status=400)

    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

    # ১. ম্যানুয়াল ট্রানজেকশন ফেচ করা
    manual_transactions = DailyTransaction.objects.filter(date__range=[start_date, end_date]).order_by('-date')
    
    # ২. স্টুডেন্ট ফি (Payments) ফেচ করা
    fee_payments = PaymentReceipt.objects.filter(payment_date__range=[start_date, end_date]).order_by('-payment_date')

    # ৩. সব ডেটা একটি অভিন্ন লিস্টে (List of Dictionaries) আনা
    all_transactions = []
    
    total_income = 0
    total_expense = 0

    for mt in manual_transactions:
        all_transactions.append({
            'date': mt.date.strftime('%d %b %Y'),
            'transaction_type': mt.transaction_type,
            'head_name': mt.head.name,
            'description': mt.description,
            'reference_number': mt.reference_number,
            'amount': mt.amount
        })
        if mt.transaction_type == 'Income':
            total_income += mt.amount
        else:
            total_expense += mt.amount

    for fp in fee_payments:
        all_transactions.append({
            'date': fp.payment_date.strftime('%d %b %Y'),
            'transaction_type': 'Income',
            'head_name': 'Student Fee Collection',
            'description': f"Fee collected from {fp.student.name}",
            'reference_number': fp.receipt_number,
            'amount': fp.amount_paid
        })
        total_income += fp.amount_paid

    # ডেট অনুযায়ী সর্ট করা
    all_transactions = sorted(all_transactions, key=lambda k: datetime.strptime(k['date'], '%d %b %Y'), reverse=True)

    net_balance = total_income - total_expense

    context = {
        'start_date': start_date.strftime('%d %b %Y'),
        'end_date': end_date.strftime('%d %b %Y'),
        'transactions': all_transactions,
        'total_income': total_income,
        'total_expense': total_expense,
        'net_balance': net_balance,
    }

    # HTML রেন্ডার ও PDF তৈরি
    html_string = render_to_string('accounts/accounts_report_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="Accounts_Report_{start_date_str}_to_{end_date_str}.pdf"'
    
    return response