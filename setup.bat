@echo off
title Zayron Infotech – First Time Setup
color 0B
cd /d D:\Z\Zayron-Welcome-Portal

echo ============================================
echo   ZAYRON INFOTECH – FIRST TIME SETUP
echo ============================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 ( echo [ERROR] Python not found. Install from https://python.org & pause & exit /b 1 )

SET PATH=C:\Program Files\nodejs;%PATH%
node --version >nul 2>&1
if %errorlevel% neq 0 ( echo [ERROR] Node.js not found. Install from https://nodejs.org & pause & exit /b 1 )

echo [1/5] Creating Python virtual environment...
python -m venv venv

echo [2/5] Installing Python packages...
call venv\Scripts\activate.bat
pip install -q -r requirements.txt

echo [3/5] Running database setup...
python manage.py makemigrations accounts employees ndas documents
python manage.py migrate

echo [4/5] Creating Super Admin account...
python create_admin.py

echo [5/5] Installing & building React frontend...
call npm install
call npm run build

echo.
echo ============================================
echo   SETUP COMPLETE!
echo ============================================
echo.
echo   Run the app:  double-click  start.bat
echo   URL:          http://localhost:8000
echo   Login:        admin / Admin@123
echo.
echo   To configure email: edit D:\Z\Zayron-Welcome-Portal\.env
echo ============================================
pause
