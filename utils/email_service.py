import base64
import os
from email.mime.image import MIMEImage
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from utils.mail_logger import log_email

_TYPE_LABELS = {
    'permanent': 'Permanent Employee',
    'contract': 'Contract Employee',
    'intern': 'Intern',
}


def _type_label(employee_type):
    return _TYPE_LABELS.get(employee_type, (employee_type or 'Employee').title())


def _attach_logo(msg):
    logo_path = os.path.join(settings.BASE_DIR, 'static', 'img', 'logo_email.png')
    try:
        with open(logo_path, 'rb') as f:
            logo_img = MIMEImage(f.read())
            logo_img.add_header('Content-ID', '<logo_zayron>')
            logo_img.add_header('Content-Disposition', 'inline', filename='logo.png')
            msg.attach(logo_img)
    except Exception:
        pass


def send_onboarding_email(emp):
    """emp: dict with keys name, email, joining_date, employee_type, id, onboarding_link"""
    subject = 'Welcome to Zayron Infotech Pvt. Ltd.'
    onboarding_link = emp['onboarding_link']
    logo_tag = '<img src="cid:logo_zayron" alt="Zayron Infotech" style="height:60px;width:auto;display:block;margin:0 auto 10px;" />'

    text_body = f"""Dear {emp['name']},

Welcome to Zayron Infotech Pvt. Ltd.

Please complete your onboarding process: {onboarding_link}

Regards,
HR Team
Zayron Infotech Pvt. Ltd.
"""

    html_body = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#e8edf5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">

<tr><td style="background:linear-gradient(135deg,#0c2461,#2563eb);padding:28px 24px;text-align:center;">
{logo_tag}
<p style="color:#fff;font-size:20px;font-weight:700;margin:0 0 4px;">Zayron Infotech Pvt. Ltd.</p>
<p style="color:#bfdbfe;font-size:11px;margin:0;letter-spacing:1px;text-transform:uppercase;">Employee Onboarding Portal</p>
</td></tr>

<tr><td style="background:#f0f5ff;padding:16px 28px;border-bottom:1px solid #dde8ff;">
<p style="color:#0c2461;font-size:17px;font-weight:700;margin:0;">Welcome, {emp['name']}!</p>
<p style="color:#6b7280;font-size:13px;margin:4px 0 0;">We are excited to have you join the Zayron Infotech family.</p>
</td></tr>

<tr><td style="padding:24px 28px;">
<p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">Dear <strong>{emp['name']}</strong>, congratulations on joining <strong>Zayron Infotech Pvt. Ltd.</strong> Please complete your onboarding by signing your NDA and submitting your details.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #c7d8ff;border-radius:8px;overflow:hidden;margin-bottom:24px;">
<tr><td colspan="2" style="background:#1e40af;padding:9px 16px;color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Your Employment Details</td></tr>
<tr><td style="padding:9px 16px;color:#1e40af;font-weight:600;font-size:13px;width:44%;border-bottom:1px solid #dde8ff;">Joining Date</td><td style="padding:9px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{emp.get('joining_date', '')}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:9px 16px;color:#1e40af;font-weight:600;font-size:13px;">Employee Type</td><td style="padding:9px 16px;color:#111;font-size:13px;">{_type_label(emp.get('employee_type', ''))}</td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:4px 0 24px;">
<a href="{onboarding_link}" style="display:inline-block;background:#1e40af;color:#fff;text-decoration:none;padding:14px 48px;border-radius:8px;font-size:15px;font-weight:700;">Complete Onboarding</a>
</td></tr></table>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 18px;">
<p style="color:#374151;font-size:13px;line-height:1.7;margin:0;">For any queries contact us at <a href="mailto:info@zayron.in" style="color:#2563eb;">info@zayron.in</a></p>
<p style="color:#374151;font-size:13px;margin:14px 0 0;">Warm Regards,<br><strong style="color:#0c2461;">HR Team</strong><br><span style="color:#2563eb;font-weight:600;">Zayron Infotech Pvt. Ltd.</span></p>
</td></tr>

<tr><td style="background:#0c2461;padding:16px 24px;text-align:center;">
<p style="color:#93c5fd;font-size:12px;margin:0 0 4px;">info@zayron.in &nbsp;|&nbsp; www.zayron.in</p>
<p style="color:#3b82f6;font-size:11px;margin:0;">&copy; 2026 Zayron Infotech Pvt. Ltd. All rights reserved.</p>
</td></tr>

