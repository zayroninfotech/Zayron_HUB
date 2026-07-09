from django.contrib import admin
from .models import EmployeeDetails

@admin.register(EmployeeDetails)
class EmployeeDetailsAdmin(admin.ModelAdmin):
    list_display = ['employee', 'gender', 'blood_group', 'pan_number', 'created_at']
    readonly_fields = ['created_at']
