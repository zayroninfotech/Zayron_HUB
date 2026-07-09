import os, sys, django
sys.path.insert(0, '.')
os.environ['DJANGO_SETTINGS_MODULE'] = 'onboarding.settings'
django.setup()

from pymongo import MongoClient
from django.contrib.auth.hashers import make_password
from datetime import datetime, timezone

client = MongoClient('mongodb://localhost:27017/')
db = client['Zayron_Portal']
col = db['users']

doc = {
    'username':     'vamsi',
    'email':        'vamsi@zayroninfotech.com',
    'first_name':   'Vamsi',
    'last_name':    '',
    'mobile':       '',
    'role':         'superadmin',
    'is_active':    True,
    'is_staff':     True,
    'is_superuser': True,
    'password':     make_password('Zayron@2026'),
    'date_joined':  datetime.now(timezone.utc).isoformat(),
    'last_login':   None,
    'source':       'manual',
    'created_at':   datetime.now(timezone.utc),
}

result = col.update_one({'username': 'vamsi'}, {'$setOnInsert': doc}, upsert=True)

if result.upserted_id:
    print('[OK] User vamsi created successfully.')
else:
    print('[--] User vamsi already exists.')

# Print all users
users = list(col.find({}, {'password': 0, '_id': 0, 'created_at': 0}))
print('\nAll users in Zayron_Portal.users:')
print('-' * 55)
for u in users:
    print(f"  {u['username']:<12} {u['role']:<15} {u.get('email','')}")
print('-' * 55)
client.close()
