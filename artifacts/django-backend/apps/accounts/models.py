from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError("Username is required")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    is_scholar = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.username} <{self.email}>"

    @property
    def display_name(self):
        return self.full_name or self.username


class ScholarProfile(models.Model):
    EXPERTISE_CHOICES = [
        ("quran", "Quran & Tafsir"),
        ("fiqh", "Fiqh & Islamic Law"),
        ("seerah", "Seerah & History"),
        ("aqeedah", "Aqeedah & Theology"),
        ("hadith", "Hadith & Sciences"),
        ("spirituality", "Spirituality & Tazkiyah"),
        ("family", "Family & Lifestyle"),
        ("finance", "Islamic Finance"),
        ("dawah", "Dawah & Education"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="scholar_profile"
    )
    bio = models.TextField(blank=True)
    expertise = models.CharField(
        max_length=30, choices=EXPERTISE_CHOICES, default="other"
    )
    qualifications = models.TextField(blank=True)
    institution = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    verified = models.BooleanField(default=False)
    subscriber_count = models.PositiveIntegerField(default=0)
    video_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "scholar_profiles"

    def __str__(self):
        return f"Scholar: {self.user.username}"