</table></td></tr></table>
</body></html>
"""

    msg = EmailMultiAlternatives(
        subject=subject, body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL, to=[emp['email']],
    )
    msg.mixed_subtype = 'related'
    msg.attach_alternative(html_body, 'text/html')
    _attach_logo(msg)
    try:
        msg.send()
        log_email(emp['email'], subject, 'onboarding', status='sent',
                  extra={'employee_id': str(emp.get('id', '')), 'employee_name': emp['name']})
    except Exception as e:
        log_email(emp['email'], subject, 'onboarding', status='failed', error=e,
                  extra={'employee_id': str(emp.get('id', '')), 'employee_name': emp['name']})
        raise


def send_onboarding_complete_email(emp, details):
    """
    emp: dict with name, email, joining_date, employee_type, id
    details: dict with all personal/bank fields + file path fields
             (photograph_path, resume_path, aadhaar_copy_path, pan_copy_path,
              educational_certificates_path)
    """
    subject = f'Onboarding Completed – {emp["name"]}'

    text_body = f"""Employee Onboarding Completed

Name: {emp['name']}
Email: {emp['email']}
Joining Date: {emp.get('joining_date', '')}
Employee Type: {_type_label(emp.get('employee_type', ''))}

Father's Name: {details.get('father_name', '')}
Date of Birth: {details.get('date_of_birth', '')}
Gender: {details.get('gender', '')}
Blood Group: {details.get('blood_group', '')}
Address: {details.get('address', '')}
Bank Name: {details.get('bank_name', '')}
Account Number: {details.get('account_number', '')}
IFSC Code: {details.get('ifsc_code', '')}
Emergency Contact: {details.get('emergency_contact_name', '')} ({details.get('emergency_contact', '')})

All uploaded documents are attached to this email.
"""

    html_body = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#e8edf5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">

<tr><td style="background:linear-gradient(135deg,#0c2461,#2563eb);padding:28px 24px;text-align:center;">
<img src="cid:logo_zayron" alt="Zayron Infotech" style="height:60px;width:auto;display:block;margin:0 auto 10px;" />
<p style="color:#fff;font-size:20px;font-weight:700;margin:0 0 4px;">Zayron Infotech Pvt. Ltd.</p>
<p style="color:#bfdbfe;font-size:11px;margin:0;letter-spacing:1px;text-transform:uppercase;">Employee Onboarding Portal</p>
</td></tr>

<tr><td style="background:#ecfdf5;padding:16px 28px;border-bottom:1px solid #6ee7b7;">
<p style="color:#065f46;font-size:17px;font-weight:700;margin:0;">&#10003; Onboarding Completed – {emp['name']}</p>
<p style="color:#6b7280;font-size:13px;margin:4px 0 0;">All documents have been submitted successfully.</p>
</td></tr>

<tr><td style="padding:24px 28px;">
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #c7d8ff;border-radius:8px;overflow:hidden;margin-bottom:20px;">
<tr><td colspan="2" style="background:#1e40af;padding:9px 16px;color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Employee Details</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;width:44%;border-bottom:1px solid #dde8ff;">Name</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{emp['name']}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Email</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{emp['email']}</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Joining Date</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{emp.get('joining_date', '')}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;">Employee Type</td><td style="padding:8px 16px;color:#111;font-size:13px;">{_type_label(emp.get('employee_type', ''))}</td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #c7d8ff;border-radius:8px;overflow:hidden;margin-bottom:20px;">
<tr><td colspan="2" style="background:#1e40af;padding:9px 16px;color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Personal Details</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;width:44%;border-bottom:1px solid #dde8ff;">Father's Name</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.get('father_name', '')}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Date of Birth</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.get('date_of_birth', '')}</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Gender</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{(details.get('gender') or '').title()}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Blood Group</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.get('blood_group', '')}</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Address</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.get('address', '')}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Bank Name</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.get('bank_name', '')}</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Account Number</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.get('account_number', '')}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">IFSC Code</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.get('ifsc_code', '')}</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Emergency Contact</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.get('emergency_contact_name', '')}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;">Emergency Number</td><td style="padding:8px 16px;color:#111;font-size:13px;">{details.get('emergency_contact', '')}</td></tr>
</table>

<p style="color:#6b7280;font-size:13px;">All uploaded documents are attached to this email.</p>
</td></tr>

<tr><td style="background:#0c2461;padding:16px 24px;text-align:center;">
<p style="color:#93c5fd;font-size:12px;margin:0 0 4px;">info@zayron.in &nbsp;|&nbsp; www.zayron.in</p>
<p style="color:#3b82f6;font-size:11px;margin:0;">&copy; 2026 Zayron Infotech Pvt. Ltd. All rights reserved.</p>
</td></tr>

</table></td></tr></table>
</body></html>
"""

    msg = EmailMultiAlternatives(
        subject=subject, body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL, to=['info@zayron.in'],
    )
    msg.mixed_subtype = 'related'
    msg.attach_alternative(html_body, 'text/html')
    _attach_logo(msg)

    safe_name = emp['name'].replace(' ', '_')
    for field_key, label in [
        ('photograph_path', 'Photograph'),
        ('resume_path', 'Resume'),
        ('aadhaar_copy_path', 'Aadhaar_Copy'),
        ('pan_copy_path', 'PAN_Copy'),
        ('educational_certificates_path', 'Educational_Certificates'),
    ]:
        rel_path = details.get(field_key)
        if rel_path:
            try:
                abs_path = os.path.join(settings.MEDIA_ROOT, rel_path)
                ext = os.path.splitext(rel_path)[1]
                with open(abs_path, 'rb') as f:
                    msg.attach(f'{label}_{safe_name}{ext}', f.read())
            except Exception:
                pass

    try:
        msg.send()
        log_email('info@zayron.in', subject, 'onboarding_complete', status='sent',
                  extra={'employee_id': str(emp.get('id', '')), 'employee_name': emp['name']})
    except Exception as e:
        log_email('info@zayron.in', subject, 'onboarding_complete', status='failed', error=e,
                  extra={'employee_id': str(emp.get('id', '')), 'employee_name': emp['name']})


