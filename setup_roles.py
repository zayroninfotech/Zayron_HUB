"""
MongoDB Roles Collection Setup for Zayron Portal
Creates 'roles' collection and inserts all role definitions.
"""

import os
import sys
from datetime import datetime, timezone

from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure

MONGO_URI  = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME    = 'Zayron_Portal'
COLLECTION = 'roles'

ROLES = [
    {
        'role_id':     'superadmin',
        'name':        'Super Admin',
        'description': 'Full access to all modules and settings.',
        'permissions': ['all'],
        'is_active':   True,
    },
    {
        'role_id':     'hr',
        'name':        'HR',
        'description': 'Manage employees, onboarding, documents, and NDAs.',
        'permissions': ['employees', 'onboarding', 'documents', 'ndas', 'reports'],
        'is_active':   True,
    },
    {
        'role_id':     'it_admin',
        'name':        'IT Admin',
        'description': 'Manage system users, roles, and technical configurations.',
        'permissions': ['users', 'roles', 'system', 'projects'],
        'is_active':   True,
    },
    {
        'role_id':     'onboarding',
        'name':        'Onboarding',
        'description': 'Handle new employee onboarding flow and NDA signing.',
        'permissions': ['onboarding', 'ndas', 'documents'],
        'is_active':   True,
    },
    {
        'role_id':     'employee',
        'name':        'Employee',
        'description': 'Basic access — view own profile, documents, and projects.',
        'permissions': ['profile', 'documents_view', 'projects_view'],
        'is_active':   True,
    },
]


def connect_mongo():
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    try:
        client.admin.command('ping')
        print('[OK] Connected to MongoDB at ' + MONGO_URI)
    except ConnectionFailure:
        print('[ERR] Cannot connect to MongoDB. Make sure mongod is running.')
        sys.exit(1)
    return client


def setup_roles(db):
    col = db[COLLECTION]

    if COLLECTION not in db.list_collection_names():
        db.create_collection(COLLECTION)
        print("[OK] Collection 'roles' created.")
    else:
        print("[--] Collection 'roles' already exists.")

    col.create_index([('role_id', ASCENDING)], unique=True)

    inserted = 0
    skipped  = 0
    for role in ROLES:
        doc = {**role, 'created_at': datetime.now(timezone.utc)}
        result = col.update_one(
            {'role_id': role['role_id']},
            {'$setOnInsert': doc},
            upsert=True
        )
        if result.upserted_id:
            inserted += 1
            print('   [+] Added : ' + role['role_id'] + ' -- ' + role['name'])
        else:
            skipped += 1
            print('   [~] Exists: ' + role['role_id'] + ' -- ' + role['name'])

    print('[OK] Done -- ' + str(inserted) + ' inserted, ' + str(skipped) + ' skipped.')
    return col


def print_roles(col):
    roles = list(col.find({}, {'_id': 0, 'created_at': 0}))
    sep = '-' * 72
    print('\n' + sep)
    print('  Roles in MongoDB > ' + DB_NAME + ' > ' + COLLECTION + '  (' + str(len(roles)) + ' total)')
    print(sep)
    fmt = '{:<15} {:<18} {}'
    print(fmt.format('Role ID', 'Display Name', 'Permissions'))
    print(fmt.format('-'*14, '-'*17, '-'*35))
    for r in roles:
        perms = ', '.join(r.get('permissions', []))
        print(fmt.format(r['role_id'], r['name'], perms))
    print(sep + '\n')


def main():
    sep = '=' * 72
    print('\n' + sep)
    print('  Zayron Portal -- Roles Collection Setup')
    print('  Database : ' + DB_NAME)
    print(sep + '\n')

    client = connect_mongo()
    db     = client[DB_NAME]

    col = setup_roles(db)
    print_roles(col)

    client.close()
    print('[OK] MongoDB connection closed.')


if __name__ == '__main__':
    main()
