import os
from datetime import datetime, timezone

from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.conf import settings

from apps.accounts.permissions import IsAdminOrHR
from utils.mongo_db import col


def _oid(id_str):
    try:
        return ObjectId(id_str)
    except Exception:
        return None


def _serialize_task(doc):
    if not doc:
        return None
    d = dict(doc)
    d['id'] = str(d.pop('_id'))
    d['project_id'] = d.get('project_id', '')
    if d.get('screenshot_path'):
        d['screenshot_url'] = f"{settings.MEDIA_URL}{d['screenshot_path']}"
    if 'created_at' in d and d['created_at']:
        d['created_at'] = d['created_at'].isoformat() if hasattr(d['created_at'], 'isoformat') else str(d['created_at'])
    stories = list(col('user_stories').find({'task_id': d['id']}))
    d['user_stories'] = [_serialize_story(s) for s in stories]
    return d


def _serialize_story(doc):
    if not doc:
        return None
    d = dict(doc)
    d['id'] = str(d.pop('_id'))
    if 'created_at' in d and d['created_at']:
        d['created_at'] = d['created_at'].isoformat() if hasattr(d['created_at'], 'isoformat') else str(d['created_at'])
    return d


def _serialize_emp(doc):
    if not doc:
        return None
    return {
        'id': str(doc['_id']),
        'name': doc.get('name', ''),
        'email': doc.get('email', ''),
        'department': doc.get('department', ''),
        'designation': doc.get('designation', ''),
    }


def _serialize_project(doc, include_tasks=True):
    if not doc:
        return None
    d = dict(doc)
    d['id'] = str(d.pop('_id'))
    if 'created_at' in d and d['created_at']:
        d['created_at'] = d['created_at'].isoformat() if hasattr(d['created_at'], 'isoformat') else str(d['created_at'])
    if 'start_date' in d and d['start_date']:
        d['start_date'] = str(d['start_date'])

    assigned_ids = d.get('assigned_employee_ids', [])
    assigned_docs = []
    for eid in assigned_ids:
        emp = col('employees').find_one({'_id': _oid(eid)})
        if emp:
            assigned_docs.append(_serialize_emp(emp))
    d['assigned_employees'] = assigned_docs

    if include_tasks:
        tasks = list(col('tasks').find({'project_id': d['id']}))
        d['tasks'] = [_serialize_task(t) for t in tasks]

    return d


def _save_screenshot(file_obj, project_id, task_id):
    ext = os.path.splitext(file_obj.name)[1]
    filename = f'task_{task_id}{ext}'
    subfolder = f'projects/{project_id}/screenshots'
    dir_path = os.path.join(settings.MEDIA_ROOT, subfolder)
    os.makedirs(dir_path, exist_ok=True)
    file_path = os.path.join(dir_path, filename)
    with open(file_path, 'wb') as f:
        for chunk in file_obj.chunks():
            f.write(chunk)
    return f'{subfolder}/{filename}'


class CompletedEmployeesView(APIView):
    permission_classes = [IsAdminOrHR]

    def get(self, request):
        docs = list(col('employees').find({'status': 'completed'}).sort('name', 1))
        return Response([_serialize_emp(d) for d in docs])


