from rest_framework import serializers
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    onboarding_link = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField()
    nda_status = serializers.SerializerMethodField()
    has_details = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id', 'name', 'email', 'mobile', 'employee_type', 'department',
            'designation', 'joining_date', 'onboarding_token', 'status',
            'onboarding_link', 'created_by_name', 'nda_status', 'has_details',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'onboarding_token', 'status', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None

    def get_nda_status(self, obj):
        return hasattr(obj, 'ndadocument')

    def get_has_details(self, obj):
        return hasattr(obj, 'employeedetails')


class EmployeeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['name', 'email', 'mobile', 'employee_type', 'department', 'designation', 'joining_date']
