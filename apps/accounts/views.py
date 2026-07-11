import io
import base64
import pyotp
import qrcode

from django.conf import settings
from django.core import signing
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import EmailMultiAlternatives

from utils.mail_logger import log_email
from utils.mongo_db import col as _col
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import CustomTokenObtainPairSerializer, UserSerializer

User = get_user_model()

TEMP_SALT_CREDS = '2fa-creds-temp'
TEMP_SALT_SETUP = '2fa-setup-temp'
TEMP_MAX_AGE    = 300  # 5 minutes


def _get_mongo_user(username):
    return _col('users').find_one({'username': username})


def _save_totp_secret(username, secret):
    _col('users').update_one({'username': username}, {'$set': {'totp_secret': secret}})


def _make_qr_base64(uri):
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


def _issue_jwt(mongo_user):
    """Get or create Django user from MongoDB doc and issue JWT tokens."""
    mongo_role = mongo_user.get('role', 'employee')
    django_user, created = User.objects.get_or_create(
        username=mongo_user['username'],
        defaults={
            'email':        mongo_user.get('email', ''),
            'first_name':   mongo_user.get('first_name', ''),
            'last_name':    mongo_user.get('last_name', ''),
            'role':         mongo_role,
            'is_active':    True,
            'is_staff':     mongo_user.get('is_staff', False),
            'is_superuser': mongo_user.get('is_superuser', False),
        }
    )
    if not created:
        # Always sync role from MongoDB so permission classes work
        User.objects.filter(pk=django_user.pk).update(role=mongo_role)
        django_user.role = mongo_role
    refresh = RefreshToken.for_user(django_user)
    refresh['username']  = django_user.username
    refresh['role']      = mongo_role
    refresh['full_name'] = django_user.get_full_name()

    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id':        django_user.pk,
            'username':  django_user.username,
            'email':     django_user.email,
            'role':      mongo_role,
            'full_name': django_user.get_full_name(),
        },
    }


# ── Step 1: verify username + password ───────────────────────────────────────

