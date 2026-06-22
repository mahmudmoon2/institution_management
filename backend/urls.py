from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from users.views import CustomTokenObtainPairView, admin_change_password, search_users

# Import required views
from students.views import current_user_info, dashboard_stats

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
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
