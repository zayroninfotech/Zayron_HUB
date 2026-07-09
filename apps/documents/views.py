import re
import secrets
import string
from datetime import datetime, timezone

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.conf import settings
from pymongo import MongoClient

from apps.employees.models import Employee
from .models import EmployeeDetails
from .serializers import EmployeeDetailsSerializer
from utils.email_service import send_onboarding_complete_email, send_credentials_email

User = get_user_model()

MONGO_URI = getattr(settings, 'MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME   = getattr(settings, 'MONGO_DB', 'Zayron_Portal')


def _mongo_db():
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    return client[DB_NAME]


def _generate_username(name, email):
    base = re.sub(r'[^a-z0-9]', '', name.lower().split()[0]) if name else ''
    base = base or email.split('@')[0]
    username = base
    counter = 1
    db = _mongo_db()
    while db.users.find_one({'username': username}):
        username = f"{base}{counter}"
        counter += 1
    return username


def _generate_password(length=10):
    chars = string.ascii_letters + string.digits + '@#$!'
    return ''.join(secrets.choice(chars) for _ in range(length))


def _insert_mongo_user(username, email, raw_password, employee):
    """Insert employee into MongoDB users collection so login works."""
    db = _mongo_db()
    if db.users.find_one({'email': email}):
        return  # already exists
    db.users.insert_one({
        'username':   username,
        'email':      email,
        'password':   make_password(raw_password),
        'first_name': employee.name.split()[0] if employee.name else '',
        'last_name':  ' '.join(employee.name.split()[1:]) if len(employee.name.split()) > 1 else '',
        'role':       'employee',
        'employee_type': employee.employee_type,   # 'permanent' or 'contract'
        'is_active':  True,
        'is_staff':   False,
        'is_superuser': False,
        'totp_secret': None,
        'created_at': datetime.now(timezone.utc),
    })


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
            # Also insert into MongoDB so the login system (which reads Mongo) works
            try:
                _insert_mongo_user(username, employee.email, raw_password, employee)
            except Exception:
                pass

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