def send_nda_copy_email(emp, nda):
    """
    emp: dict with name, email, id
    nda: dict with pdf_file_path (relative to MEDIA_ROOT)
    """
    subject = 'Your NDA Copy – Zayron Infotech Pvt. Ltd.'

    text_body = f"""Dear {emp['name']},

Thank you for completing and signing your Non-Disclosure Agreement with Zayron Infotech Pvt. Ltd.

A copy of your signed NDA is attached to this email for your records.

Regards,
HR Team
Zayron Infotech Pvt. Ltd.
"""

    html_body = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #eef2f7; margin: 0; padding: 0; }}
.wrapper {{ padding: 40px 16px; background-color: #eef2f7; }}
.container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(30,64,175,0.13); }}
.header {{ background: linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%); padding: 36px 30px 28px; text-align: center; }}
.header-title {{ color: #ffffff; font-size: 20px; font-weight: 700; margin: 8px 0 0; }}
.body {{ padding: 36px 32px; }}
.body p {{ color: #4b5563; line-height: 1.75; margin: 12px 0; font-size: 15px; }}
.success-box {{ background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }}
.success-box p {{ color: #065f46; font-weight: 600; margin: 0; font-size: 14px; }}
.footer {{ background: #f8faff; padding: 20px 32px; text-align: center; border-top: 1px solid #e0e9ff; }}
.footer p {{ color: #9ca3af; font-size: 12px; margin: 4px 0; }}
</style>
</head>
<body><div class="wrapper"><div class="container">
<div class="header">
<img src="cid:logo_zayron" alt="Zayron Infotech" style="height:56px;width:auto;display:block;margin:0 auto 10px;" />
<div class="header-title">&#10003; NDA Successfully Signed</div>
</div>
<div class="body">
<p>Dear <strong>{emp['name']}</strong>,</p>
<div class="success-box"><p>&#10003; Your Non-Disclosure Agreement has been successfully signed and recorded by Zayron Infotech Pvt. Ltd.</p></div>
<p>A copy of your signed NDA is <strong>attached to this email</strong> for your records.</p>
<p>Please continue with the next step of your onboarding — submitting your personal details and required documents.</p>
<p>If you have any questions, feel free to reach out to the HR team at <a href="mailto:info@zayron.in" style="color:#2563eb;">info@zayron.in</a>.</p>
<p>Warm regards,<br><strong>HR Team</strong><br>Zayron Infotech Pvt. Ltd.</p>
</div>
<div class="footer">
<p style="color:#1e40af;font-weight:600;">Zayron Infotech Pvt. Ltd.</p>
<p>This is an automated email. Please do not reply directly.</p>
<p>&copy; 2026 Zayron Infotech Pvt. Ltd. All rights reserved.</p>
</div>
</div></div></body></html>
"""

    msg = EmailMultiAlternatives(
        subject=subject, body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL, to=[emp['email']],
    )
    msg.mixed_subtype = 'related'
    msg.attach_alternative(html_body, 'text/html')
    _attach_logo(msg)

    pdf_rel_path = nda.get('pdf_file_path')
    if pdf_rel_path:
        try:
            abs_path = os.path.join(settings.MEDIA_ROOT, pdf_rel_path)
            safe_name = emp['name'].replace(' ', '_')
            with open(abs_path, 'rb') as f:
                msg.attach(f'NDA_{safe_name}.pdf', f.read(), 'application/pdf')
        except Exception:
            pass

    try:
        msg.send()
        log_email(emp['email'], subject, 'nda_copy', status='sent',
                  extra={'employee_id': str(emp.get('id', '')), 'employee_name': emp['name']})
    except Exception as e:
        log_email(emp['email'], subject, 'nda_copy', status='failed', error=e,
                  extra={'employee_id': str(emp.get('id', '')), 'employee_name': emp['name']})
        raise


def send_credentials_email(emp, username, password):
    """emp: dict with name, email, id, employee_id"""
    subject = 'Your Zayron Suite Portal Login Credentials'
    portal_url = getattr(settings, 'BASE_URL', 'https://zayrosuite.com')
    emp_id = emp.get('employee_id', username)

    text_body = f"""Dear {emp['name']},

Your onboarding is complete! Here are your Zayron Suite portal login credentials:

Employee ID / Username: {emp_id}
Password: {password}

You can log in using any of the following:
  - Employee ID: {emp_id}
  - Username: {username}
  - Personal Email: {emp['email']}

Login at: {portal_url}

Please change your password after first login.

Regards,
HR Team
Zayron Infotech Pvt. Ltd.
"""

    html_body = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#e8edf5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(13,27,75,0.10);">

<tr><td style="background:linear-gradient(135deg,#0d1b4b,#3b82f6);padding:28px 28px 22px;text-align:center;">
<img src="cid:logo_zayron" alt="Zayron Infotech" style="height:56px;width:auto;display:block;margin:0 auto 10px;" />
<p style="color:#fff;font-size:20px;font-weight:800;margin:0 0 4px;">Zayron Infotech Pvt. Ltd.</p>
<p style="color:#bfdbfe;font-size:11px;margin:0;letter-spacing:1.5px;text-transform:uppercase;">HR Portal · Login Credentials</p>
</td></tr>

<tr><td style="background:#ecfdf5;padding:16px 28px;border-bottom:1px solid #6ee7b7;">
<p style="color:#065f46;font-size:16px;font-weight:700;margin:0;">Onboarding Complete — Welcome, {emp['name']}!</p>
<p style="color:#6b7280;font-size:13px;margin:4px 0 0;">Your account has been created. Use the credentials below to log in.</p>
</td></tr>

<tr><td style="padding:28px 32px;">
<p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px;">
Dear <strong>{emp['name']}</strong>, your onboarding is now complete. You can log in to the <strong>Zayron Suite Portal</strong> using the credentials below.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;margin-bottom:16px;">
<tr><td style="padding:18px 24px;">
<span style="font-size:12px;color:#0369a1;font-weight:700;text-transform:uppercase;">Employee ID / Username</span><br>
<span style="font-size:20px;font-weight:800;color:#0c4a6e;font-family:monospace;">{emp_id}</span><br><br>
<span style="font-size:12px;color:#0369a1;font-weight:700;text-transform:uppercase;">Password</span><br>
<span style="font-size:20px;font-weight:800;color:#0c4a6e;font-family:monospace;">{password}</span>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border:1px solid #dbeafe;border-radius:8px;margin-bottom:20px;">
<tr><td style="padding:14px 20px;">
<p style="font-size:12px;color:#1e40af;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">You can login using any of the following:</p>
<p style="font-size:13px;color:#374151;margin:0;line-height:1.9;">
&bull; <strong>Employee ID:</strong> {emp_id}<br>
&bull; <strong>Username:</strong> {username}<br>
&bull; <strong>Personal Email:</strong> {emp['email']}
</p>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
<tr><td align="center">
<a href="{portal_url}" style="display:inline-block;background:linear-gradient(135deg,#0d1b4b,#2563eb);color:#fff;text-decoration:none;padding:13px 36px;border-radius:10px;font-size:15px;font-weight:700;">Login to Portal →</a>
</td></tr>
</table>
<table width="100%" cellpadding="12" cellspacing="0" style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;margin-bottom:22px;">
<tr><td style="font-size:12.5px;color:#92400e;line-height:1.6;">
Please change your password after your first login. Do not share your credentials with anyone.
</td></tr>
</table>
<p style="color:#374151;font-size:13px;margin:0;">Warm Regards,<br><strong style="color:#0d1b4b;">HR Team</strong><br><span style="color:#2563eb;font-weight:600;">Zayron Infotech Pvt. Ltd.</span></p>
</td></tr>

<tr><td style="background:#f8faff;padding:14px 32px;text-align:center;border-top:1px solid #e8ecf4;">
<p style="color:#9ca3af;font-size:11px;margin:0;">© 2026 Zayron Infotech Pvt. Ltd. · HR Portal · This is an automated email.</p>
</td></tr>
</table></td></tr></table>
</body></html>"""

    msg = EmailMultiAlternatives(
        subject=subject, body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL, to=[emp['email']],
    )
    msg.mixed_subtype = 'related'
    msg.attach_alternative(html_body, 'text/html')
    _attach_logo(msg)
    try:
        msg.send()
        log_email(emp['email'], subject, 'credentials', status='sent',
                  extra={'employee_id': str(emp.get('id', '')), 'username': username})
    except Exception as e:
        log_email(emp['email'], subject, 'credentials', status='failed', error=e,
                  extra={'employee_id': str(emp.get('id', '')), 'username': username})
        raise


def send_timesheet_email(sheet, action):
    """Send approval/rejection email to employee."""
    emp_email = sheet.get('employee_email', '')
    emp_name = sheet.get('employee_name', 'Employee')
    week = sheet.get('week_start', '')
    comment = sheet.get('hr_comment', '')
    portal_url = getattr(settings, 'BASE_URL', 'https://zayrosuite.com')

    is_approved = action == 'approved'
    subject = f'Timesheet {"Approved" if is_approved else "Rejected"} — Week of {week}'
    color = '#10b981' if is_approved else '#ef4444'
    status_word = 'Approved ✓' if is_approved else 'Rejected ✗'

    html_body = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#e8edf5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(13,27,75,0.10);">
<tr><td style="background:linear-gradient(135deg,#0d1b4b,#3b82f6);padding:24px 28px;text-align:center;">
<p style="color:#fff;font-size:20px;font-weight:800;margin:0;">Zayron Infotech Pvt. Ltd.</p>
<p style="color:#bfdbfe;font-size:11px;margin:4px 0 0;letter-spacing:1.5px;text-transform:uppercase;">HR Portal · Timesheet Notification</p>
</td></tr>
<tr><td style="background:{'#ecfdf5' if is_approved else '#fef2f2'};padding:14px 28px;border-bottom:1px solid {'#6ee7b7' if is_approved else '#fca5a5'};">
<p style="color:{color};font-size:16px;font-weight:700;margin:0;">Timesheet {status_word}</p>
<p style="color:#6b7280;font-size:13px;margin:4px 0 0;">Week starting {week}</p>
</td></tr>
<tr><td style="padding:24px 32px;">
<p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">
Dear <strong>{emp_name}</strong>, your timesheet for the week of <strong>{week}</strong> has been <strong style="color:{color};">{action}</strong> by the HR team.
</p>
{'<p style="color:#374151;font-size:13px;"><strong>Comment:</strong> ' + comment + '</p>' if comment else ''}
<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
<tr><td align="center">
<a href="{portal_url}/admin/my-profile" style="display:inline-block;background:linear-gradient(135deg,#0d1b4b,#2563eb);color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:700;">View My Timesheet →</a>
</td></tr>
</table>
<p style="color:#374151;font-size:13px;margin:0;">Warm Regards,<br><strong>HR Team</strong><br><span style="color:#2563eb;">Zayron Infotech Pvt. Ltd.</span></p>
</td></tr>
<tr><td style="background:#f8faff;padding:12px 32px;text-align:center;border-top:1px solid #e8ecf4;">
<p style="color:#9ca3af;font-size:11px;margin:0;">© 2026 Zayron Infotech Pvt. Ltd. · HR Portal</p>
</td></tr>
</table></td></tr></table>
</body></html>"""

    msg = EmailMultiAlternatives(subject=subject, body=subject, from_email=settings.DEFAULT_FROM_EMAIL, to=[emp_email])
    msg.attach_alternative(html_body, 'text/html')
    msg.send()
