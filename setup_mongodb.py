"""
MongoDB Setup Script for Zayron Portal
- Creates Zayron_Portal database
- Creates 'users' collection with indexes
- Imports existing Django/SQLite users
- Adds superadmin 'sai' with password Zayron@2026
"""

import os
import sys
import django
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'onboarding.settings')
django.setup()

from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure
from django.contrib.auth.hashers import make_password
from apps.accounts.models import User as DjangoUser

MONGO_URI  = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME    = 'Zayron_Portal'
COLLECTION = 'users'


def connect_mongo():
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    try:
        client.admin.command('ping')
        print('[OK] Connected to MongoDB at ' + MONGO_URI)
    except ConnectionFailure:
        print('[ERR] Cannot connect to MongoDB. Make sure mongod is running.')
        sys.exit(1)
    return client


def setup_collection(db):
    if COLLECTION not in db.list_collection_names():
        db.create_collection(COLLECTION)
        print("[OK] Collection '" + COLLECTION + "' created.")
    else:
        print("[--] Collection '" + COLLECTION + "' already exists.")

    col = db[COLLECTION]
    col.create_index([('username', ASCENDING)], unique=True)
    col.create_index([('email',    ASCENDING)])
    return col


def import_django_users(col):
    django_users = DjangoUser.objects.all()
    if not django_users.exists():
        print('[--] No existing Django users found in SQLite.')
        return

    imported = 0
    skipped  = 0
    for u in django_users:
        doc = {
            'username':     u.username,
            'email':        u.email or '',
            'first_name':   u.first_name or '',
            'last_name':    u.last_name or '',
            'mobile':       u.mobile or '',
            'role':         u.role,
            'is_active':    u.is_active,
            'is_staff':     u.is_staff,
            'is_superuser': u.is_superuser,
            'password':     u.password,
            'date_joined':  u.date_joined.isoformat(),
            'last_login':   u.last_login.isoformat() if u.last_login else None,
            'source':       'django_sqlite',
            'created_at':   datetime.now(timezone.utc),
        }
        result = col.update_one(
            {'username': u.username},
            {'$setOnInsert': doc},
            upsert=True
        )
        if result.upserted_id:
            imported += 1
            print('   [+] Imported : ' + u.username + ' (' + u.role + ')')
        else:
            skipped += 1
            print('   [~] Skipped  : ' + u.username + ' (already exists)')

    print('[OK] Import done -- ' + str(imported) + ' imported, ' + str(skipped) + ' skipped.')


def add_superadmin(col):
    doc = {
        'username':     'sai',
        'email':        'sai@zayroninfotech.com',
        'first_name':   'Sai',
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
    result = col.update_one(
        {'username': 'sai'},
        {'$setOnInsert': doc},
        upsert=True
    )
    if result.upserted_id:
        print("[OK] Superadmin 'sai' created successfully.")
    else:
        print("[--] Superadmin 'sai' already exists -- not overwritten.")


def print_users(col):
    users = list(col.find({}, {'password': 0, '_id': 0}))
    sep = '-' * 65
    print('\n' + sep)
    print('  Users in MongoDB > ' + DB_NAME + ' > ' + COLLECTION + '  (' + str(len(users)) + ' total)')
    print(sep)
    fmt = '{:<15} {:<15} {:<10} {:<8} {}'
    print(fmt.format('Username', 'Role', 'Active', 'Super', 'Email'))
    print(fmt.format('-'*14, '-'*14, '-'*9, '-'*7, '-'*25))
    for u in users:
        print(fmt.format(
            u.get('username', ''),
            u.get('role', ''),
            str(u.get('is_active', '')),
            str(u.get('is_superuser', '')),
            u.get('email', ''),
        ))
    print(sep + '\n')


def main():
    sep = '=' * 65
    print('\n' + sep)
    print('  Zayron Portal -- MongoDB Setup')
    print('  Database : ' + DB_NAME)
    print(sep + '\n')

    client = connect_mongo()
    db     = client[DB_NAME]
    print('[OK] Using database: ' + DB_NAME)

    col = setup_collection(db)
    import_django_users(col)
    add_superadmin(col)
    print_users(col)

    client.close()
    print('[OK] Done. MongoDB connection closed.')


if __name__ == '__main__':
    main()
