from django.urls import path
from .views import EmployeeDetailsSubmitView, EmployeeDetailsView

urlpatterns = [
    path('submit/<uuid:token>/', EmployeeDetailsSubmitView.as_view(), name='details-submit'),
    path('employee/<str:employee_id>/', EmployeeDetailsView.as_view(), name='details-view'),
]
