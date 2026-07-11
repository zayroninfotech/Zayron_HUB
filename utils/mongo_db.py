from pymongo import MongoClient, ASCENDING
from django.conf import settings

_client = None
_db = None


def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=settings.MONGO_TIMEOUT_MS)
        _db = _client[settings.MONGO_DB]
        _ensure_indexes(_db)
    return _db


def col(name):
    return get_db()[name]


def _ensure_indexes(db):
    db.employees.create_index([('email', ASCENDING)], unique=True, background=True)
    db.employees.create_index([('onboarding_token', ASCENDING)], unique=True, background=True)
    db.nda_documents.create_index([('employee_id', ASCENDING)], unique=True, background=True)
    db.employee_details.create_index([('employee_id', ASCENDING)], unique=True, background=True)
    db.projects.create_index([('created_at', ASCENDING)], background=True)
    db.tasks.create_index([('project_id', ASCENDING)], background=True)
    db.user_stories.create_index([('task_id', ASCENDING)], background=True)
