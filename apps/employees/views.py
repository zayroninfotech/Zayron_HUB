from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Count
from django.http import HttpResponse
from io import BytesIO
import openpyxl
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from .models import Employee
from .serializers import EmployeeSerializer, EmployeeCreateSerializer
from utils.email_service import send_onboarding_email


class EmployeeListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EmployeeCreateSerializer
        return EmployeeSerializer

    def get_queryset(self):
        qs = Employee.objects.select_related('created_by').all()
        q = self.request.query_params.get('q')
        emp_type = self.request.query_params.get('employee_type')
        dept = self.request.query_params.get('department')
        status_filter = self.request.query_params.get('status')

        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(email__icontains=q))
        if emp_type:
            qs = qs.filter(employee_type=emp_type)
        if dept:
            qs = qs.filter(department__icontains=dept)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        employee = serializer.save(created_by=self.request.user)
        try:
            send_onboarding_email(employee)
        except Exception:
            pass  # Don't fail on email error


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]


class EmployeeByTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            employee = Employee.objects.get(onboarding_token=token)
            serializer = EmployeeSerializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response({'error': 'Invalid onboarding link.'}, status=status.HTTP_404_NOT_FOUND)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.utils import timezone
        now = timezone.now()
        total = Employee.objects.count()
        pending = Employee.objects.filter(status='pending').count()
        nda_signed = Employee.objects.filter(status='nda_signed').count()
        completed = Employee.objects.filter(status='completed').count()
        permanent = Employee.objects.filter(employee_type='permanent').count()
        contract = Employee.objects.filter(employee_type='contract').count()
        intern = Employee.objects.filter(employee_type='intern').count()
        joining_this_month = Employee.objects.filter(
            joining_date__year=now.year, joining_date__month=now.month
        ).count()

        by_dept = list(
            Employee.objects.values('department').annotate(count=Count('id')).order_by('-count')
        )
        by_type = list(
            Employee.objects.values('employee_type').annotate(count=Count('id')).order_by('-count')
        )
        recent = EmployeeSerializer(
            Employee.objects.order_by('-created_at')[:6], many=True
        ).data

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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fmt = request.query_params.get('format', 'excel')
        employees = Employee.objects.all()

        if fmt == 'excel':
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = 'Employees'
            headers = ['Name', 'Email', 'Mobile', 'Type', 'Department', 'Designation', 'Joining Date', 'Status']
            ws.append(headers)
            for emp in employees:
                ws.append([
                    emp.name, emp.email, emp.mobile,
                    emp.get_employee_type_display(), emp.department,
                    emp.designation, str(emp.joining_date), emp.get_status_display()
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

        else:  # PDF
            buf = BytesIO()
            doc = SimpleDocTemplate(buf, pagesize=A4)
            styles = getSampleStyleSheet()
            elements = [Paragraph('Employee Report - Zayron Infotech', styles['Title']), Spacer(1, 20)]
            data = [['Name', 'Email', 'Type', 'Department', 'Status']]
            for emp in employees:
                data.append([emp.name, emp.email, emp.get_employee_type_display(), emp.department, emp.get_status_display()])
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
            doc.build(elements)
            buf.seek(0)
            response = HttpResponse(buf.read(), content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="employees.pdf"'
            return response


class ResendEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            employee = Employee.objects.get(pk=pk)
            send_onboarding_email(employee)
            return Response({'message': 'Email sent successfully.'})
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
