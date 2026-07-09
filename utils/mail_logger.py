from datetime import datetime, timezone
import pymongo
from django.conf import settings


def _get_collection():
    client = pymongo.MongoClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB]
    col = db['mail_logs']
    col.create_index([('sent_at', pymongo.DESCENDING)])
    col.create_index([('to_email', pymongo.ASCENDING)])
    col.create_index([('status', pymongo.ASCENDING)])
    return col


def log_email(to_email, subject, email_type, status='sent', error=None, extra=None):
    try:
        col = _get_collection()
        col.insert_one({
            'to_email':   to_email,
            'subject':    subject,
            'email_type': email_type,   # e.g. 'onboarding', 'nda_copy', 'completion', 'password_reset'
            'status':     status,       # 'sent' | 'failed'
            'error':      str(error) if error else None,
            'extra':      extra or {},
            'sent_at':    datetime.now(timezone.utc),
        })
    except Exception:
        pass  # never let logging break email flow