class VerifyCredentialsView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response({'detail': 'Username and password are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        mongo_user = _get_mongo_user(username)
        if not mongo_user or not check_password(password, mongo_user.get('password', '')):
            return Response({'detail': 'Invalid credentials. Please try again.'},
                            status=status.HTTP_401_UNAUTHORIZED)

        if not mongo_user.get('is_active', True):
            return Response({'detail': 'Account is disabled. Contact your administrator.'},
                            status=status.HTTP_403_FORBIDDEN)

        totp_secret = mongo_user.get('totp_secret')

        if totp_secret:
            # 2FA already configured — just ask for OTP
            temp_token = signing.dumps({'username': username}, salt=TEMP_SALT_CREDS)
            return Response({
                'status':     'otp_required',
                'temp_token': temp_token,
                'message':    'Enter the 6-digit code from your Google Authenticator app.',
            })
        else:
            # First login — generate TOTP secret and QR code
            secret = pyotp.random_base32()
            totp   = pyotp.TOTP(secret)
            uri    = totp.provisioning_uri(
                name=username,
                issuer_name='Zayron Portal'
            )
            qr_b64 = _make_qr_base64(uri)

            temp_token = signing.dumps(
                {'username': username, 'secret': secret},
                salt=TEMP_SALT_SETUP
            )
            return Response({
                'status':     'setup_required',
                'temp_token': temp_token,
                'qr_code':    qr_b64,
                'secret':     secret,
                'message':    'Scan the QR code with Google Authenticator, then enter the 6-digit code.',
            })


# ── Step 2: verify OTP and issue tokens ──────────────────────────────────────

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        temp_token = request.data.get('temp_token', '')
        otp        = request.data.get('otp', '').strip().replace(' ', '')
        setup_mode = request.data.get('setup_mode', False)

        if not temp_token or not otp:
            return Response({'detail': 'Token and OTP are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if len(otp) != 6 or not otp.isdigit():
            return Response({'detail': 'OTP must be exactly 6 digits.'},
                            status=status.HTTP_400_BAD_REQUEST)

        salt = TEMP_SALT_SETUP if setup_mode else TEMP_SALT_CREDS
        try:
            data = signing.loads(temp_token, salt=salt, max_age=TEMP_MAX_AGE)
        except signing.SignatureExpired:
            return Response({'detail': 'Session expired. Please sign in again.'},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'detail': 'Invalid session token.'},
                            status=status.HTTP_400_BAD_REQUEST)

        username = data.get('username')
        mongo_user = _get_mongo_user(username)
        if not mongo_user:
            return Response({'detail': 'User not found.'},
                            status=status.HTTP_404_NOT_FOUND)

        if setup_mode:
            secret = data.get('secret')
        else:
            secret = mongo_user.get('totp_secret')

        if not secret:
            return Response({'detail': 'TOTP secret missing. Please sign in again.'},
                            status=status.HTTP_400_BAD_REQUEST)

        totp = pyotp.TOTP(secret)
        if not totp.verify(otp, valid_window=1):
            return Response({'detail': 'Invalid OTP. Please try again.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Save secret on first-time setup
        if setup_mode:
            _save_totp_secret(username, secret)

        tokens = _issue_jwt(mongo_user)
        return Response(tokens, status=status.HTTP_200_OK)


# ── Forgot password ───────────────────────────────────────────────────────────

RESET_SALT    = 'pwd-reset-token'
RESET_MAX_AGE = 3600  # 1 hour


def _get_mongo_user_by_email(email):
    return _col('users').find_one({'email': email})


def _update_mongo_password(username, hashed):
    _col('users').update_one({'username': username}, {'$set': {'password': hashed}})


def _send_reset_email(email, username, reset_link):
    subject = 'Password Reset — Zayron Infotech HR Portal'

    text_body = (
        f'Hi {username},\n\n'
        f'We received a request to reset your HR Portal password.\n\n'
        f'Reset link (valid for 1 hour):\n{reset_link}\n\n'
        f'If you did not request this, ignore this email.\n\n'
        f'Regards,\nZayron Infotech HR Team'
    )

    html_body = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#e8edf5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(13,27,75,0.10);">

<tr><td style="background:linear-gradient(135deg,#0d1b4b,#3b82f6);padding:28px 28px 22px;text-align:center;">
<p style="color:#fff;font-size:22px;font-weight:800;margin:0 0 4px;letter-spacing:-0.02em;">Zayron Infotech</p>
<p style="color:#bfdbfe;font-size:11px;margin:0;letter-spacing:1.5px;text-transform:uppercase;">HR Onboarding Portal</p>
</td></tr>

<tr><td style="padding:28px 32px 10px;">
<p style="color:#0d1b4b;font-size:18px;font-weight:800;margin:0 0 6px;">Password Reset Request</p>
<p style="color:#6b7280;font-size:13.5px;line-height:1.6;margin:0 0 22px;">
Hi <strong>{username}</strong>, we received a request to reset your HR Portal password.
Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
<tr><td align="center">
<a href="{reset_link}" style="display:inline-block;background:linear-gradient(135deg,#0d1b4b,#2563eb);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.01em;box-shadow:0 4px 14px rgba(13,27,75,0.28);">
Reset My Password
</a>
</td></tr>
</table>

<p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0 0 6px;">Or copy and paste this link into your browser:</p>
<p style="color:#3b82f6;font-size:12px;word-break:break-all;margin:0 0 22px;">{reset_link}</p>

<table width="100%" cellpadding="12" cellspacing="0" style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;margin-bottom:22px;">
<tr><td style="font-size:12.5px;color:#92400e;line-height:1.6;">
<strong>Didn't request this?</strong> If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
</td></tr>
</table>
</td></tr>

<tr><td style="background:#f8faff;padding:14px 32px;text-align:center;border-top:1px solid #e8ecf4;">
<p style="color:#9ca3af;font-size:11px;margin:0;">© 2026 Zayron Infotech Pvt. Ltd. · HR Portal · This is an automated email.</p>
</td></tr>
</table></td></tr></table>
</body></html>"""

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    msg.attach_alternative(html_body, 'text/html')
    try:
        msg.send(fail_silently=False)
        log_email(email, subject, 'password_reset', status='sent')
    except Exception as e:
        log_email(email, subject, 'password_reset', status='failed', error=e)
        raise


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'detail': 'Email address is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        mongo_user = _get_mongo_user_by_email(email)

        # Always return success to prevent email enumeration
        if not mongo_user:
            return Response({'detail': 'If that email exists, a reset link has been sent.'})

        username   = mongo_user['username']
        reset_token = signing.dumps({'username': username, 'email': email}, salt=RESET_SALT)
        base_url   = getattr(settings, 'BASE_URL', 'http://localhost:8000')
        reset_link = f'{base_url}/reset-password/{reset_token}/'

        try:
            _send_reset_email(email, username, reset_link)
        except Exception as e:
            return Response({'detail': f'Failed to send email: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'If that email exists, a reset link has been sent.'})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        token    = request.data.get('token', '')
        password = request.data.get('password', '')
        confirm  = request.data.get('confirm_password', '')

        if not token or not password:
            return Response({'detail': 'Token and new password are required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if password != confirm:
            return Response({'detail': 'Passwords do not match.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'detail': 'Password must be at least 8 characters.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            data = signing.loads(token, salt=RESET_SALT, max_age=RESET_MAX_AGE)
        except signing.SignatureExpired:
            return Response({'detail': 'Reset link has expired. Please request a new one.'},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'detail': 'Invalid or tampered reset link.'},
                            status=status.HTTP_400_BAD_REQUEST)

        username = data.get('username')
        hashed   = make_password(password)

        # Update MongoDB
        _update_mongo_password(username, hashed)

        # Also update Django user if exists
        try:
            django_user = User.objects.get(username=username)
            django_user.set_password(password)
            django_user.save()
        except User.DoesNotExist:
            pass

        return Response({'detail': 'Password reset successfully. You can now sign in.'})


# ── Existing views ────────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = []


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
