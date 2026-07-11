from django.urls import path
from .views import (
    EmployeeListCreateView, EmployeeDetailView, EmployeeByTokenView,
    DashboardStatsView, ExportEmployeesView, ResendEmailView, MyProfileView
)

urlpatterns = [
    path('', EmployeeListCreateView.as_view(), name='employee-list'),
    path('me/', MyProfileView.as_view(), name='my-profile'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('export/', ExportEmployeesView.as_view(), name='export-employees'),
    path('token/<uuid:token>/', EmployeeByTokenView.as_view(), name='employee-by-token'),
    path('<str:pk>/resend-email/', ResendEmailView.as_view(), name='resend-email'),
    path('<str:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),
]
