from rest_framework import serializers
from .models import EmployeeDetails


class EmployeeDetailsSerializer(serializers.ModelSerializer):
    photograph_url = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    aadhaar_copy_url = serializers.SerializerMethodField()
    pan_copy_url = serializers.SerializerMethodField()
    educational_certificates_url = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeDetails
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

    def _build_url(self, obj, field_name):
        field = getattr(obj, field_name)
        if field:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(field.url)
        return None

    def get_photograph_url(self, obj): return self._build_url(obj, 'photograph')
    def get_resume_url(self, obj): return self._build_url(obj, 'resume')
    def get_aadhaar_copy_url(self, obj): return self._build_url(obj, 'aadhaar_copy')
    def get_pan_copy_url(self, obj): return self._build_url(obj, 'pan_copy')
    def get_educational_certificates_url(self, obj): return self._build_url(obj, 'educational_certificates')
