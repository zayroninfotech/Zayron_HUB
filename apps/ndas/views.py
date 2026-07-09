from django.core.files.base import ContentFile
from django.http import FileResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.employees.models import Employee
from .models import NDADocument
from .serializers import NDADocumentSerializer, NDACreateSerializer
from .pdf_generator import generate_nda_pdf
from utils.email_service import send_nda_copy_email


class NDASubmitView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, token):
        try:
            employee = Employee.objects.get(onboarding_token=token)
        except Employee.DoesNotExist:
            return Response({'error': 'Invalid onboarding link.'}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(employee, 'ndadocument'):
            return Response({'error': 'NDA already submitted.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = NDACreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        nda = serializer.save(employee=employee)

        # Generate PDF
        try:
            pdf_buf = generate_nda_pdf(nda)
            filename = f"nda_{employee.id}_{employee.name.replace(' ', '_')}.pdf"
            nda.pdf_file.save(filename, ContentFile(pdf_buf.read()), save=True)
        except Exception as e:
            pass  # PDF failure shouldn't block submission

        # Update employee status
        employee.status = 'nda_signed'
        employee.save()

        # Send copy to employee
        try:
            send_nda_copy_email(nda)
        except Exception:
            pass

        return Response(NDADocumentSerializer(nda, context={'request': request}).data, status=status.HTTP_201_CREATED)


class NDADetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        try:
            nda = NDADocument.objects.get(employee_id=employee_id)
            return Response(NDADocumentSerializer(nda, context={'request': request}).data)
        except NDADocument.DoesNotExist:
            return Response({'error': 'NDA not found.'}, status=status.HTTP_404_NOT_FOUND)


class NDADownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        try:
            nda = NDADocument.objects.get(employee_id=employee_id)
            if not nda.pdf_file:
                return Response({'error': 'PDF not available.'}, status=status.HTTP_404_NOT_FOUND)
            response = FileResponse(nda.pdf_file.open('rb'), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{nda.pdf_file.name.split("/")[-1]}"'
            return response
        except NDADocument.DoesNotExist:
            return Response({'error': 'NDA not found.'}, status=status.HTTP_404_NOT_FOUND)


class NDARegenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, employee_id):
        try:
            nda = NDADocument.objects.get(employee_id=employee_id)
            pdf_buf = generate_nda_pdf(nda)
            filename = f"nda_{nda.employee.id}_{nda.employee.name.replace(' ', '_')}.pdf"
            if nda.pdf_file:
                nda.pdf_file.delete(save=False)
            nda.pdf_file.save(filename, ContentFile(pdf_buf.read()), save=True)
            return Response({'message': 'PDF regenerated successfully.', 'pdf_url': request.build_absolute_uri(nda.pdf_file.url)})
        except NDADocument.DoesNotExist:
            return Response({'error': 'NDA not found.'}, status=status.HTTP_404_NOT_FOUND)
