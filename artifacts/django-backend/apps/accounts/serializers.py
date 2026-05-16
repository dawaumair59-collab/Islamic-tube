from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, ScholarProfile


# ------------------------------------------------------------------ #
#  Helpers
# ------------------------------------------------------------------ #

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# ------------------------------------------------------------------ #
#  User serializers
# ------------------------------------------------------------------ #

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "username", "full_name",
            "avatar_url", "bio", "is_scholar", "date_joined",
        ]
        read_only_fields = ["id", "is_scholar", "date_joined"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["email", "username", "full_name", "password", "confirm_password"]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            full_name=validated_data.get("full_name", ""),
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["email"],
            password=attrs["password"],
        )
        if not user:
            raise serializers.ValidationError(
                {"non_field_errors": "Invalid email or password."}
            )
        if not user.is_active:
            raise serializers.ValidationError(
                {"non_field_errors": "This account has been deactivated."}
            )
        attrs["user"] = user
        return attrs


# ------------------------------------------------------------------ #
#  Scholar serializers
# ------------------------------------------------------------------ #

class ScholarProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarProfile
        fields = [
            "id", "bio", "expertise", "qualifications",
            "institution", "website", "verified",
            "subscriber_count", "video_count", "created_at",
        ]
        read_only_fields = ["id", "verified", "subscriber_count", "video_count", "created_at"]


class ScholarRegisterSerializer(serializers.Serializer):
    bio = serializers.CharField(required=False, allow_blank=True)
    expertise = serializers.ChoiceField(
        choices=ScholarProfile.EXPERTISE_CHOICES, required=True
    )
    qualifications = serializers.CharField(required=False, allow_blank=True)
    institution = serializers.CharField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)

    def validate(self, attrs):
        user = self.context["request"].user
        if hasattr(user, "scholar_profile"):
            raise serializers.ValidationError(
                {"non_field_errors": "You already have a scholar profile."}
            )
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        profile = ScholarProfile.objects.create(user=user, **validated_data)
        user.is_scholar = True
        user.save(update_fields=["is_scholar"])
        return profile


class ScholarPublicSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ScholarProfile
        fields = [
            "id", "user", "bio", "expertise", "qualifications",
            "institution", "website", "verified",
            "subscriber_count", "video_count",
        ]
