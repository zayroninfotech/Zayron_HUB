@echo off
title Zayron Infotech – Onboarding System
color 0A
cd /d D:\Z\Zayron-Welcome-Portal

echo ============================================
echo   ZAYRON INFOTECH – ONBOARDING SYSTEM
echo ============================================
echo.

echo [1/2] Building React frontend...
SET PATH=C:\Program Files\nodejs;%PATH%
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    pause & exit /b 1
)

echo.
echo [2/2] Starting Django server...
echo.
echo   Application running at: http://localhost:8000
echo   Admin login            : http://localhost:8000/login
echo   Django admin panel     : http://localhost:8000/admin
echo   Credentials            : vamsi / Zayron@2026
echo.
echo   Press Ctrl+C to stop.
echo ============================================
echo.
call venv\Scripts\activate.bat
python manage.py runserver 8000
