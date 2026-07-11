from django.urls import path
from .views import (
    ProjectListView, ProjectDetailView, ProjectAssignEmployeeView,
    TaskListView, TaskDetailView,
    UserStoryListView, UserStoryDetailView,
    CompletedEmployeesView,
)

urlpatterns = [
    path('', ProjectListView.as_view()),
    path('completed-employees/', CompletedEmployeesView.as_view()),
    path('tasks/<str:pk>/', TaskDetailView.as_view()),
    path('tasks/<str:task_id>/stories/', UserStoryListView.as_view()),
    path('stories/<str:pk>/', UserStoryDetailView.as_view()),
    path('<str:pk>/', ProjectDetailView.as_view()),
    path('<str:pk>/assign/', ProjectAssignEmployeeView.as_view()),
    path('<str:project_id>/tasks/', TaskListView.as_view()),
]
