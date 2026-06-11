from rest_framework import serializers
from .models import JobPosting, Application

class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    # অ্যাডমিন ড্যাশবোর্ডে জবের নাম দেখানোর জন্য
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = Application
        fields = '__all__'