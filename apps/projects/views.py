from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Project, Task, UserStory
from .serializers import ProjectSerializer, ProjectListSerializer, TaskSerializer, UserStorySerializer, AssignedEmployeeSerializer
from apps.employees.models import Employee


class CompletedEmployeesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employees = Employee.objects.filter(status='completed').order_by('name')
        return Response(AssignedEmployeeSerializer(employees, many=True).data)


class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.prefetch_related('assigned_employees', 'tasks').order_by('-created_at')
        return Response(ProjectListSerializer(projects, many=True).data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            project = Project.objects.prefetch_related('assigned_employees', 'tasks__user_stories').get(pk=pk)
            return Response(ProjectSerializer(project, context={'request': request}).data)
        except Project.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            Project.objects.get(pk=pk).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Project.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


class ProjectAssignEmployeeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        employee_id = request.data.get('employee_id')
        try:
            employee = Employee.objects.get(pk=employee_id, status='completed')
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found or not completed.'}, status=status.HTTP_404_NOT_FOUND)
        project.assigned_employees.add(employee)
        return Response(ProjectSerializer(project, context={'request': request}).data)

    def delete(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        employee_id = request.data.get('employee_id')
        try:
            employee = Employee.objects.get(pk=employee_id)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
        project.assigned_employees.remove(employee)
        return Response(ProjectSerializer(project, context={'request': request}).data)


class TaskListView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, project_id):
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        data['project'] = project.id
        serializer = TaskSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TaskSerializer(task, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            Task.objects.get(pk=pk).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Task.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


class UserStoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):
        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserStorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserStoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            UserStory.objects.get(pk=pk).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserStory.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
