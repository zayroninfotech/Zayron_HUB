from django.urls import path
from .views import (
    LoginView, ProfileView,
    VerifyCredentialsView, VerifyOTPView,
    ForgotPasswordView, ResetPasswordView,
)

urlpatterns = [
    path('login/',               LoginView.as_view(),             name='login'),
    path('verify-credentials/',  VerifyCredentialsView.as_view(), name='verify-credentials'),
    path('verify-otp/',          VerifyOTPView.as_view(),         name='verify-otp'),
    path('forgot-password/',     ForgotPasswordView.as_view(),    name='forgot-password'),
    path('reset-password/',      ResetPasswordView.as_view(),     name='reset-password'),
    path('profile/',             ProfileView.as_view(),           name='profile'),
]
