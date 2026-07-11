from datetime import datetime, timezone
from utils.mongo_db import col


def log_email(to_email, subject, email_type, status='sent', error=None, extra=None):
    try:
        col('mail_logs').insert_one({
            'to_email':   to_email,
            'subject':    subject,
            'email_type': email_type,
            'status':     status,
            'error':      str(error) if error else None,
            'extra':      extra or {},
            'sent_at':    datetime.now(timezone.utc),
        })
    except Exception:
        pass  # never let logging break email flow
