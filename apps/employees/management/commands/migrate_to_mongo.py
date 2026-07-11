"""
Management command to migrate existing SQLite data to MongoDB.
Run once: python manage.py migrate_to_mongo
"""
from datetime import datetime, timezone
from django.core.management.base import BaseCommand
from django.conf import settings
from utils.mongo_db import col


class Command(BaseCommand):
    help = 'Migrate business data from SQLite to MongoDB'

    def handle(self, *args, **options):
        self.stdout.write('Starting SQLite → MongoDB migration...')

        try:
            from apps.employees.models import Employee as EmpModel
            self._migrate_employees(EmpModel)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Employee migration failed: {e}'))

        try:
            from apps.ndas.models import NDADocument
            self._migrate_ndas(NDADocument)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'NDA migration failed: {e}'))

        try:
            from apps.documents.models import EmployeeDetails
            self._migrate_details(EmployeeDetails)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Details migration failed: {e}'))

        try:
            from apps.projects.models import Project, Task, UserStory
            self._migrate_projects(Project, Task, UserStory)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Projects migration failed: {e}'))

        self.stdout.write(self.style.SUCCESS('Migration complete.'))

    def _migrate_employees(self, EmpModel):
        employees = list(EmpModel.objects.select_related('created_by').all())
        if not employees:
            self.stdout.write('  No employees in SQLite.')
            return

        for emp in employees:
            emp_id = str(emp.id)
            if col('employees').find_one({'_legacy_id': emp_id}):
                self.stdout.write(f'  Employee {emp.email} already migrated, skipping.')
                continue
            doc = {
                'name': emp.name,
                'email': emp.email,
                'mobile': emp.mobile or '',
                'employee_type': emp.employee_type,
                'department': emp.department or '',
                'designation': emp.designation or '',
                'joining_date': str(emp.joining_date) if emp.joining_date else '',
                'onboarding_token': str(emp.onboarding_token),
                'status': emp.status,
                'created_by': emp.created_by.username if emp.created_by else '',
                'created_at': emp.created_at.replace(tzinfo=timezone.utc) if emp.created_at else datetime.now(timezone.utc),
                'updated_at': emp.updated_at.replace(tzinfo=timezone.utc) if emp.updated_at else datetime.now(timezone.utc),
                '_legacy_id': emp_id,
            }
            try:
                col('employees').insert_one(doc)
                self.stdout.write(f'  Migrated employee: {emp.email}')
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skipped {emp.email}: {e}'))

    def _migrate_ndas(self, NDADocument):
        ndas = list(NDADocument.objects.select_related('employee').all())
        if not ndas:
            self.stdout.write('  No NDA documents in SQLite.')
            return

        for nda in ndas:
            legacy_emp_id = str(nda.employee_id)
            emp_doc = col('employees').find_one({'_legacy_id': legacy_emp_id})
            if not emp_doc:
                self.stdout.write(self.style.WARNING(f'  Employee not in Mongo for NDA {nda.id}, skipping.'))
                continue
            mongo_emp_id = str(emp_doc['_id'])
            if col('nda_documents').find_one({'employee_id': mongo_emp_id}):
                self.stdout.write(f'  NDA for {nda.employee.email} already migrated, skipping.')
                continue

            pdf_path = str(nda.pdf_file) if nda.pdf_file else None

            doc = {
                'employee_id': mongo_emp_id,
                'full_name': nda.full_name or '',
                'address': nda.address or '',
                'mobile': nda.mobile or '',
                'aadhaar_number': nda.aadhaar_number or '',
                'emergency_contact': nda.emergency_contact or '',
                'signed_date': str(nda.signed_date) if nda.signed_date else '',
                'signature': nda.signature or '',
                'pdf_file_path': pdf_path,
                'created_at': nda.created_at.replace(tzinfo=timezone.utc) if nda.created_at else datetime.now(timezone.utc),
                '_legacy_id': str(nda.id),
            }
            col('nda_documents').insert_one(doc)
            self.stdout.write(f'  Migrated NDA for: {nda.employee.email}')

    def _migrate_details(self, EmployeeDetails):
        details_qs = list(EmployeeDetails.objects.select_related('employee').all())
        if not details_qs:
            self.stdout.write('  No employee details in SQLite.')
            return

        for det in details_qs:
            legacy_emp_id = str(det.employee_id)
            emp_doc = col('employees').find_one({'_legacy_id': legacy_emp_id})
            if not emp_doc:
                self.stdout.write(self.style.WARNING(f'  Employee not in Mongo for details {det.id}, skipping.'))
                continue
            mongo_emp_id = str(emp_doc['_id'])
            if col('employee_details').find_one({'employee_id': mongo_emp_id}):
                self.stdout.write(f'  Details for {det.employee.email} already migrated, skipping.')
                continue

            doc = {
                'employee_id': mongo_emp_id,
                'mobile_number': det.mobile_number or '',
                'father_name': det.father_name or '',
                'date_of_birth': str(det.date_of_birth) if det.date_of_birth else '',
                'gender': det.gender or '',
                'blood_group': det.blood_group or '',
                'address': det.address or '',
                'qualification': det.qualification or '',
                'previous_experience': det.previous_experience or '',
                'pan_number': det.pan_number or '',
                'aadhaar_number': det.aadhaar_number or '',
                'bank_name': det.bank_name or '',
                'account_number': det.account_number or '',
                'ifsc_code': det.ifsc_code or '',
                'emergency_contact_name': det.emergency_contact_name or '',
                'emergency_contact': det.emergency_contact or '',
                'photograph_path': str(det.photograph) if det.photograph else None,
                'resume_path': str(det.resume) if det.resume else None,
                'aadhaar_copy_path': str(det.aadhaar_copy) if det.aadhaar_copy else None,
                'pan_copy_path': str(det.pan_copy) if det.pan_copy else None,
                'educational_certificates_path': str(det.educational_certificates) if det.educational_certificates else None,
                'created_at': det.created_at.replace(tzinfo=timezone.utc) if det.created_at else datetime.now(timezone.utc),
                '_legacy_id': str(det.id),
            }
            col('employee_details').insert_one(doc)
            self.stdout.write(f'  Migrated details for: {det.employee.email}')

    def _migrate_projects(self, Project, Task, UserStory):
        projects = list(Project.objects.prefetch_related('assigned_employees', 'tasks__user_stories').all())
        if not projects:
            self.stdout.write('  No projects in SQLite.')
            return

        for proj in projects:
            if col('projects').find_one({'_legacy_id': str(proj.id)}):
                self.stdout.write(f'  Project "{proj.name}" already migrated, skipping.')
                continue

            assigned_ids = []
            for emp in proj.assigned_employees.all():
                emp_doc = col('employees').find_one({'_legacy_id': str(emp.id)})
                if emp_doc:
                    assigned_ids.append(str(emp_doc['_id']))

            proj_doc = {
                'name': proj.name,
                'description': proj.description or '',
                'status': proj.status or 'active',
                'start_date': str(proj.start_date) if proj.start_date else '',
                'assigned_employee_ids': assigned_ids,
                'created_at': proj.created_at.replace(tzinfo=timezone.utc) if proj.created_at else datetime.now(timezone.utc),
                '_legacy_id': str(proj.id),
            }
            proj_result = col('projects').insert_one(proj_doc)
            mongo_proj_id = str(proj_result.inserted_id)
            self.stdout.write(f'  Migrated project: {proj.name}')

            for task in proj.tasks.all():
                task_doc = {
                    'project_id': mongo_proj_id,
                    'title': task.title or '',
                    'description': task.description or '',
                    'status': task.status or 'todo',
                    'screenshot_path': str(task.screenshot) if task.screenshot else None,
                    'created_at': task.created_at.replace(tzinfo=timezone.utc) if task.created_at else datetime.now(timezone.utc),
                    '_legacy_id': str(task.id),
                }
                task_result = col('tasks').insert_one(task_doc)
                mongo_task_id = str(task_result.inserted_id)

                for story in task.user_stories.all():
                    story_doc = {
                        'task_id': mongo_task_id,
                        'story': story.story or '',
                        'created_at': story.created_at.replace(tzinfo=timezone.utc) if story.created_at else datetime.now(timezone.utc),
                        '_legacy_id': str(story.id),
                    }
                    col('user_stories').insert_one(story_doc)
