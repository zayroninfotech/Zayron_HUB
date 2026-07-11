import uuid
from io import BytesIO
from datetime import datetime, timezone

from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from django.conf import settings
import openpyxl
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from apps.accounts.permissions import IsAdminOrHR, IsSuperAdmin
from utils.mongo_db import col
from utils.email_service import send_onboarding_email

_TYPE_LABELS = {'permanent': 'Permanent Employee', 'contract': 'Contract Employee', 'intern': 'Intern'}
_STATUS_LABELS = {'pending': 'Pending', 'nda_signed': 'NDA Signed', 'completed': 'Completed'}


def _oid(id_str):
    try:
        return ObjectId(id_str)
    except Exception:
        return None


def _serialize(doc):
    if doc is None:
        return None
    d = dict(doc)
    d['id'] = str(d.pop('_id'))
    if 'joining_date' in d and d['joining_date']:
        d['joining_date'] = str(d['joining_date'])
    if 'created_at' in d and d['created_at']:
        d['created_at'] = d['created_at'].isoformat() if hasattr(d['created_at'], 'isoformat') else str(d['created_at'])
    if 'updated_at' in d and d['updated_at']:
        d['updated_at'] = d['updated_at'].isoformat() if hasattr(d['updated_at'], 'isoformat') else str(d['updated_at'])
    return d


def _onboarding_link(token):
    base = getattr(settings, 'BASE_URL', 'http://localhost:8000')
    return f'{base}/onboarding/{token}/nda'


