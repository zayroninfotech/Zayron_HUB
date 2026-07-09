from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [('superadmin', 'Super Admin'), ('admin', 'Admin')]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='superadmin')
    mobile = models.CharField(max_length=15, blank=True)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.username} ({self.role})"
