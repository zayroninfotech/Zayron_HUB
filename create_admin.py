import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'onboarding.settings')
django.setup()

from apps.accounts.models import User

if not User.objects.filter(username='vamsi').exists():
    u = User.objects.create_superuser('vamsi', 'admin@zayroninfotech.com', 'Zayron@2026')
    u.role = 'superadmin'
    u.first_name = 'Vamsi'
    u.last_name = 'Admin'
    u.save()
    print('Super Admin created!')
    print('  Username : vamsi')
    print('  Password : Zayron@2026')
else:
    print('Admin already exists (username: vamsi / password: Zayron@2026)')