class ProjectListView(APIView):
    permission_classes = [IsAdminOrHR]

    def get(self, request):
        docs = list(col('projects').find({}).sort('created_at', -1))
        return Response([_serialize_project(d, include_tasks=True) for d in docs])

    def post(self, request):
        data = request.data
        if not data.get('name'):
            return Response({'error': 'Project name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        now = datetime.now(timezone.utc)
        doc = {
            'name': data['name'],
            'description': data.get('description', ''),
            'status': data.get('status', 'active'),
            'start_date': data.get('start_date', ''),
            'assigned_employee_ids': data.get('assigned_employee_ids', []),
            'created_at': now,
        }
        result = col('projects').insert_one(doc)
        doc['_id'] = result.inserted_id
        return Response(_serialize_project(doc), status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    permission_classes = [IsAdminOrHR]

    def get(self, request, pk):
        doc = col('projects').find_one({'_id': _oid(pk)})
        if not doc:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize_project(doc))

    def put(self, request, pk):
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid ID.'}, status=status.HTTP_400_BAD_REQUEST)
        allowed = ['name', 'description', 'status', 'start_date', 'assigned_employee_ids']
        updates = {k: v for k, v in request.data.items() if k in allowed}
        if not updates:
            return Response({'error': 'No valid fields to update.'}, status=status.HTTP_400_BAD_REQUEST)
        doc = col('projects').find_one_and_update(
            {'_id': oid}, {'$set': updates}, return_document=True
        )
        if not doc:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize_project(doc))

    def delete(self, request, pk):
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid ID.'}, status=status.HTTP_400_BAD_REQUEST)
        result = col('projects').delete_one({'_id': oid})
        if result.deleted_count == 0:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectAssignEmployeeView(APIView):
    permission_classes = [IsAdminOrHR]

    def post(self, request, pk):
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid project ID.'}, status=status.HTTP_400_BAD_REQUEST)
        employee_id = str(request.data.get('employee_id', ''))
        if not employee_id:
            return Response({'error': 'employee_id required.'}, status=status.HTTP_400_BAD_REQUEST)
        emp = col('employees').find_one({'_id': _oid(employee_id), 'status': 'completed'})
        if not emp:
            return Response({'error': 'Employee not found or not completed.'}, status=status.HTTP_404_NOT_FOUND)
        doc = col('projects').find_one_and_update(
            {'_id': oid},
            {'$addToSet': {'assigned_employee_ids': employee_id}},
            return_document=True
        )
        if not doc:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize_project(doc))

    def delete(self, request, pk):
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid project ID.'}, status=status.HTTP_400_BAD_REQUEST)
        employee_id = str(request.data.get('employee_id', ''))
        doc = col('projects').find_one_and_update(
            {'_id': oid},
            {'$pull': {'assigned_employee_ids': employee_id}},
            return_document=True
        )
        if not doc:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_serialize_project(doc))


class TaskListView(APIView):
    permission_classes = [IsAdminOrHR]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, project_id):
        project = col('projects').find_one({'_id': _oid(project_id)})
        if not project:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        now = datetime.now(timezone.utc)
        task_doc = {
            'project_id': project_id,
            'title': request.data.get('title', ''),
            'description': request.data.get('description', ''),
            'status': request.data.get('status', 'todo'),
            'screenshot_path': None,
            'created_at': now,
        }
        result = col('tasks').insert_one(task_doc)
        task_doc['_id'] = result.inserted_id

        screenshot = request.FILES.get('screenshot')
        if screenshot:
            try:
                path = _save_screenshot(screenshot, project_id, str(task_doc['_id']))
                col('tasks').update_one({'_id': task_doc['_id']}, {'$set': {'screenshot_path': path}})
                task_doc['screenshot_path'] = path
            except Exception:
                pass

        return Response(_serialize_task(task_doc), status=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
    permission_classes = [IsAdminOrHR]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request, pk):
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid ID.'}, status=status.HTTP_400_BAD_REQUEST)
        allowed = ['title', 'description', 'status']
        updates = {k: v for k, v in request.data.items() if k in allowed}

        screenshot = request.FILES.get('screenshot')
        task_doc = col('tasks').find_one({'_id': oid})
        if not task_doc:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if screenshot:
            try:
                path = _save_screenshot(screenshot, task_doc.get('project_id', ''), pk)
                updates['screenshot_path'] = path
            except Exception:
                pass

        doc = col('tasks').find_one_and_update(
            {'_id': oid}, {'$set': updates}, return_document=True
        )
        return Response(_serialize_task(doc))

    def delete(self, request, pk):
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid ID.'}, status=status.HTTP_400_BAD_REQUEST)
        result = col('tasks').delete_one({'_id': oid})
        if result.deleted_count == 0:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserStoryListView(APIView):
    permission_classes = [IsAdminOrHR]

    def post(self, request, task_id):
        task = col('tasks').find_one({'_id': _oid(task_id)})
        if not task:
            return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)
        doc = {
            'task_id': task_id,
            'story': request.data.get('story', ''),
            'created_at': datetime.now(timezone.utc),
        }
        result = col('user_stories').insert_one(doc)
        doc['_id'] = result.inserted_id
        return Response(_serialize_story(doc), status=status.HTTP_201_CREATED)


class UserStoryDetailView(APIView):
    permission_classes = [IsAdminOrHR]

    def delete(self, request, pk):
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid ID.'}, status=status.HTTP_400_BAD_REQUEST)
        result = col('user_stories').delete_one({'_id': oid})
        if result.deleted_count == 0:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
