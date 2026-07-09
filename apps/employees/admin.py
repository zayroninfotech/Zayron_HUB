from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'employee_type', 'department', 'status', 'created_at']
    list_filter = ['employee_type', 'status', 'department']
    search_fields = ['name', 'email']
    readonly_fields = ['onboarding_token', 'created_at', 'updated_at']
