@echo off
title AI Crop Recommendation - One Click Launcher
echo ========================================
echo    AI Crop Recommendation System
echo ========================================
echo.
echo Starting servers and opening browser...
echo.

REM Start the PowerShell script in a new window
start "AI Crop App" powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-app.ps1"

REM Wait a few seconds for servers to start
timeout /t 8 /nobreak >nul

REM Open the application in browser
echo Opening application in browser...
start "Frontend App" http://localhost:3001
start "API Docs" http://localhost:8000/docs

echo.
echo ========================================
echo Application is starting up!
echo.
echo Frontend: http://localhost:3001
echo API Docs: http://localhost:8000/docs
echo Backend:  http://localhost:8000
echo ========================================
echo.
echo Press any key to exit this launcher...
pause >nul