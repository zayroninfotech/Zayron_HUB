import os
from datetime import datetime, timezone

from bson import ObjectId
from django.http import FileResponse, Http404
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.accounts.permissions import IsAdminOrHR
from utils.mongo_db import col
from .pdf_generator import generate_nda_pdf
from utils.email_service import send_nda_copy_email


def _oid(id_str):
    try:
        return ObjectId(id_str)
    except Exception:
        return None


def _serialize_nda(doc):
    if not doc:
        return None
    d = dict(doc)
    d['id'] = str(d.pop('_id'))
    if 'created_at' in d and d['created_at']:
        d['created_at'] = d['created_at'].isoformat() if hasattr(d['created_at'], 'isoformat') else str(d['created_at'])
    if d.get('pdf_file_path'):
        d['pdf_url'] = f"{settings.MEDIA_URL}{d['pdf_file_path']}"
    return d


def _save_pdf(pdf_buf, employee_id, employee_name):
    """Save PDF to MEDIA_ROOT/ndas/ and return relative path."""
    safe_name = (employee_name or 'unknown').replace(' ', '_')
    filename = f'nda_{employee_id}_{safe_name}.pdf'
    dir_path = os.path.join(settings.MEDIA_ROOT, 'ndas')
    os.makedirs(dir_path, exist_ok=True)
    file_path = os.path.join(dir_path, filename)
    with open(file_path, 'wb') as f:
        f.write(pdf_buf.read())
    return f'ndas/{filename}'


class NDASubmitView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []


    def post(self, request, token):
        emp_doc = col('employees').find_one({'onboarding_token': str(token)})
        if not emp_doc:
            return Response({'error': 'Invalid onboarding link.'}, status=status.HTTP_404_NOT_FOUND)

        emp_id = str(emp_doc['_id'])

        if col('nda_documents').find_one({'employee_id': emp_id}):
            return Response({'error': 'NDA already submitted.'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        required = ['full_name', 'address', 'mobile', 'aadhaar_number']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return Response({'error': f'Missing fields: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

        now = datetime.now(timezone.utc)
        emp = {
            'id': emp_id,
            'name': emp_doc.get('name', ''),
            'email': emp_doc.get('email', ''),
            'employee_type': emp_doc.get('employee_type', ''),
        }
        nda = {
            'employee_id': emp_id,
            'full_name': data.get('full_name', ''),
            'address': data.get('address', ''),
            'mobile': data.get('mobile', ''),
            'aadhaar_number': data.get('aadhaar_number', ''),
            'emergency_contact': data.get('emergency_contact', ''),
            'signed_date': data.get('signed_date', str(now.date())),
            'signature': data.get('signature', ''),
            'pdf_file_path': None,
            'created_at': now,
        }

        result = col('nda_documents').insert_one(dict(nda))
        nda['_id'] = result.inserted_id

        try:
            pdf_buf = generate_nda_pdf(emp, nda)
            pdf_path = _save_pdf(pdf_buf, emp_id, emp['name'])
            col('nda_documents').update_one({'_id': nda['_id']}, {'$set': {'pdf_file_path': pdf_path}})
            nda['pdf_file_path'] = pdf_path
        except Exception:
            pass

        col('employees').update_one(
            {'_id': emp_doc['_id']},
            {'$set': {'status': 'nda_signed', 'updated_at': now}}
        )

        try:
            send_nda_copy_email(emp, nda)
        except Exception:
            pass

        return Response(_serialize_nda(nda), status=status.HTTP_201_CREATED)


class NDADetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        doc = col('nda_documents').find_one({'employee_id': employee_id})
        if not doc:
            return Response({'error': 'NDA not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize_nda(doc))


class NDADownloadView(APIView):
    permission_classes = [IsAdminOrHR]

    def get(self, request, employee_id):
        doc = col('nda_documents').find_one({'employee_id': employee_id})
        if not doc:
            return Response({'error': 'NDA not found.'}, status=status.HTTP_404_NOT_FOUND)
        pdf_path = doc.get('pdf_file_path')
        if not pdf_path:
            return Response({'error': 'PDF not available.'}, status=status.HTTP_404_NOT_FOUND)
        abs_path = os.path.join(settings.MEDIA_ROOT, pdf_path)
        if not os.path.exists(abs_path):
            return Response({'error': 'PDF file not found on disk.'}, status=status.HTTP_404_NOT_FOUND)
        filename = os.path.basename(abs_path)
        return FileResponse(open(abs_path, 'rb'), content_type='application/pdf',
                            as_attachment=True, filename=filename)


class NDARegenerateView(APIView):
    permission_classes = [IsAdminOrHR]

    def post(self, request, employee_id):
        nda_doc = col('nda_documents').find_one({'employee_id': employee_id})
        if not nda_doc:
            return Response({'error': 'NDA not found.'}, status=status.HTTP_404_NOT_FOUND)

        emp_doc = col('employees').find_one({'_id': _oid(employee_id)})
        if not emp_doc:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

        emp = {
            'id': employee_id,
            'name': emp_doc.get('name', ''),
            'email': emp_doc.get('email', ''),
            'employee_type': emp_doc.get('employee_type', ''),
        }

        try:
            pdf_buf = generate_nda_pdf(emp, nda_doc)
            old_path = nda_doc.get('pdf_file_path')
            if old_path:
                try:
                    os.remove(os.path.join(settings.MEDIA_ROOT, old_path))
                except Exception:
                    pass
            pdf_path = _save_pdf(pdf_buf, employee_id, emp['name'])
            col('nda_documents').update_one(
                {'_id': nda_doc['_id']}, {'$set': {'pdf_file_path': pdf_path}}
            )
            pdf_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{pdf_path}")
            return Response({'message': 'PDF regenerated successfully.', 'pdf_url': pdf_url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
