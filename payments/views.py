from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
import uuid

from weasyprint import HTML

from .models import FeeCategory, PaymentReceipt, PaymentItem
from .serializers import FeeCategorySerializer, PaymentReceiptSerializer


class FeeCategoryViewSet(viewsets.ModelViewSet):
    queryset = FeeCategory.objects.all().order_by('id')
    serializer_class = FeeCategorySerializer
    permission_classes = [IsAuthenticated]


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = PaymentReceipt.objects.all().order_by('-created_at')
    serializer_class = PaymentReceiptSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='bulk-collect')
    def bulk_collect(self, request):
        data = request.data
        student_id = data.get('student')
        categories = data.get('categories', [])
        
        if not student_id or not categories:
            return Response({"error": "Student and categories are required"}, status=400)

        with transaction.atomic():
            # React থেকে আসা বিল, পেমেন্ট এবং ডিউ রিসিভ করা হচ্ছে
            total_bill = data.get('total_bill', sum(float(cat['amount']) for cat in categories))
            amount_paid = data.get('amount_paid', total_bill)
            due_amount = data.get('due_amount', 0.00)
            
            # Master Receipt তৈরি
            receipt = PaymentReceipt.objects.create(
                student_id=student_id,
                total_amount=total_bill,
                amount_paid=amount_paid,
                due_amount=due_amount,
                method=data.get('method', 'Cash'),
                notes=data.get('notes', ''),
                recorded_by=request.user
            )
            
            # Line Items তৈরি
            for cat in categories:
                PaymentItem.objects.create(
                    receipt=receipt,
                    fee_category_id=cat['id'],
                    amount_paid=cat['amount'], # এই আইটেমের বিল
                    month=data.get('month'),
                    year=data.get('year')
                )

        return Response({
            "message": "Payments collected successfully",
            "receipt_number": receipt.receipt_number
        }, status=201)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def receipt_pdf(request, receipt_number):
    receipt_info = get_object_or_404(PaymentReceipt, receipt_number=receipt_number)
    payments = receipt_info.items.all()
    
    context = {
        'receipt_info': receipt_info,
        'payments': payments,
    }
    
    html_string = render_to_string('payments/receipt_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
    
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="receipt_{receipt_number}.pdf"'
    return response