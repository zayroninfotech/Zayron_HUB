import os
from io import BytesIO
from datetime import datetime
from django.template.loader import render_to_string
from django.conf import settings


def generate_nda_pdf(emp, nda):
    """
    emp: dict with name, employee_type, etc.
    nda: dict with full_name, address, mobile, aadhaar_number, emergency_contact,
         signed_date, signature (base64 string)
    Returns BytesIO of the generated PDF.
    """
    emp_type_label = 'Permanent Employee' if emp.get('employee_type') == 'permanent' else 'Contract Employee'

    logo_path = os.path.join(settings.BASE_DIR, 'static', 'img', 'logo1.png')
    logo_url = f'file:///{logo_path.replace(os.sep, "/")}'

    signature_data_url = None
    sig = nda.get('signature', '')
    if sig:
        if not sig.startswith('data:'):
            sig = f'data:image/png;base64,{sig}'
        signature_data_url = sig

    context = {
        'nda': nda,
        'employee': emp,
        'emp_type_label': emp_type_label,
        'logo_url': logo_url,
        'signature_data_url': signature_data_url,
        'generated_on': datetime.now().strftime('%d %B %Y at %I:%M %p'),
    }

    html_string = render_to_string('nda_pdf.html', context)

    from xhtml2pdf import pisa

    buf = BytesIO()

    def link_callback(uri, rel):
        if uri.startswith('file:///'):
            return uri.replace('file:///', '')
        static_root = os.path.join(settings.BASE_DIR, 'static')
        if uri.startswith('/static/'):
            return os.path.join(static_root, uri[8:])
        return uri

    pisa.CreatePDF(html_string, dest=buf, link_callback=link_callback)
    buf.seek(0)
    return buf
