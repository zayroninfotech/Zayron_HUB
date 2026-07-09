from rest_framework import serializers
from .models import NDADocument


class NDADocumentSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = NDADocument
        fields = [
            'id', 'employee', 'full_name', 'address', 'mobile', 'aadhaar_number',
            'emergency_contact', 'signed_date', 'signature', 'pdf_file', 'pdf_url', 'created_at'
        ]
        read_only_fields = ['id', 'pdf_file', 'created_at']

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
        return None


class NDACreateSerializer(serializers.ModelSerializer):
    signature = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = NDADocument
        fields = ['full_name', 'address', 'mobile', 'aadhaar_number', 'emergency_contact', 'signed_date', 'signature']
