from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Count, Q

from .models import ClassLevel, Section, Subject, Group, ClassRoutine
from .serializers import ClassLevelSerializer, SectionSerializer, SubjectSerializer, GroupSerializer, ClassRoutineSerializer

class ClassLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer

class SectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        class_id = self.request.query_params.get('class', None)
        if class_id:
            queryset = queryset.filter(class_level_id=class_id)
        return queryset
    
class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('id')
    serializer_class = GroupSerializer


# ===================== CLASS ROUTINE VIEWSET =====================
class ClassRoutineViewSet(viewsets.ModelViewSet):
    queryset = ClassRoutine.objects.all().order_by('class_level', 'section', 'day', 'period')
    serializer_class = ClassRoutineSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated()]  # Admin will use same route with POST/PUT/DELETE

    def get_queryset(self):
        queryset = super().get_queryset()
        class_level = self.request.query_params.get('class_level', None)
        section = self.request.query_params.get('section', None)
        day = self.request.query_params.get('day', None)

        if class_level:
            queryset = queryset.filter(class_level_id=class_level)
        if section:
            queryset = queryset.filter(section_id=section)
        if day:
            queryset = queryset.filter(day=day)

        return queryset


# ===================== STUDENT'S TODAY'S ROUTINE =====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_routine_today(request):
    """Returns today's class routine for the logged-in student"""
    user = request.user
    if user.role != 'STUDENT' or not hasattr(user, 'student_profile'):
        return Response({'error': 'Not a student'}, status=403)

    student = user.student_profile
    today_name = timezone.now().strftime('%A')

    routines = ClassRoutine.objects.filter(
        class_level=student.class_level,
        section=student.section,
        day=today_name,
        is_active=True
    ).order_by('period').select_related('subject', 'teacher')

    data = ClassRoutineSerializer(routines, many=True).data
    return Response({
        'day': today_name,
        'class_level': student.class_level.name,
        'section': student.section.name,
        'periods': data
    })


# ===================== STUDENT WEEKLY ROUTINE =====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_weekly_routine(request):
    """Returns full weekly routine for the logged-in student"""
    user = request.user
    if user.role != 'STUDENT' or not hasattr(user, 'student_profile'):
        return Response({'error': 'Not a student'}, status=403)

    student = user.student_profile

    routines = ClassRoutine.objects.filter(
        class_level=student.class_level,
        section=student.section,
        is_active=True
    ).order_by('day', 'period').select_related('subject', 'teacher')

    # Group by day
    from collections import OrderedDict
    days_order = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    grouped = OrderedDict()
    for d in days_order:
        grouped[d] = []

    for r in routines:
        grouped[r.day].append(ClassRoutineSerializer(r).data)

    return Response({
        'class_level': student.class_level.name,
        'section': student.section.name,
        'weekly_routine': grouped
    })


# ড্যাশবোর্ডের জন্য নতুন Class Summary API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def class_summary(request):
    # ডাটাবেস থেকে সব ক্লাস এবং তাদের অ্যাকটিভ স্টুডেন্টদের সংখ্যা বের করা
    classes = ClassLevel.objects.annotate(
        student_count=Count('students', filter=Q(students__is_active=True))
    ).order_by('id')

    # ফ্রন্টএন্ডের চাহিদামতো ডাটা সাজানো
    summary_data = []
    for cls in classes:
        summary_data.append({
            "class_name": cls.name,
            "student_count": cls.student_count
        })

    return Response(summary_data)