class EmployeeListCreateView(APIView):
    permission_classes = [IsAdminOrHR]

    def get(self, request):
        query = {}
        q = request.query_params.get('q')
        emp_type = request.query_params.get('employee_type')
        dept = request.query_params.get('department')
        status_filter = request.query_params.get('status')

        if q:
            import re
            pattern = re.compile(re.escape(q), re.IGNORECASE)
            query['$or'] = [{'name': pattern}, {'email': pattern}]
        if emp_type:
            query['employee_type'] = emp_type
        if dept:
            import re
            query['department'] = re.compile(re.escape(dept), re.IGNORECASE)
        if status_filter:
            query['status'] = status_filter

        docs = list(col('employees').find(query).sort('created_at', -1))
        return Response([_serialize(d) for d in docs])

    def post(self, request):
        data = request.data
        required = ['name', 'email', 'mobile', 'employee_type', 'department', 'designation', 'joining_date']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return Response({'error': f'Missing fields: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

        if col('employees').find_one({'email': data['email']}):
            return Response({'error': 'An employee with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        token = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        doc = {
            'name': data['name'],
            'email': data['email'],
            'mobile': data.get('mobile', ''),
            'employee_type': data['employee_type'],
            'department': data['department'],
            'designation': data['designation'],
            'joining_date': data['joining_date'],
            'onboarding_token': token,
            'status': 'pending',
            'created_by': request.user.username,
            'created_at': now,
            'updated_at': now,
        }
        result = col('employees').insert_one(doc)
        doc['_id'] = result.inserted_id
        serialized = _serialize(doc)

        try:
            emp_for_email = dict(serialized)
            emp_for_email['onboarding_link'] = _onboarding_link(token)
            send_onboarding_email(emp_for_email)
        except Exception:
            pass

        return Response(serialized, status=status.HTTP_201_CREATED)


class EmployeeDetailView(APIView):
    permission_classes = [IsAdminOrHR]

    def _get_doc(self, pk):
        oid = _oid(pk)
        if not oid:
            return None
        return col('employees').find_one({'_id': oid})

    def get(self, request, pk):
        doc = self._get_doc(pk)
        if not doc:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize(doc))

    def put(self, request, pk):
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid ID.'}, status=status.HTTP_400_BAD_REQUEST)
        allowed = ['name', 'email', 'mobile', 'employee_type', 'department', 'designation', 'joining_date', 'status']
        updates = {k: v for k, v in request.data.items() if k in allowed}
        if not updates:
            return Response({'error': 'No valid fields to update.'}, status=status.HTTP_400_BAD_REQUEST)
        updates['updated_at'] = datetime.now(timezone.utc)
        result = col('employees').find_one_and_update(
            {'_id': oid}, {'$set': updates}, return_document=True
        )
        if not result:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize(result))

    def delete(self, request, pk):
        if not IsSuperAdmin().has_permission(request, self):
            return Response({'detail': 'Only superadmin can delete employees.'}, status=status.HTTP_403_FORBIDDEN)
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid ID.'}, status=status.HTTP_400_BAD_REQUEST)
        result = col('employees').delete_one({'_id': oid})
        if result.deleted_count == 0:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmployeeByTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, token):
        doc = col('employees').find_one({'onboarding_token': str(token)})
        if not doc:
            return Response({'error': 'Invalid onboarding link.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize(doc))


class DashboardStatsView(APIView):
    permission_classes = [IsAdminOrHR]

    def get(self, request):
        from datetime import date
        now = date.today()
        employees = col('employees')

        total = employees.count_documents({})
        pending = employees.count_documents({'status': 'pending'})
        nda_signed = employees.count_documents({'status': 'nda_signed'})
        completed = employees.count_documents({'status': 'completed'})
        permanent = employees.count_documents({'employee_type': 'permanent'})
        contract = employees.count_documents({'employee_type': 'contract'})
        intern = employees.count_documents({'employee_type': 'intern'})

        month_str = f'{now.year}-{now.month:02d}'
        joining_this_month = employees.count_documents({
            'joining_date': {'$regex': f'^{month_str}'}
        })

        by_dept_pipeline = [
            {'$group': {'_id': '$department', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$project': {'department': '$_id', 'count': 1, '_id': 0}},
        ]
        by_dept = list(employees.aggregate(by_dept_pipeline))

        by_type_pipeline = [
            {'$group': {'_id': '$employee_type', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$project': {'employee_type': '$_id', 'count': 1, '_id': 0}},
        ]
        by_type = list(employees.aggregate(by_type_pipeline))

        recent_docs = list(employees.find({}).sort('created_at', -1).limit(6))
        recent = [_serialize(d) for d in recent_docs]

        return Response({
            'total': total,
            'pending': pending,
            'nda_signed': nda_signed,
            'completed': completed,
            'permanent': permanent,
            'contract': contract,
            'intern': intern,
            'joining_this_month': joining_this_month,
            'by_department': by_dept,
            'by_type': by_type,
            'recent_employees': recent,
        })


class ExportEmployeesView(APIView):
    permission_classes = [IsAdminOrHR]

    def get(self, request):
        fmt = request.query_params.get('format', 'excel')
        docs = list(col('employees').find({}))

        if fmt == 'excel':
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = 'Employees'
            ws.append(['Name', 'Email', 'Mobile', 'Type', 'Department', 'Designation', 'Joining Date', 'Status'])
            for d in docs:
                ws.append([
                    d.get('name', ''), d.get('email', ''), d.get('mobile', ''),
                    _TYPE_LABELS.get(d.get('employee_type', ''), d.get('employee_type', '')),
                    d.get('department', ''), d.get('designation', ''),
                    str(d.get('joining_date', '')),
                    _STATUS_LABELS.get(d.get('status', ''), d.get('status', '')),
                ])
            buf = BytesIO()
            wb.save(buf)
            buf.seek(0)
            response = HttpResponse(
                buf.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="employees.xlsx"'
            return response

        else:
            buf = BytesIO()
            doc_pdf = SimpleDocTemplate(buf, pagesize=A4)
            styles = getSampleStyleSheet()
            elements = [Paragraph('Employee Report - Zayron Infotech', styles['Title']), Spacer(1, 20)]
            data = [['Name', 'Email', 'Type', 'Department', 'Status']]
            for d in docs:
                data.append([
                    d.get('name', ''), d.get('email', ''),
                    _TYPE_LABELS.get(d.get('employee_type', ''), d.get('employee_type', '')),
                    d.get('department', ''),
                    _STATUS_LABELS.get(d.get('status', ''), d.get('status', '')),
                ])
            table = Table(data, repeatRows=1)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f4ff')]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(table)
            doc_pdf.build(elements)
            buf.seek(0)
            response = HttpResponse(buf.read(), content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="employees.pdf"'
            return response


class ResendEmailView(APIView):
    permission_classes = [IsAdminOrHR]

    def post(self, request, pk):
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid ID.'}, status=status.HTTP_400_BAD_REQUEST)
        doc = col('employees').find_one({'_id': oid})
        if not doc:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = _serialize(doc)
            serialized['onboarding_link'] = _onboarding_link(doc['onboarding_token'])
            send_onboarding_email(serialized)
            return Response({'message': 'Email sent successfully.'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
