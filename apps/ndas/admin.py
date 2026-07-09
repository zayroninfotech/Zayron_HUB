from django.contrib import admin
from .models import NDADocument

@admin.register(NDADocument)
class NDADocumentAdmin(admin.ModelAdmin):
    list_display = ['employee', 'full_name', 'signed_date', 'created_at']
    readonly_fields = ['created_at']
