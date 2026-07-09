import base64
import os
from email.mime.image import MIMEImage
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def _logo_base64():
    logo_path = os.path.join(settings.BASE_DIR, 'static', 'img', 'logo_email.png')
    try:
        with open(logo_path, 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8')
    except Exception:
        return ''


def send_onboarding_email(employee):
    subject = 'Welcome to Zayron Infotech Pvt. Ltd.'
    onboarding_link = employee.onboarding_link

    text_body = f"""Dear {employee.name},

Welcome to Zayron Infotech Pvt. Ltd.

We are pleased to have you join our organization. To complete your onboarding process, please review and complete the required documents using the link below.

Onboarding Link: {onboarding_link}

Thank you for joining our team.

Regards,
HR Team
Zayron Infotech Pvt. Ltd.
"""

    logo_tag = '<img src="cid:logo_zayron" alt="Zayron Infotech" style="height:60px;width:auto;display:block;margin:0 auto 10px;" />'

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
<p style="color:#0c2461;font-size:17px;font-weight:700;margin:0;">Welcome, {employee.name}!</p>
<p style="color:#6b7280;font-size:13px;margin:4px 0 0;">We are excited to have you join the Zayron Infotech family.</p>
</td></tr>

<tr><td style="padding:24px 28px;">
<p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">Dear <strong>{employee.name}</strong>, congratulations on joining <strong>Zayron Infotech Pvt. Ltd.</strong> Please complete your onboarding by signing your NDA and submitting your details.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #c7d8ff;border-radius:8px;overflow:hidden;margin-bottom:24px;">
<tr><td colspan="2" style="background:#1e40af;padding:9px 16px;color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Your Employment Details</td></tr>
<tr><td style="padding:9px 16px;color:#1e40af;font-weight:600;font-size:13px;width:44%;border-bottom:1px solid #dde8ff;">Joining Date</td><td style="padding:9px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{employee.joining_date}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:9px 16px;color:#1e40af;font-weight:600;font-size:13px;">Employee Type</td><td style="padding:9px 16px;color:#111;font-size:13px;">{employee.get_employee_type_display()}</td></tr>
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
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[employee.email],
    )
    msg.mixed_subtype = 'related'
    msg.attach_alternative(html_body, 'text/html')
    logo_path = os.path.join(settings.BASE_DIR, 'static', 'img', 'logo_email.png')
    try:
        with open(logo_path, 'rb') as f:
            logo_img = MIMEImage(f.read())
            logo_img.add_header('Content-ID', '<logo_zayron>')
            logo_img.add_header('Content-Disposition', 'inline', filename='logo.png')
            msg.attach(logo_img)
    except Exception:
        pass
    msg.send()


def send_onboarding_complete_email(details):
    employee = details.employee
    subject = f'Onboarding Completed – {employee.name}'

    text_body = f"""Employee Onboarding Completed

Name: {employee.name}
Email: {employee.email}
Joining Date: {employee.joining_date}
Employee Type: {employee.get_employee_type_display()}

Father's Name: {details.father_name}
Date of Birth: {details.date_of_birth}
Gender: {details.gender}
Blood Group: {details.blood_group}
Address: {details.address}
Bank Name: {details.bank_name}
Account Number: {details.account_number}
IFSC Code: {details.ifsc_code}
Emergency Contact: {details.emergency_contact_name} ({details.emergency_contact})

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
<p style="color:#065f46;font-size:17px;font-weight:700;margin:0;">&#10003; Onboarding Completed – {employee.name}</p>
<p style="color:#6b7280;font-size:13px;margin:4px 0 0;">All documents have been submitted successfully.</p>
</td></tr>

<tr><td style="padding:24px 28px;">
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #c7d8ff;border-radius:8px;overflow:hidden;margin-bottom:20px;">
<tr><td colspan="2" style="background:#1e40af;padding:9px 16px;color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Employee Details</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;width:44%;border-bottom:1px solid #dde8ff;">Name</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{employee.name}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Email</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{employee.email}</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Joining Date</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{employee.joining_date}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;">Employee Type</td><td style="padding:8px 16px;color:#111;font-size:13px;">{employee.get_employee_type_display()}</td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #c7d8ff;border-radius:8px;overflow:hidden;margin-bottom:20px;">
<tr><td colspan="2" style="background:#1e40af;padding:9px 16px;color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Personal Details</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;width:44%;border-bottom:1px solid #dde8ff;">Father's Name</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.father_name}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Date of Birth</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.date_of_birth}</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Gender</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.gender.title()}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Blood Group</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.blood_group}</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Address</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.address}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Bank Name</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.bank_name}</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Account Number</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.account_number}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">IFSC Code</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.ifsc_code}</td></tr>
<tr><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;border-bottom:1px solid #dde8ff;">Emergency Contact</td><td style="padding:8px 16px;color:#111;font-size:13px;border-bottom:1px solid #dde8ff;">{details.emergency_contact_name}</td></tr>
<tr style="background:#f0f5ff;"><td style="padding:8px 16px;color:#1e40af;font-weight:600;font-size:13px;">Emergency Number</td><td style="padding:8px 16px;color:#111;font-size:13px;">{details.emergency_contact}</td></tr>
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
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=['info@zayron.in'],
    )
    msg.mixed_subtype = 'related'
    msg.attach_alternative(html_body, 'text/html')

    logo_path = os.path.join(settings.BASE_DIR, 'static', 'img', 'logo_email.png')
    try:
        with open(logo_path, 'rb') as f:
            logo_img = MIMEImage(f.read())
            logo_img.add_header('Content-ID', '<logo_zayron>')
            logo_img.add_header('Content-Disposition', 'inline', filename='logo.png')
            msg.attach(logo_img)
    except Exception:
        pass

    for field, label in [
        (details.photograph, 'Photograph'),
        (details.resume, 'Resume'),
        (details.aadhaar_copy, 'Aadhaar_Copy'),
        (details.pan_copy, 'PAN_Copy'),
        (details.educational_certificates, 'Educational_Certificates'),
    ]:
        if field:
            try:
                ext = os.path.splitext(field.name)[1]
                with field.open('rb') as f:
                    msg.attach(f'{label}_{employee.name.replace(" ", "_")}{ext}', f.read())
            except Exception:
                pass

    try:
        msg.send()
    except Exception:
        pass


def send_nda_copy_email(nda_document):
    employee = nda_document.employee
    subject = 'Your NDA Copy – Zayron Infotech Pvt. Ltd.'

    text_body = f"""Dear {employee.name},

