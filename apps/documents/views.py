import re
import secrets
import string
import threading
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
        import traceback as tb
        try:
            return self._handle_post(request, token)
        except Exception as e:
            return Response({
                'error': 'Unhandled exception',
                'detail': str(e),
                'trace': tb.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _handle_post(self, request, token):
        try:
            employee = Employee.objects.get(onboarding_token=token)
        except Employee.DoesNotExist:
            return Response({'error': 'Invalid onboarding link.'}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(employee, 'ndadocument'):
            return Response({'error': 'Please complete NDA first.'}, status=status.HTTP_400_BAD_REQUEST)

        request.data._mutable = True
        request.data['employee'] = employee.id
        request.data._mutable = False

        if hasattr(employee, 'employeedetails'):
            serializer = EmployeeDetailsSerializer(
                employee.employeedetails, data=request.data, context={'request': request}, partial=True
            )
        else:
            serializer = EmployeeDetailsSerializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response({'error': str(serializer.errors), 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        try:
            details = serializer.save()
        except Exception as e:
            import traceback
            return Response({'error': 'Save failed', 'detail': str(e), 'trace': traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            employee.status = 'completed'
            employee.save()
        except Exception as e:
            import traceback
            return Response({'error': 'Status update failed', 'detail': str(e), 'trace': traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Run user creation + all emails in background — return response instantly
        emp_email  = employee.email
        emp_name   = employee.name
        emp_type   = employee.employee_type

        def _background():
            try:
                send_onboarding_complete_email(details)
            except Exception:
                pass

            try:
                db = _mongo_db()
                django_user = User.objects.filter(email=emp_email).first()
                mongo_exists = bool(db.users.find_one({'email': emp_email}))

                portal_user  = None
                raw_password = None

                if not django_user:
                    username     = _generate_username(emp_name, emp_email)
                    raw_password = _generate_password()
                    portal_user  = User.objects.create_user(
                        username=username, email=emp_email, password=raw_password,
                        first_name=emp_name.split()[0] if emp_name else '',
                        last_name=' '.join(emp_name.split()[1:]) if len(emp_name.split()) > 1 else '',
                        role='employee',
                    )
                    _insert_mongo_user(username, emp_email, raw_password,
                                       type('E', (), {'name': emp_name, 'employee_type': emp_type})())
                elif not mongo_exists:
                    raw_password = _generate_password()
                    portal_user  = django_user
                    portal_user.set_password(raw_password)
                    portal_user.save()
                    _insert_mongo_user(django_user.username, emp_email, raw_password,
                                       type('E', (), {'name': emp_name, 'employee_type': emp_type})())

                if portal_user and raw_password:
                    send_credentials_email(
                        type('E', (), {'name': emp_name, 'email': emp_email, 'id': employee.id})(),
                        portal_user.username, raw_password
                    )
            except Exception:
                pass

        threading.Thread(target=_background, daemon=True).start()

        return Response(EmployeeDetailsSerializer(details, context={'request': request}).data, status=status.HTTP_201_CREATED)


class EmployeeDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        try:
            details = EmployeeDetails.objects.get(employee_id=employee_id)
            return Response(EmployeeDetailsSerializer(details, context={'request': request}).data)
        except EmployeeDetails.DoesNotExist:
            return Response({'error': 'Details not found.'}, status=status.HTTP_404_NOT_FOUND)
