from django.db import models


class EmployeeUploadPath:
    def __init__(self, folder):
        self.folder = folder

    def __call__(self, instance, filename):
        emp_name = instance.employee.name.replace(' ', '_') if instance.employee_id else 'unknown'
        return f'employees/{emp_name}/{self.folder}/{filename}'

    def deconstruct(self):
        return ('apps.documents.models.EmployeeUploadPath', [self.folder], {})


class EmployeeDetails(models.Model):
    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female'), ('other', 'Other')]
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]

    employee = models.OneToOneField('employees.Employee', on_delete=models.CASCADE, related_name='employeedetails')
    father_name = models.CharField(max_length=200)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES)
    address = models.TextField()
    qualification = models.CharField(max_length=200, blank=True, default='')
    previous_experience = models.TextField(blank=True, default='')
    pan_number = models.CharField(max_length=10, blank=True, default='')
    aadhaar_number = models.CharField(max_length=12, blank=True, default='')
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=20)
    ifsc_code = models.CharField(max_length=11)
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact = models.CharField(max_length=15)
    # Documents
    photograph = models.FileField(upload_to=EmployeeUploadPath('photograph'), null=True, blank=True)
    resume = models.FileField(upload_to=EmployeeUploadPath('resume'), null=True, blank=True)
    aadhaar_copy = models.FileField(upload_to=EmployeeUploadPath('aadhaar'), null=True, blank=True)
    pan_copy = models.FileField(upload_to=EmployeeUploadPath('pan'), null=True, blank=True)
    educational_certificates = models.FileField(upload_to=EmployeeUploadPath('certificates'), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Details - {self.employee.name}"
