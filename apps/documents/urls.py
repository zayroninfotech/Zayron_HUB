from django.urls import path
from .views import EmployeeDetailsSubmitView, EmployeeDetailsView, ResendCredentialsView

urlpatterns = [
    path('submit/<uuid:token>/', EmployeeDetailsSubmitView.as_view(), name='details-submit'),
    path('employee/<str:employee_id>/', EmployeeDetailsView.as_view(), name='details-view'),
    path('resend-credentials/<str:employee_id>/', ResendCredentialsView.as_view(), name='resend-credentials'),
]
