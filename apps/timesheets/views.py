from datetime import datetime, timezone, timedelta
from bson import ObjectId

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdminOrHR
from utils.mongo_db import col
from utils.email_service import send_timesheet_email


def _oid(s):
    try:
        return ObjectId(s)
    except Exception:
        return None


def _ser(doc):
    if not doc:
        return None
    d = dict(doc)
    d['id'] = str(d.pop('_id'))
    for f in ('created_at', 'updated_at', 'submitted_at', 'approved_at'):
        if f in d and d[f]:
            d[f] = d[f].isoformat() if hasattr(d[f], 'isoformat') else str(d[f])
    return d


def _week_start(date_str=None):
    if date_str:
        d = datetime.strptime(date_str, '%Y-%m-%d')
    else:
        d = datetime.now()
    # Monday of that week
    return (d - timedelta(days=d.weekday())).strftime('%Y-%m-%d')


# ── Task Setup ─────────────────────────────────────────────────────────────────

class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        emp_id = str(request.user.pk)
        tasks = list(col('timesheet_tasks').find({'employee_id': emp_id}).sort('created_at', -1))
        return Response([_ser(t) for t in tasks])

    def post(self, request):
        data = request.data
        required = ['client', 'project', 'wbs', 'milestone', 'task_name']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return Response({'error': f'Missing: {", ".join(missing)}'}, status=status.HTTP_400_BAD_REQUEST)

        now = datetime.now(timezone.utc)
        doc = {
            'employee_id': str(request.user.pk),
            'employee_email': request.user.email,
            'client': data['client'],
            'project': data['project'],
            'wbs': data['wbs'],
            'milestone': data['milestone'],
            'task_name': data['task_name'],
            'status': 'active',
            'created_at': now,
        }
        result = col('timesheet_tasks').insert_one(doc)
        doc['_id'] = result.inserted_id
        return Response(_ser(doc), status=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        oid = _oid(pk)
        if not oid:
            return Response({'error': 'Invalid ID'}, status=status.HTTP_400_BAD_REQUEST)
        allowed = ['client', 'project', 'wbs', 'milestone', 'task_name', 'status']
        updates = {k: v for k, v in request.data.items() if k in allowed}
        updates['updated_at'] = datetime.now(timezone.utc)
        col('timesheet_tasks').update_one({'_id': oid, 'employee_id': str(request.user.pk)}, {'$set': updates})
        doc = col('timesheet_tasks').find_one({'_id': oid})
        return Response(_ser(doc))

    def delete(self, request, pk):
        oid = _oid(pk)
        col('timesheet_tasks').delete_one({'_id': oid, 'employee_id': str(request.user.pk)})
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Timesheet Entry ────────────────────────────────────────────────────────────

class TimesheetView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        emp_id = str(request.user.pk)
        week = request.query_params.get('week') or _week_start()
        sheet = col('timesheets').find_one({'employee_id': emp_id, 'week_start': week})
        if not sheet:
            return Response({'week_start': week, 'status': 'draft', 'entries': []})
        return Response(_ser(sheet))

    def post(self, request):
        """Save/update draft entries."""
        emp_id = str(request.user.pk)
        data = request.data
        week = data.get('week_start') or _week_start()
        entries = data.get('entries', [])

        now = datetime.now(timezone.utc)
        existing = col('timesheets').find_one({'employee_id': emp_id, 'week_start': week})

        if existing and existing.get('status') in ('submitted', 'approved'):
            return Response({'error': 'Cannot edit a submitted/approved timesheet.'}, status=status.HTTP_400_BAD_REQUEST)

        payload = {
            'employee_id': emp_id,
            'employee_email': request.user.email,
            'employee_name': request.user.get_full_name() or request.user.username,
            'week_start': week,
            'entries': entries,
            'status': 'draft',
            'updated_at': now,
        }
        if existing:
            col('timesheets').update_one({'_id': existing['_id']}, {'$set': payload})
            payload['_id'] = existing['_id']
        else:
            payload['created_at'] = now
            result = col('timesheets').insert_one(payload)
            payload['_id'] = result.inserted_id

        return Response(_ser(payload))


class TimesheetSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, sheet_id):
        oid = _oid(sheet_id)
        emp_id = str(request.user.pk)
        sheet = col('timesheets').find_one({'_id': oid, 'employee_id': emp_id})
        if not sheet:
            return Response({'error': 'Timesheet not found.'}, status=status.HTTP_404_NOT_FOUND)
        if sheet.get('status') == 'approved':
            return Response({'error': 'Already approved.'}, status=status.HTTP_400_BAD_REQUEST)

        col('timesheets').update_one({'_id': oid}, {'$set': {
            'status': 'submitted',
            'submitted_at': datetime.now(timezone.utc),
        }})
        sheet = col('timesheets').find_one({'_id': oid})
        return Response(_ser(sheet))


# ── HR Approval ────────────────────────────────────────────────────────────────

class TimesheetApprovalListView(APIView):
    permission_classes = [IsAdminOrHR]

    def get(self, request):
        query = {}
        status_f = request.query_params.get('status')
        if status_f:
            query['status'] = status_f
        sheets = list(col('timesheets').find(query).sort('submitted_at', -1))
        return Response([_ser(s) for s in sheets])


class TimesheetApproveView(APIView):
    permission_classes = [IsAdminOrHR]

    def post(self, request, sheet_id):
        oid = _oid(sheet_id)
        sheet = col('timesheets').find_one({'_id': oid})
        if not sheet:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action', 'approve')  # approve | reject
        new_status = 'approved' if action == 'approve' else 'rejected'

        col('timesheets').update_one({'_id': oid}, {'$set': {
            'status': new_status,
            'approved_at': datetime.now(timezone.utc),
            'approved_by': request.user.username,
            'hr_comment': request.data.get('comment', ''),
        }})
        sheet = col('timesheets').find_one({'_id': oid})

        try:
            send_timesheet_email(sheet, new_status)
        except Exception:
            pass

        return Response(_ser(sheet))


class MyTimesheetsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        emp_id = str(request.user.pk)
        sheets = list(col('timesheets').find({'employee_id': emp_id}).sort('week_start', -1))
        return Response([_ser(s) for s in sheets])
