from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Staff, StaffDepartment, StaffDesignation
from .serializers import StaffSerializer, StaffDepartmentSerializer, StaffDesignationSerializer

from django.http import HttpResponse
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from weasyprint import HTML
from datetime import date


class StaffDepartmentViewSet(viewsets.ModelViewSet):
    queryset = StaffDepartment.objects.all().order_by('name')
    serializer_class = StaffDepartmentSerializer
    permission_classes = [IsAuthenticated]


class StaffDesignationViewSet(viewsets.ModelViewSet):
    queryset = StaffDesignation.objects.all().order_by('department__name', 'title')
    serializer_class = StaffDesignationSerializer
    permission_classes = [IsAuthenticated]


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().order_by('-joining_date')
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_appointment_letter_pdf(request, staff_id):
    """একজন স্টাফের অ্যাপয়েন্টমেন্ট লেটার PDF জেনারেট করে"""
    staff = get_object_or_404(Staff, id=staff_id)
    today = date.today()

    context = {
        'staff': staff,
        'date': today,
        'request': request,
    }

    html_string = render_to_string('staffs/appointment_letter_pdf.html', context)
    pdf_file = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()

    # Mark appointment letter as generated
    staff.appointment_letter_generated = True
    staff.appointment_letter_date = today
    staff.save(update_fields=['appointment_letter_generated', 'appointment_letter_date'])

    response = HttpResponse(pdf_file, content_type='application/pdf')
    filename = f"Appointment_Letter_{staff.name.replace(' ', '_')}.pdf"
    response['Content-Disposition'] = f'inline; filename="{filename}"'

    return response