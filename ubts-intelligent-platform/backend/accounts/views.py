from django.conf import settings
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import User
from .serializers import RegisterSerializer, UserSerializer


@api_view(["POST"])
@csrf_exempt
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        login(request, user)

        return Response(
            {
                "message": "Registration successful",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user = authenticate(request, username=email, password=password)

    if user is not None:
        login(request, user)
        return Response(
            {
                "message": "Login successful",
                "user": UserSerializer(user).data,
            }
        )

    return Response(
        {"error": "Invalid email or password"},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Logout successful"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    current_password = request.data.get("current_password", "").strip()
    new_password = request.data.get("new_password", "").strip()

    if not current_password or not new_password:
        return Response(
            {"error": "current_password and new_password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 8:
        return Response(
            {"error": "New password must be at least 8 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user
    if not user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()
    update_session_auth_hash(request, user)

    return Response({"message": "Password changed successfully."})


@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password_view(request):
    email = request.data.get("email", "").strip().lower()

    if not email:
        return Response(
            {"error": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email)
        generator = PasswordResetTokenGenerator()
        token = generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        frontend_base = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        reset_url = f"{frontend_base}/reset-password/{uid}/{token}"

        send_mail(
            subject="UBTS Platform — Password Reset",
            message=(
                f"Hello {user.full_name or user.email},\n\n"
                "You requested a password reset for your UBTS account.\n\n"
                f"Reset your password here:\n{reset_url}\n\n"
                "This link expires after 24 hours.\n"
                "If you did not request this, ignore this email.\n\n"
                "— UBTS Intelligent Blood Donation Platform"
            ),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@ubts.ug"),
            recipient_list=[email],
            fail_silently=True,
        )
    except User.DoesNotExist:
        pass

    return Response(
        {
            "message": "If an account with that email exists, a reset link has been sent."
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_view(request):
    uid = request.data.get("uid", "")
    token = request.data.get("token", "")
    new_password = request.data.get("new_password", "").strip()

    if not uid or not token or not new_password:
        return Response(
            {"error": "uid, token, and new_password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 8:
        return Response(
            {"error": "Password must be at least 8 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {"error": "Invalid reset link."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    generator = PasswordResetTokenGenerator()
    if not generator.check_token(user, token):
        return Response(
            {"error": "Reset link is invalid or has already been used."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successfully. You can now log in."})