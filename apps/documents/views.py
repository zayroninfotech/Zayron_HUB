import os
import re
import secrets
import string
import threading
from datetime import datetime, timezone

from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.conf import settings

from apps.accounts.permissions import IsAdminOrHR
from utils.mongo_db import col
from utils.email_service import send_onboarding_complete_email, send_credentials_email

User = get_user_model()


def _oid(id_str):
    try:
        return ObjectId(id_str)
    except Exception:
        return None


def _save_upload(file_obj, subfolder, filename):
    """Save uploaded file, return relative path from MEDIA_ROOT."""
    dir_path = os.path.join(settings.MEDIA_ROOT, subfolder)
    os.makedirs(dir_path, exist_ok=True)
    file_path = os.path.join(dir_path, filename)
    with open(file_path, 'wb') as f:
        for chunk in file_obj.chunks():
            f.write(chunk)
    return f'{subfolder}/{filename}'


def _generate_username(name, email):
    base = re.sub(r'[^a-z0-9]', '', name.lower().replace(' ', '')) if name else ''
    base = base or email.split('@')[0]
    username = base
    counter = 1
    while col('users').find_one({'username': username, 'email': {'$ne': email}}):
        username = f'{base}{counter}'
        counter += 1
    return username


def _generate_password(length=10):
    chars = string.ascii_letters + string.digits + '@#$!'
    return ''.join(secrets.choice(chars) for _ in range(length))


def _serialize_details(doc):
    if not doc:
        return None
    d = dict(doc)
    d['id'] = str(d.pop('_id'))
    if 'created_at' in d and d['created_at']:
        d['created_at'] = d['created_at'].isoformat() if hasattr(d['created_at'], 'isoformat') else str(d['created_at'])
    media_url = settings.MEDIA_URL
    for field in ('photograph_path', 'resume_path', 'aadhaar_copy_path', 'pan_copy_path', 'educational_certificates_path'):
        if d.get(field):
            d[field.replace('_path', '_url')] = f'{media_url}{d[field]}'
    return d


