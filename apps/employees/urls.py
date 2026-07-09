from django.urls import path
from .views import (
    EmployeeListCreateView, EmployeeDetailView, EmployeeByTokenView,
    DashboardStatsView, ExportEmployeesView, ResendEmailView
)

urlpatterns = [
    path('', EmployeeListCreateView.as_view(), name='employee-list'),
    path('<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),
    path('token/<uuid:token>/', EmployeeByTokenView.as_view(), name='employee-by-token'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('export/', ExportEmployeesView.as_view(), name='export-employees'),
    path('<int:pk>/resend-email/', ResendEmailView.as_view(), name='resend-email'),
]
