import re
import secrets
import string

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model

from apps.employees.models import Employee
from .models import EmployeeDetails
from .serializers import EmployeeDetailsSerializer
from utils.email_service import send_onboarding_complete_email, send_credentials_email

User = get_user_model()


def _generate_username(name, email):
    base = re.sub(r'[^a-z0-9]', '', name.lower().split()[0]) if name else ''
    base = base or email.split('@')[0]
    username = base
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{counter}"
        counter += 1
    return username


def _generate_password(length=10):
    chars = string.ascii_letters + string.digits + '@#$!'
    return ''.join(secrets.choice(chars) for _ in range(length))


class EmployeeDetailsSubmitView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, token):
        try:
            employee = Employee.objects.get(onboarding_token=token)
        except Employee.DoesNotExist:
            return Response({'error': 'Invalid onboarding link.'}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(employee, 'ndadocument'):
            return Response({'error': 'Please complete NDA first.'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['employee'] = employee.id

        # Update if already exists, otherwise create
        if hasattr(employee, 'employeedetails'):
            serializer = EmployeeDetailsSerializer(
                employee.employeedetails, data=data, context={'request': request}, partial=True
            )
        else:
            serializer = EmployeeDetailsSerializer(data=data, context={'request': request})

        if not serializer.is_valid():
            return Response({'error': str(serializer.errors), 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        details = serializer.save()

        employee.status = 'completed'
        employee.save()

        # Create portal login account if not already exists
        portal_user = None
        raw_password = None
        if not User.objects.filter(email=employee.email).exists():
            username = _generate_username(employee.name, employee.email)
            raw_password = _generate_password()
            portal_user = User.objects.create_user(
                username=username,
                email=employee.email,
                password=raw_password,
                first_name=employee.name.split()[0] if employee.name else '',
                last_name=' '.join(employee.name.split()[1:]) if len(employee.name.split()) > 1 else '',
                role='employee',
            )

        try:
            send_onboarding_complete_email(details)
        except Exception:
            pass

        if portal_user and raw_password:
            try:
                send_credentials_email(employee, portal_user.username, raw_password)
            except Exception:
                pass

        return Response(EmployeeDetailsSerializer(details, context={'request': request}).data, status=status.HTTP_201_CREATED)


class EmployeeDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        try:
            details = EmployeeDetails.objects.get(employee_id=employee_id)
            return Response(EmployeeDetailsSerializer(details, context={'request': request}).data)
        except EmployeeDetails.DoesNotExist:
            return Response({'error': 'Details not found.'}, status=status.HTTP_404_NOT_FOUND)
