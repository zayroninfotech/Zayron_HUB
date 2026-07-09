from django.db import models


class NDADocument(models.Model):
    employee = models.OneToOneField('employees.Employee', on_delete=models.CASCADE, related_name='ndadocument')
    full_name = models.CharField(max_length=200)
    address = models.TextField()
    mobile = models.CharField(max_length=15)
    aadhaar_number = models.CharField(max_length=12)
    emergency_contact = models.CharField(max_length=15)
    signed_date = models.DateField()
    signature = models.TextField(blank=True, default='')  # base64
    pdf_file = models.FileField(upload_to='ndas/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"NDA - {self.employee.name}"
