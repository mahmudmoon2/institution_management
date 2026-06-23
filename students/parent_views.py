from datetime import date, timedelta
from django.db.models import Avg, Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Student, StudentAttendance, MonthlyAttendanceSummary
from exams.models import Result, Exam
from payments.models import PaymentReceipt
from cms.models import Notice
from notifications.models import InternalNotification, ParentMessage, ParentMessageReply


def get_parent_child(request):
    """
    Returns the linked Student object for both STUDENT and PARENT roles.
    - STUDENT role: returns their own student profile
    - PARENT role: username = child's student_id
    """
    parent_user = request.user
    
    if parent_user.role == 'STUDENT':
        # Student viewing their own data as "parent view"
        child = Student.objects.filter(user=parent_user, is_active=True).first()
        return child
    elif parent_user.role == 'PARENT':
        # Dedicated parent account: username = child's student_id
        child = Student.objects.filter(student_id=parent_user.username, is_active=True).first()
        return child
    else:
        return None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_child_profile(request):
    """Returns child's full profile for Parent Dashboard"""
    child = get_parent_child(request)
    if not child:
        return Response({"error": "No linked child found for this account."}, status=404)
    
    # Attendance summary
    today = date.today()
    start_of_month = today.replace(day=1)
    
    attendances_this_month = StudentAttendance.objects.filter(
        student=child, date__gte=start_of_month, date__lte=today
    )
    total_days = attendances_this_month.count()
    present_days = attendances_this_month.filter(status='Present').count()
    absent_days = attendances_this_month.filter(status='Absent').count()
    late_days = attendances_this_month.filter(status='Late').count()
    attendance_pct = round((present_days / total_days) * 100) if total_days > 0 else 0

    # Latest exam result summary
    latest_result = Result.objects.filter(student=child).order_by('-created_at').first()
    latest_grade = latest_result.grade.name if latest_result and latest_result.grade else 'N/A'
    latest_gpa = None
    if latest_result and hasattr(latest_result, 'exam'):
        exam = latest_result.exam
        all_results = Result.objects.filter(student=child, exam=exam)
        if all_results.exists():
            total_gpa = sum(r.grade.gpa_value for r in all_results if r.grade)
            count = sum(1 for r in all_results if r.grade)
            latest_gpa = round(total_gpa / count, 2) if count > 0 else None

    # Fee summary
    total_due = 0
    receipts = PaymentReceipt.objects.filter(student=child).order_by('-created_at')
    if receipts.exists():
        total_due = sum(r.due_amount for r in receipts)
    
    recent_payments = []
    for receipt in receipts[:5]:
        recent_payments.append({
            'id': str(receipt.id),
            'receipt_number': receipt.receipt_number,
            'total_amount': float(receipt.total_amount),
            'amount_paid': float(receipt.amount_paid),
            'due_amount': float(receipt.due_amount),
            'method': receipt.method,
            'date': receipt.created_at.strftime('%d %b %Y'),
            'month': receipt.created_at.strftime('%B %Y'),
            'status': 'Paid' if receipt.due_amount == 0 else 'Due',
        })

    data = {
        'child': {
            'id': str(child.id),
            'name': child.name,
            'student_id': child.student_id,
            'class_name': child.class_level.name if child.class_level else 'N/A',
            'section_name': child.section.name if child.section else 'N/A',
            'roll_number': child.roll_number,
            'group_name': child.group.name if child.group else None,
            'photo': request.build_absolute_uri(child.photo.url) if child.photo else None,
            'date_of_birth': str(child.date_of_birth) if child.date_of_birth else None,
            'gender': child.gender,
            'blood_group': child.blood_group,
            'guardian_name': child.guardian_name,
            'guardian_phone': child.guardian_phone,
        },
        'attendance_summary': {
            'total_days': total_days,
            'present': present_days,
            'absent': absent_days,
            'late': late_days,
            'percentage': attendance_pct,
        },
        'latest_grade': latest_grade,
        'latest_gpa': latest_gpa,
        'total_due': total_due,
        'recent_payments': recent_payments,
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_attendance_detail(request):
    """Returns detailed monthly attendance for the child"""
    child = get_parent_child(request)
    if not child:
        return Response({"error": "No linked child found."}, status=404)
    
    year = int(request.query_params.get('year', date.today().year))
    month = int(request.query_params.get('month', date.today().month))
    
    import calendar
    days_in_month = calendar.monthrange(year, month)[1]
    
    attendance_records = StudentAttendance.objects.filter(
        student=child,
        date__year=year,
        date__month=month
    ).order_by('date')
    
    daily_data = []
    present = absent = late = holiday = 0
    for record in attendance_records:
        daily_data.append({
            'date': str(record.date),
            'day': record.date.day,
            'status': record.status,
        })
        if record.status == 'Present':
            present += 1
        elif record.status == 'Absent':
            absent += 1
        elif record.status == 'Late':
            late += 1
        elif record.status == 'Holiday':
            holiday += 1
    
    total_recorded = len(daily_data)
    percentage = round((present / total_recorded) * 100) if total_recorded > 0 else 0

    monthly = MonthlyAttendanceSummary.objects.filter(
        student=child, year=year, month=month
    ).first()
    
    return Response({
        'year': year,
        'month': month,
        'month_name': calendar.month_name[month],
        'daily_data': daily_data,
        'present': present,
        'absent': absent,
        'late': late,
        'holiday': holiday,
        'total_recorded': total_recorded,
        'percentage': percentage,
        'aggregated': {
            'total_days': monthly.total_days if monthly else total_recorded,
            'present_days': monthly.present_days if monthly else present,
            'absent_days': monthly.absent_days if monthly else absent,
            'percentage': float(monthly.attendance_percentage) if monthly else percentage,
        } if monthly else None,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_exam_results(request):
    """Returns all exam results for the child"""
    child = get_parent_child(request)
    if not child:
        return Response({"error": "No linked child found."}, status=404)
    
    exam_ids = Result.objects.filter(student=child).values_list('exam', flat=True).distinct()
    exams = Exam.objects.filter(id__in=exam_ids).order_by('-start_date')
    
    exam_results = []
    for exam in exams:
        results = Result.objects.filter(student=child, exam=exam).select_related('subject', 'grade')
        
        subjects_data = []
        total_marks = 0
        total_gpa = 0
        gpa_count = 0
        has_failed = False
        
        for r in results:
            subjects_data.append({
                'subject_name': r.subject.name,
                'marks_obtained': r.marks_obtained,
                'grade_name': r.grade.name if r.grade else 'N/A',
                'gpa': r.grade.gpa_value if r.grade else 0,
            })
            total_marks += r.marks_obtained
            if r.grade:
                total_gpa += r.grade.gpa_value
                gpa_count += 1
                if r.grade.gpa_value == 0:
                    has_failed = True
        
        avg_gpa = round(total_gpa / gpa_count, 2) if gpa_count > 0 else 0
        
        exam_results.append({
            'exam_id': str(exam.id),
            'exam_name': exam.name,
            'academic_year': exam.academic_year,
            'start_date': str(exam.start_date),
            'subjects': subjects_data,
            'total_marks': total_marks,
            'average_gpa': avg_gpa,
            'result_status': 'Failed' if has_failed else 'Passed',
        })
    
    return Response({'results': exam_results})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_fees_detail(request):
    """Returns detailed fee/payment history for the child"""
    child = get_parent_child(request)
    if not child:
        return Response({"error": "No linked child found."}, status=404)
    
    receipts = PaymentReceipt.objects.filter(student=child).order_by('-created_at')
    
    payments = []
    total_due = 0
    for receipt in receipts:
        items = []
        for item in receipt.items.all():
            items.append({
                'category_name': item.fee_category.name,
                'amount': float(item.amount_paid),
                'month': item.month,
                'year': item.year,
            })
        
        payments.append({
            'id': str(receipt.id),
            'receipt_number': receipt.receipt_number,
            'total_amount': float(receipt.total_amount),
            'amount_paid': float(receipt.amount_paid),
            'due_amount': float(receipt.due_amount),
            'method': receipt.method,
            'notes': receipt.notes or '',
            'date': receipt.created_at.strftime('%d %b %Y'),
            'items': items,
        })
        total_due += receipt.due_amount
    
    return Response({
        'payments': payments,
        'total_due': total_due,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_messages(request):
    """Returns flat WhatsApp-style conversation for parent"""
    child = get_parent_child(request)
    if not child:
        return Response({"error": "No linked child found."}, status=404)
    
    conversation = _build_flat_conversation(child, request.user, request)
    unread = ParentMessage.objects.filter(student=child, is_read=False).count()
    
    return Response({'conversation': conversation, 'unread_count': unread})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parent_mark_message_read(request, message_id):
    """Mark a specific message as read"""
    msg = get_object_or_404(ParentMessage, id=message_id)
    msg.is_read = True
    msg.save()
    return Response({"success": True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parent_reply_message(request, message_id):
    """Parent/Sender replies — adds reply to existing thread"""
    msg = get_object_or_404(ParentMessage, id=message_id)
    
    reply_body = request.data.get('message_body', '')
    image = request.FILES.get('image', None)
    
    reply = ParentMessageReply.objects.create(
        message=msg,
        sender=request.user,
        message_body=reply_body,
        image=image,
    )
    
    child = Student.objects.filter(
        student_id=request.user.username, is_active=True
    ).first()
    reply_display_name = child.guardian_name or child.name if child else 'You'
    
    return Response({
        'success': True,
        'reply': {
            'id': str(reply.id),
            'sender_name': reply_display_name,
            'sender_role': 'parent',
            'message_body': reply.message_body,
            'image': request.build_absolute_uri(reply.image.url) if reply.image else None,
            'timestamp': reply.created_at.strftime('%d %b %Y, %I:%M %p'),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_notices(request):
    """Returns school notices for parents"""
    child = get_parent_child(request)
    if not child:
        return Response({"error": "No linked child found."}, status=404)
    
    try:
        from cms.models import Notice
        notices = Notice.objects.filter(is_active=True).order_by('-created_at')[:10]
        notice_list = []
        for notice in notices:
            notice_list.append({
                'id': str(notice.id),
                'title': notice.title_en,
                'description': getattr(notice, 'description_en', '') or '',
                'category': getattr(notice, 'category', 'General') or 'General',
                'date': notice.created_at.strftime('%d %b %Y'),
                'created_at': str(notice.created_at),
            })
        return Response({'notices': notice_list})
    except ImportError:
        return Response({'notices': []})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_dashboard_summary(request):
    """Comprehensive dashboard data for parent"""
    child = get_parent_child(request)
    if not child:
        return Response({"error": "No linked child found for this account."}, status=404)
    
    today = date.today()
    start_of_month = today.replace(day=1)
    
    attendances_this_month = StudentAttendance.objects.filter(
        student=child, date__gte=start_of_month, date__lte=today
    )
    total_days = attendances_this_month.count()
    present_days = attendances_this_month.filter(status='Present').count()
    absent_days = attendances_this_month.filter(status='Absent').count()
    late_days = attendances_this_month.filter(status='Late').count()
    attendance_pct = round((present_days / total_days) * 100) if total_days > 0 else 0

    latest_result = Result.objects.filter(student=child).order_by('-created_at').first()
    latest_grade = latest_result.grade.name if latest_result and latest_result.grade else 'N/A'
    latest_gpa = None
    if latest_result:
        exam = latest_result.exam
        all_results = Result.objects.filter(student=child, exam=exam)
        if all_results.exists():
            total_gpa = sum(r.grade.gpa_value for r in all_results if r.grade)
            count = sum(1 for r in all_results if r.grade)
            latest_gpa = round(total_gpa / count, 2) if count > 0 else None

    receipts = PaymentReceipt.objects.filter(student=child).order_by('-created_at')
    total_due = sum(r.due_amount for r in receipts) if receipts.exists() else 0
    
    recent_payments = []
    for receipt in receipts[:5]:
        recent_payments.append({
            'id': str(receipt.id),
            'receipt_number': receipt.receipt_number,
            'total_amount': float(receipt.total_amount),
            'amount_paid': float(receipt.amount_paid),
            'due_amount': float(receipt.due_amount),
            'method': receipt.method,
            'date': receipt.created_at.strftime('%d %b %Y'),
            'month': receipt.created_at.strftime('%B %Y'),
            'status': 'Paid' if receipt.due_amount == 0 else 'Due',
        })

    data = {
        'child': {
            'id': str(child.id),
            'name': child.name,
            'student_id': child.student_id,
            'class_name': child.class_level.name if child.class_level else 'N/A',
            'section_name': child.section.name if child.section else 'N/A',
            'roll_number': child.roll_number,
            'group_name': child.group.name if child.group else None,
            'photo': request.build_absolute_uri(child.photo.url) if child.photo else None,
            'date_of_birth': str(child.date_of_birth) if child.date_of_birth else None,
            'gender': child.gender,
            'blood_group': child.blood_group,
            'guardian_name': child.guardian_name,
            'guardian_phone': child.guardian_phone,
        },
        'attendance_summary': {
            'total_days': total_days,
            'present': present_days,
            'absent': absent_days,
            'late': late_days,
            'percentage': attendance_pct,
        },
        'latest_grade': latest_grade,
        'latest_gpa': latest_gpa,
        'total_due': total_due,
        'recent_payments': recent_payments,
    }

    # Add latest notices
    try:
        from cms.models import Notice
        latest_notices = Notice.objects.filter(is_active=True).order_by('-created_at')[:5]
        notice_list = []
        for notice in latest_notices:
            notice_list.append({
                'id': str(notice.id),
                'title': notice.title_en,
                'category': getattr(notice, 'category', 'General') or 'General',
                'date': notice.created_at.strftime('%d %b %Y'),
            })
        data['notices'] = notice_list
    except ImportError:
        data['notices'] = []

    # Unread messages count (ParentMessage)
    unread = ParentMessage.objects.filter(
        student=child, is_read=False
    ).count()
    data['unread_messages'] = unread

    return Response(data)


# ========== HELPER: Build flat WhatsApp-style conversation ==========

def _resolve_sender_name(sender, current_user, guardian_name):
    """Resolve display name for a message sender."""
    if sender == current_user:
        return 'You'
    if sender.role == 'TEACHER' and hasattr(sender, 'teacher_profile'):
        return sender.teacher_profile.name
    if sender.role in ('STUDENT', 'PARENT'):
        return guardian_name
    return sender.get_full_name() or sender.username


def _resolve_sender_role(sender, current_user):
    """Resolve role: 'teacher' or 'parent' for bubble alignment."""
    if sender == current_user:
        return 'teacher' if current_user.role == 'TEACHER' else 'parent'
    if sender.role == 'TEACHER':
        return 'teacher'
    return 'parent'


def _build_flat_conversation(student, current_user, request):
    """Returns flat time-ordered message list from all threads + replies (oldest first)."""
    guardian_name = student.guardian_name or student.name
    messages = ParentMessage.objects.filter(student=student).prefetch_related('replies').select_related('sender')
    
    all_items = []
    for msg in messages:
        all_items.append((msg.created_at, {
            'id': str(msg.id),
            'sender_name': _resolve_sender_name(msg.sender, current_user, guardian_name),
            'sender_role': _resolve_sender_role(msg.sender, current_user),
            'message_body': msg.message_body,
            'image': request.build_absolute_uri(msg.image.url) if msg.image else None,
            'timestamp': msg.created_at.strftime('%d %b %Y, %I:%M %p'),
            'is_read': msg.is_read,
            'is_root': True,
        }))
        for reply in msg.replies.all():
            all_items.append((reply.created_at, {
                'id': str(reply.id),
                'sender_name': _resolve_sender_name(reply.sender, current_user, guardian_name),
                'sender_role': _resolve_sender_role(reply.sender, current_user),
                'message_body': reply.message_body,
                'image': request.build_absolute_uri(reply.image.url) if reply.image else None,
                'timestamp': reply.created_at.strftime('%d %b %Y, %I:%M %p'),
                'is_read': True,
                'is_root': False,
            }))
    
    all_items.sort(key=lambda x: x[0])  # oldest first
    return [item[1] for item in all_items]


# ========== TEACHER-TO-PARENT MESSAGING APIs ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_student_list(request):
    """Returns ALL active students for a teacher to select and message parents"""
    user = request.user
    if user.role != 'TEACHER':
        return Response({"error": "Only teachers can access this."}, status=403)
    
    # ALL active students — teacher can message any parent
    students = Student.objects.filter(
        is_active=True
    ).select_related('class_level', 'section').order_by('class_level', 'roll_number')
    
    student_list = []
    for s in students:
        student_list.append({
            'id': str(s.id),
            'name': s.name,
            'student_id': s.student_id,
            'class_name': s.class_level.name if s.class_level else '',
            'section_name': s.section.name if s.section else '',
            'roll_number': s.roll_number,
            'guardian_name': s.guardian_name,
            'guardian_phone': s.guardian_phone,
            'photo': request.build_absolute_uri(s.photo.url) if s.photo else None,
        })
    
    return Response({'students': student_list})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_send_parent_message(request):
    """Teacher sends a message (text + optional image) to a student's parent"""
    user = request.user
    if user.role != 'TEACHER':
        return Response({"error": "Only teachers can send messages."}, status=403)
    
    student_id = request.data.get('student_id')
    message_body = request.data.get('message_body', '')
    image = request.FILES.get('image', None)
    
    if not student_id:
        return Response({"error": "student_id is required."}, status=400)
    
    try:
        student = Student.objects.get(id=student_id, is_active=True)
    except Student.DoesNotExist:
        return Response({"error": "Student not found."}, status=404)
    
    # একই student + teacher combo-র জন্য একটি মাত্র thread থাকবে
    # আগের thread থাকলে সেখানে reply হিসেবে যুক্ত হবে
    existing_thread = ParentMessage.objects.filter(
        student=student
    ).order_by('created_at').first()
    
    if existing_thread:
        # Reply হিসেবে যুক্ত করুন
        reply = ParentMessageReply.objects.create(
            message=existing_thread,
            sender=user,
            message_body=message_body,
            image=image,
        )
        return Response({
            'success': True,
            'is_reply': True,
            'thread_id': str(existing_thread.id),
            'reply': {
                'id': str(reply.id),
                'sender_name': user.teacher_profile.name if hasattr(user, 'teacher_profile') else user.get_full_name(),
                'sender_role': 'teacher',
                'message_body': reply.message_body,
                'image': request.build_absolute_uri(reply.image.url) if reply.image else None,
                'created_at': reply.created_at.strftime('%d %b %Y, %I:%M %p'),
            }
        })
    else:
        msg = ParentMessage.objects.create(
            student=student,
            sender=user,
            message_body=message_body,
            image=image,
        )
        return Response({
            'success': True,
            'is_reply': False,
            'thread_id': str(msg.id),
            'message': {
                'id': str(msg.id),
                'student_name': student.name,
                'message_body': msg.message_body,
                'image': request.build_absolute_uri(msg.image.url) if msg.image else None,
                'created_at': msg.created_at.strftime('%d %b %Y, %I:%M %p'),
            }
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_conversation_history(request, student_id):
    """Teacher gets full WhatsApp-style flat conversation history"""
    user = request.user
    if user.role != 'TEACHER':
        return Response({"error": "Only teachers can access this."}, status=403)
    
    try:
        student = Student.objects.get(id=student_id, is_active=True)
    except Student.DoesNotExist:
        return Response({"error": "Student not found."}, status=404)
    
    conversation = _build_flat_conversation(student, user, request)
    
    return Response({
        'student': {
            'id': str(student.id),
            'name': student.name,
            'student_id': student.student_id,
            'class_name': student.class_level.name if student.class_level else '',
            'section_name': student.section.name if student.section else '',
            'photo': request.build_absolute_uri(student.photo.url) if student.photo else None,
            'guardian_name': student.guardian_name,
            'guardian_phone': student.guardian_phone,
        },
        'conversation': conversation,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teacher_reply_to_conversation(request, message_id):
    """Teacher replies to a conversation thread"""
    user = request.user
    if user.role != 'TEACHER':
        return Response({"error": "Only teachers can reply."}, status=403)
    
    msg = get_object_or_404(ParentMessage, id=message_id)
    
    reply_body = request.data.get('message_body', '')
    image = request.FILES.get('image', None)
    
    reply = ParentMessageReply.objects.create(
        message=msg,
        sender=user,
        message_body=reply_body,
        image=image,
    )
    
    return Response({
        'success': True,
        'reply': {
            'id': str(reply.id),
            'sender_name': 'You (Teacher)',
            'sender_role': 'teacher',
            'message_body': reply.message_body,
            'image': request.build_absolute_uri(reply.image.url) if reply.image else None,
            'timestamp': reply.created_at.strftime('%d %b %Y, %I:%M %p'),
        }
    })
