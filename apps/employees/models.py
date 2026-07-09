import uuid
from django.db import models
from django.conf import settings


class Employee(models.Model):
    EMPLOYEE_TYPE_CHOICES = [
        ('permanent', 'Permanent Employee'),
        ('contract', 'Contract Employee'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('nda_signed', 'NDA Signed'),
        ('completed', 'Completed'),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15)
    employee_type = models.CharField(max_length=20, choices=EMPLOYEE_TYPE_CHOICES)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    joining_date = models.DateField()
    onboarding_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_employees'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.employee_type})"

    @property
    def onboarding_link(self):
        return f"{settings.BASE_URL}/onboarding/{self.onboarding_token}"
