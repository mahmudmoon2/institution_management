from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_change_password(request):
    """Admin can change password of any Teacher/Student by username or user ID"""
    user_id = request.data.get('user_id')
    username = request.data.get('username')
    new_password = request.data.get('new_password')

    if not new_password:
        return Response({"error": "New password is required."}, status=400)

    if len(new_password) < 4:
        return Response({"error": "Password must be at least 4 characters."}, status=400)

    user = None
    if user_id:
        user = User.objects.filter(id=user_id).first()
    elif username:
        user = User.objects.filter(username=username).first()

    if not user:
        return Response({"error": "User not found. Provide user_id or username."}, status=404)

    # Only admin can change passwords
    if request.user.role != 'ADMIN':
        return Response({"error": "Only admins can change passwords."}, status=403)

    user.set_password(new_password)
    user.save()

    return Response({
        "success": True,
        "message": f"Password for {user.get_full_name() or user.username} changed successfully.",
        "username": user.username,
        "role": user.get_role_display(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Search users by username, role for password change"""
    query = request.query_params.get('q', '')
    role = request.query_params.get('role', '')
    
    users = User.objects.all()
    if query:
        users = users.filter(username__icontains=query)
    if role:
        users = users.filter(role=role)
    
    users = users[:30]
    
    data = []
    for u in users:
        name = u.username
        if u.role == 'TEACHER' and hasattr(u, 'teacher_profile'):
            name = u.teacher_profile.name
        elif u.role == 'STUDENT' and hasattr(u, 'student_profile'):
            name = u.student_profile.name
        elif u.role == 'STAFF' and hasattr(u, 'staff_profile'):
            name = u.staff_profile.name
        
        data.append({
            'id': str(u.id),
            'username': u.username,
            'role': u.role,
            'role_display': u.get_role_display(),
            'display_name': name,
            'is_active': u.is_active,
        })
    
    return Response(data)