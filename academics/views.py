from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q

from .models import ClassLevel, Section, Subject, Group
from .serializers import ClassLevelSerializer, SectionSerializer, SubjectSerializer, GroupSerializer

class ClassLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer

class SectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    
class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('id')
    serializer_class = GroupSerializer

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