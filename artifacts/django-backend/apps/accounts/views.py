from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, ScholarProfile
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ScholarRegisterSerializer,
    ScholarProfileSerializer,
    ScholarPublicSerializer,
    get_tokens_for_user,
)


# ------------------------------------------------------------------ #
#  POST /api/auth/register/
# ------------------------------------------------------------------ #
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = serializer.save()
    tokens = get_tokens_for_user(user)

    return Response(
        {
            "success": True,
            "message": "Account created successfully.",
            "user": UserSerializer(user).data,
            "tokens": tokens,
        },
        status=status.HTTP_201_CREATED,
    )


# ------------------------------------------------------------------ #
#  POST /api/auth/login/
# ------------------------------------------------------------------ #
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data, context={"request": request})
    if not serializer.is_valid():
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = serializer.validated_data["user"]
    tokens = get_tokens_for_user(user)

    return Response(
        {
            "success": True,
            "message": "Login successful.",
            "user": UserSerializer(user).data,
            "tokens": tokens,
        },
        status=status.HTTP_200_OK,
    )


# ------------------------------------------------------------------ #
#  POST /api/auth/logout/
# ------------------------------------------------------------------ #
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response(
            {"success": False, "message": "Refresh token is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError:
        return Response(
            {"success": False, "message": "Invalid or expired token."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response(
        {"success": True, "message": "Logged out successfully."},
        status=status.HTTP_200_OK,
    )


# ------------------------------------------------------------------ #
#  POST /api/auth/token/refresh/
# ------------------------------------------------------------------ #
@api_view(["POST"])
@permission_classes([AllowAny])
def token_refresh(request):
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response(
            {"success": False, "message": "Refresh token is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        token = RefreshToken(refresh_token)
        return Response(
            {
                "success": True,
                "tokens": {
                    "access": str(token.access_token),
                    "refresh": str(token),
                },
            },
            status=status.HTTP_200_OK,
        )
    except TokenError as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_401_UNAUTHORIZED,
        )


# ------------------------------------------------------------------ #
#  GET /api/auth/me/
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user_data = UserSerializer(request.user).data
    scholar_data = None
    if hasattr(request.user, "scholar_profile"):
        scholar_data = ScholarProfileSerializer(request.user.scholar_profile).data
    return Response(
        {
            "success": True,
            "user": user_data,
            "scholar_profile": scholar_data,
        },
        status=status.HTTP_200_OK,
    )


# ------------------------------------------------------------------ #
#  PATCH /api/auth/me/update/
# ------------------------------------------------------------------ #
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserSerializer(
        request.user, data=request.data, partial=True
    )
    if not serializer.is_valid():
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    serializer.save()
    return Response(
        {"success": True, "user": serializer.data},
        status=status.HTTP_200_OK,
    )


# ------------------------------------------------------------------ #
#  POST /api/auth/scholar/register/
# ------------------------------------------------------------------ #
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def scholar_register(request):
    serializer = ScholarRegisterSerializer(
        data=request.data, context={"request": request}
    )
    if not serializer.is_valid():
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    profile = serializer.save()
    return Response(
        {
            "success": True,
            "message": "Scholar profile created. Verification pending.",
            "scholar_profile": ScholarProfileSerializer(profile).data,
        },
        status=status.HTTP_201_CREATED,
    )


# ------------------------------------------------------------------ #
#  GET /api/auth/scholars/
# ------------------------------------------------------------------ #
@api_view(["GET"])
@permission_classes([AllowAny])
def list_scholars(request):
    scholars = ScholarProfile.objects.select_related("user").filter(
        user__is_active=True
    )
    serializer = ScholarPublicSerializer(scholars, many=True)
    return Response(
        {"success": True, "count": scholars.count(), "scholars": serializer.data},
        status=status.HTTP_200_OK,
    )


# ------------------------------------------------------------------ #
#  POST /api/auth/forgot-password/
# ------------------------------------------------------------------ #
@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get("email", "").strip().lower()
    if not email:
        return Response(
            {"success": False, "message": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    # Always return success to avoid user enumeration
    # In production: send a password-reset email here
    # For dev: the token is printed to the Django console
    try:
        user = User.objects.get(email__iexact=email, is_active=True)
        from rest_framework_simplejwt.tokens import RefreshToken as RT
        token = str(RT.for_user(user).access_token)
        print(f"[DEV] Password reset token for {email}: {token}")
    except User.DoesNotExist:
        pass  # Don't reveal whether email exists

    return Response(
        {"success": True, "message": "If that email is registered, a reset link has been sent."},
        status=status.HTTP_200_OK,
    )