Thank you for completing and signing your Non-Disclosure Agreement with Zayron Infotech Pvt. Ltd.

A copy of your signed NDA is attached to this email for your records.

Please proceed to the next step of your onboarding process using your onboarding link.

Regards,
HR Team
Zayron Infotech Pvt. Ltd.
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #eef2f7; margin: 0; padding: 0; }}
    .wrapper {{ padding: 40px 16px; background-color: #eef2f7; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(30,64,175,0.13); }}
    .header {{ background: linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%); padding: 36px 30px 28px; text-align: center; }}
    .logo-wrap {{ margin-bottom: 14px; }}
    .logo-wrap img {{ height: 56px; width: auto; object-fit: contain; }}
    .header-title {{ color: #ffffff; font-size: 20px; font-weight: 700; margin: 8px 0 0; }}
    .header-divider {{ width: 48px; height: 3px; background: rgba(255,255,255,0.4); border-radius: 2px; margin: 10px auto 0; }}
    .body {{ padding: 36px 32px; }}
    .body p {{ color: #4b5563; line-height: 1.75; margin: 12px 0; font-size: 15px; }}
    .success-box {{ background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }}
    .success-box p {{ color: #065f46; font-weight: 600; margin: 0; font-size: 14px; }}
    .divider {{ height: 1px; background: #e5e7eb; margin: 24px 0; }}
    .footer {{ background: #f8faff; padding: 20px 32px; text-align: center; border-top: 1px solid #e0e9ff; }}
    .footer p {{ color: #9ca3af; font-size: 12px; margin: 4px 0; }}
    .footer .brand {{ color: #1e40af; font-weight: 600; font-size: 13px; }}
  </style>
</head>
<body>
  <div class="wrapper">
  <div class="container">
    <div class="header">
      <div class="logo-wrap">
        <img src="cid:logo_zayron" alt="Zayron Infotech" />
      </div>
      <div class="header-title">&#10003; NDA Successfully Signed</div>
      <div class="header-divider"></div>
    </div>
    <div class="body">
      <p>Dear <strong>{employee.name}</strong>,</p>
      <div class="success-box">
        <p>&#10003; Your Non-Disclosure Agreement has been successfully signed and recorded by Zayron Infotech Pvt. Ltd.</p>
      </div>
      <p>A copy of your signed NDA is <strong>attached to this email</strong> for your records. Please keep it for future reference.</p>
      <p>Please continue with the next step of your onboarding process — submitting your personal details and required documents.</p>
      <p>If you have any questions, feel free to reach out to the HR team at <a href="mailto:info@zayron.in" style="color:#2563eb;">info@zayron.in</a>.</p>
      <div class="divider"></div>
      <p>Warm regards,<br><strong>HR Team</strong><br>Zayron Infotech Pvt. Ltd.</p>
    </div>
    <div class="footer">
      <p class="brand">Zayron Infotech Pvt. Ltd.</p>
      <p>This is an automated email. Please do not reply directly.</p>
      <p>&copy; 2026 Zayron Infotech Pvt. Ltd. All rights reserved.</p>
    </div>
  </div>
  </div>
</body>
</html>
"""

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[employee.email],
    )
    msg.mixed_subtype = 'related'
    msg.attach_alternative(html_body, 'text/html')
    logo_path = os.path.join(settings.BASE_DIR, 'static', 'img', 'logo_email.png')
    try:
        with open(logo_path, 'rb') as f:
            logo_img = MIMEImage(f.read())
            logo_img.add_header('Content-ID', '<logo_zayron>')
            logo_img.add_header('Content-Disposition', 'inline', filename='logo.png')
            msg.attach(logo_img)
    except Exception:
        pass

    # Attach PDF if available
    if nda_document.pdf_file:
        try:
            with nda_document.pdf_file.open('rb') as f:
                msg.attach(
                    f'NDA_{employee.name.replace(" ", "_")}.pdf',
                    f.read(),
                    'application/pdf'
                )
        except Exception:
            pass

    msg.send()
