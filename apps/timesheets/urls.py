from django.urls import path
from .views import (
    TaskListCreateView, TaskDetailView,
    TimesheetView, TimesheetSubmitView,
    TimesheetApprovalListView, TimesheetApproveView,
    MyTimesheetsView,
)

urlpatterns = [
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<str:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('entry/', TimesheetView.as_view(), name='timesheet-entry'),
    path('entry/<str:sheet_id>/submit/', TimesheetSubmitView.as_view(), name='timesheet-submit'),
    path('my/', MyTimesheetsView.as_view(), name='my-timesheets'),
    path('approval/', TimesheetApprovalListView.as_view(), name='timesheet-approval-list'),
    path('approval/<str:sheet_id>/', TimesheetApproveView.as_view(), name='timesheet-approve'),
]
