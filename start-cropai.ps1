# CropAI Startup Script
# This script starts both the backend and frontend servers

Write-Host "🌱 Starting CropAI - Modern Crop Recommendation System" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "🚀 Starting Backend Server (FastAPI + Python)..." -ForegroundColor Cyan
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\backend'; " + `
    ".\venv\Scripts\Activate.ps1; " + `
    "Write-Host '🔥 Backend Server Starting on http://localhost:8000' -ForegroundColor Yellow; " + `
    "Write-Host '📚 API Documentation: http://localhost:8000/docs' -ForegroundColor Yellow; " + `
    "uvicorn app:app --host 0.0.0.0 --port 8000 --reload"

# Wait a moment
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server (React + Vite)..." -ForegroundColor Magenta
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", `
    "cd '$PSScriptRoot\frontend'; " + `
    "Write-Host '🌐 Frontend Server Starting...' -ForegroundColor Yellow; " + `
    "Write-Host '💻 App will open at: http://localhost:5173' -ForegroundColor Yellow; " + `
    "npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Server Information:" -ForegroundColor White
Write-Host "   🔹 Backend API: http://localhost:8000" -ForegroundColor Gray
Write-Host "   🔹 API Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "   🔹 Frontend App: http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Your modern CropAI application is ready!" -ForegroundColor Green
Write-Host "   - Beautiful UI with step-by-step crop recommendation"
Write-Host "   - Smart location detection and weather integration"
Write-Host "   - Modern chatbot with voice support"
Write-Host "   - Multi-language support (English, Hindi, Marathi)"
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")