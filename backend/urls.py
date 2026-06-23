from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from users.views import CustomTokenObtainPairView, admin_change_password, search_users

# Import required views
from students.views import current_user_info, dashboard_stats
from students.parent_views import (
    parent_child_profile, parent_attendance_detail, parent_exam_results,
    parent_fees_detail, parent_messages, parent_mark_message_read,
    parent_notices, parent_dashboard_summary, parent_reply_message,
    teacher_student_list, teacher_send_parent_message,
    teacher_conversation_history, teacher_reply_to_conversation
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # ✅ Use custom login view (role validation included)
    path('api/v1/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/me/', current_user_info, name='current_user_info'),
    path('api/v1/dashboard-stats/', dashboard_stats, name='dashboard_stats'),
    path('api/v1/students/', include('students.urls')),
    path('api/v1/academics/', include('academics.urls')),
    path('api/v1/teachers/', include('teachers.urls')),
    path('api/v1/cms/', include('cms.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/exams/', include('exams.urls')),
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/inventory/', include('inventory.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/recruitment/', include('recruitment.urls')),
    path('api/v1/staffs/', include('staffs.urls')),
    path('api/v1/payroll/', include('payroll.urls')),
    path('api/v1/admin/change-password/', admin_change_password, name='admin-change-password'),
    path('api/v1/admin/search-users/', search_users, name='admin-search-users'),
    # Parent Portal API endpoints
    path('api/v1/parent/dashboard/', parent_dashboard_summary, name='parent-dashboard-summary'),
    path('api/v1/parent/child-profile/', parent_child_profile, name='parent-child-profile'),
    path('api/v1/parent/attendance/', parent_attendance_detail, name='parent-attendance'),
    path('api/v1/parent/results/', parent_exam_results, name='parent-results'),
    path('api/v1/parent/fees/', parent_fees_detail, name='parent-fees'),
    path('api/v1/parent/messages/', parent_messages, name='parent-messages'),
    path('api/v1/parent/messages/<uuid:message_id>/read/', parent_mark_message_read, name='parent-mark-message-read'),
    path('api/v1/parent/messages/<uuid:message_id>/reply/', parent_reply_message, name='parent-reply-message'),
    path('api/v1/parent/notices/', parent_notices, name='parent-notices'),
    # Teacher-to-Parent Messaging
    path('api/v1/teacher/students/', teacher_student_list, name='teacher-student-list'),
    path('api/v1/teacher/send-message/', teacher_send_parent_message, name='teacher-send-parent-message'),
    path('api/v1/teacher/conversation/<uuid:student_id>/', teacher_conversation_history, name='teacher-conversation-history'),
    path('api/v1/teacher/conversation/<uuid:message_id>/reply/', teacher_reply_to_conversation, name='teacher-reply-to-conversation'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