class EmployeeDetailsSubmitView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, token):
        emp_doc = col('employees').find_one({'onboarding_token': str(token)})
        if not emp_doc:
            return Response({'error': 'Invalid onboarding link.'}, status=status.HTTP_404_NOT_FOUND)

        emp_id = str(emp_doc['_id'])

        if not col('nda_documents').find_one({'employee_id': emp_id}):
            return Response({'error': 'Please complete NDA first.'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        safe_name = (emp_doc.get('name', 'unknown')).replace(' ', '_')
        now = datetime.now(timezone.utc)

        def _file_path(field_key, subfolder):
            f = request.FILES.get(field_key)
            if not f:
                return None
            ext = os.path.splitext(f.name)[1]
            filename = f'{emp_id}_{field_key}{ext}'
            return _save_upload(f, f'employees/{safe_name}/{subfolder}', filename)

        existing = col('employee_details').find_one({'employee_id': emp_id})

        details = {
            'employee_id': emp_id,
            'mobile_number': data.get('mobile_number', ''),
            'father_name': data.get('father_name', ''),
            'date_of_birth': data.get('date_of_birth', ''),
            'gender': data.get('gender', ''),
            'blood_group': data.get('blood_group', ''),
            'address': data.get('address', ''),
            'qualification': data.get('qualification', ''),
            'previous_experience': data.get('previous_experience', ''),
            'pan_number': data.get('pan_number', ''),
            'aadhaar_number': data.get('aadhaar_number', ''),
            'bank_name': data.get('bank_name', ''),
            'account_number': data.get('account_number', ''),
            'ifsc_code': data.get('ifsc_code', ''),
            'emergency_contact_name': data.get('emergency_contact_name', ''),
            'emergency_contact': data.get('emergency_contact', ''),
            'photograph_path': _file_path('photograph', 'photograph'),
            'resume_path': _file_path('resume', 'resume'),
            'aadhaar_copy_path': _file_path('aadhaar_copy', 'aadhaar'),
            'pan_copy_path': _file_path('pan_copy', 'pan'),
            'educational_certificates_path': _file_path('educational_certificates', 'certificates'),
            'created_at': now,
        }

        if existing:
            updates = {k: v for k, v in details.items() if v is not None}
            col('employee_details').update_one({'_id': existing['_id']}, {'$set': updates})
            details['_id'] = existing['_id']
        else:
            result = col('employee_details').insert_one(details)
            details['_id'] = result.inserted_id

        col('employees').update_one(
            {'_id': emp_doc['_id']},
            {'$set': {'status': 'completed', 'updated_at': now}}
        )

        emp = {
            'id': emp_id,
            'employee_id': emp_doc.get('employee_id', ''),
            'name': emp_doc.get('name', ''),
            'email': emp_doc.get('email', ''),
            'joining_date': emp_doc.get('joining_date', ''),
            'employee_type': emp_doc.get('employee_type', ''),
        }

        def _background():
            try:
                send_onboarding_complete_email(emp, details)
            except Exception:
                pass

            try:
                emp_email = emp['email']
                emp_name = emp['name']
                emp_type = emp['employee_type']

                django_user = User.objects.filter(email=emp_email).first()
                mongo_exists = bool(col('users').find_one({'email': emp_email}))

                raw_password = _generate_password()

                new_username = _generate_username(emp_name, emp_email)
                first_name = emp_name.split()[0] if emp_name else ''
                last_name = ' '.join(emp_name.split()[1:]) if len(emp_name.split()) > 1 else ''

                if not django_user:
                    django_user = User.objects.create_user(
                        username=new_username, email=emp_email, password=raw_password,
                        first_name=first_name, last_name=last_name, role='employee',
                    )
                else:
                    # Always sync name and regenerate username to match current employee
                    django_user.username = new_username
                    django_user.first_name = first_name
                    django_user.last_name = last_name
                    django_user.set_password(raw_password)
                    django_user.save()

                col('users').update_one(
                    {'email': emp_email},
                    {'$set': {
                        'username': new_username,
                        'email': emp_email,
                        'password': make_password(raw_password),
                        'first_name': first_name,
                        'last_name': last_name,
                        'role': 'employee',
                        'employee_type': emp_type,
                        'is_active': True,
                        'is_staff': False,
                        'is_superuser': False,
                        'totp_secret': None,
                        'created_at': datetime.now(timezone.utc),
                    }},
                    upsert=True,
                )

                send_credentials_email(emp, django_user.username, raw_password)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f'Credentials setup/email failed for {emp.get("email")}: {e}', exc_info=True)

        threading.Thread(target=_background, daemon=True).start()

        return Response(_serialize_details(details), status=status.HTTP_201_CREATED)


class EmployeeDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        doc = col('employee_details').find_one({'employee_id': employee_id})
        if not doc:
            return Response({'error': 'Details not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize_details(doc))


class ResendCredentialsView(APIView):
    permission_classes = [IsAdminOrHR]

    def post(self, request, employee_id):
        from bson import ObjectId
        try:
            oid = ObjectId(employee_id)
        except Exception:
            return Response({'error': 'Invalid employee ID.'}, status=status.HTTP_400_BAD_REQUEST)

        emp_doc = col('employees').find_one({'_id': oid})
        if not emp_doc:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

        emp_email = emp_doc.get('email', '')
        emp_name = emp_doc.get('name', '')
        emp_type = emp_doc.get('employee_type', '')
        emp_id_field = emp_doc.get('employee_id', '')

        User = get_user_model()
        django_user = User.objects.filter(email=emp_email).first()
        raw_password = _generate_password()
        username = _generate_username(emp_name, emp_email)

        if django_user:
            # Update username and password on existing user
            old_username = django_user.username
            django_user.username = username
            django_user.set_password(raw_password)
            django_user.first_name = emp_name.split()[0] if emp_name else ''
            django_user.last_name = ' '.join(emp_name.split()[1:]) if len(emp_name.split()) > 1 else ''
            django_user.save()
            # Update MongoDB - match by old username or email
            col('users').update_one(
                {'$or': [{'username': old_username}, {'email': emp_email}]},
                {'$set': {
                    'username': username,
                    'password': make_password(raw_password),
                    'first_name': emp_name.split()[0] if emp_name else '',
                    'last_name': ' '.join(emp_name.split()[1:]) if len(emp_name.split()) > 1 else '',
                    'role': 'employee',
                    'employee_type': emp_type,
                    'is_active': True,
                }},
                upsert=True,
            )
        else:
            django_user = User.objects.create_user(
                username=username, email=emp_email, password=raw_password,
                first_name=emp_name.split()[0] if emp_name else '',
                last_name=' '.join(emp_name.split()[1:]) if len(emp_name.split()) > 1 else '',
                role='employee',
            )
            col('users').update_one(
                {'email': emp_email},
                {'$set': {
                    'username': username,
                    'email': emp_email,
                    'password': make_password(raw_password),
                    'role': 'employee',
                    'employee_type': emp_type,
                    'is_active': True,
                }},
                upsert=True,
            )

        emp = {
            'id': str(emp_doc['_id']),
            'employee_id': emp_id_field,
            'name': emp_name,
            'email': emp_email,
            'joining_date': emp_doc.get('joining_date', ''),
            'employee_type': emp_type,
        }
        try:
            send_credentials_email(emp, username, raw_password)
        except Exception as e:
            return Response({'error': f'User created but email failed: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': f'Credentials email sent to {emp_email}.'})
