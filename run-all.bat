@echo off
echo Starting CropAI Application...
echo.

REM Start Backend Server in new window
echo Starting Backend Server...
start "CropAI Backend" cmd /k "cd /d C:\Users\hp\Desktop\Crop\backend && .\venv\Scripts\activate.bat && echo Backend server starting... && uvicorn app:app --reload --host 0.0.0.0 --port 8000"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

REM Start Frontend Server in new window
echo Starting Frontend Server...
start "CropAI Frontend" cmd /k "cd /d C:\Users\hp\Desktop\Crop\frontend && echo Frontend server starting... && npm run dev"

REM Wait 8 seconds then open browser
timeout /t 8 /nobreak >nul
echo Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo CropAI Application Started Successfully!
echo ========================================
echo.
echo Backend Server: http://localhost:8000
echo Frontend App: http://localhost:5173
echo AI Chatbot: http://localhost:5173/chatbot
echo API Docs: http://localhost:8000/docs
echo.
echo Features:
echo - Smart Crop Recommendations with GPS
echo - AI Chatbot with Voice Support
echo - Multi-language Support (EN/HI/MR)
echo - Modern Responsive Design
echo.
echo To stop servers, close the command windows
echo or press Ctrl+C in each window.
echo.
pause