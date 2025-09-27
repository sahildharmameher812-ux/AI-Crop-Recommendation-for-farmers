# CropAI Complete Startup Script
# This script starts both backend and frontend servers

Write-Host "🌱 Starting CropAI Application..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to kill processes on specific ports
function Stop-ProcessOnPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($process in $processes) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process on port $Port" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "No processes found on port $Port" -ForegroundColor Gray
    }
}

# Clean up existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Stop-ProcessOnPort 8000  # Backend
Stop-ProcessOnPort 5173  # Frontend
Stop-ProcessOnPort 3000  # Alternative frontend port

# Kill any remaining node processes
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Cleaned up Node.js processes" -ForegroundColor Yellow
} catch {
    Write-Host "No Node.js processes to clean up" -ForegroundColor Gray
}

# Kill any remaining python processes related to uvicorn/fastapi
try {
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*uvicorn*" -or $_.CommandLine -like "*main*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Cleaned up Python/FastAPI processes" -ForegroundColor Yellow
} catch {
    Write-Host "No Python/FastAPI processes to clean up" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Navigate to project root
Set-Location "C:\Users\hp\Desktop\Crop"

# Start Backend Server
Write-Host "🚀 Starting Backend Server (FastAPI)..." -ForegroundColor Cyan
try {
    # Check if virtual environment exists
    if (Test-Path ".\backend\venv\Scripts\Activate.ps1") {
        Write-Host "Found virtual environment" -ForegroundColor Green
        
        # Start backend in a new PowerShell window
        $backendScript = @"
Set-Location 'C:\Users\hp\Desktop\Crop\backend'
.\venv\Scripts\Activate.ps1
Write-Host '🔧 Backend virtual environment activated' -ForegroundColor Green
Write-Host '📊 Installing/updating backend dependencies...' -ForegroundColor Yellow
pip install -r requirements.txt --quiet
Write-Host '🌐 Starting FastAPI server on http://localhost:8000' -ForegroundColor Green
Write-Host '📚 API Documentation will be available at http://localhost:8000/docs' -ForegroundColor Blue
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
        Write-Host "✅ Backend server starting..." -ForegroundColor Green
        
    } else {
        Write-Host "❌ Virtual environment not found in backend directory" -ForegroundColor Red
        Write-Host "Please ensure the backend setup is complete" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Failed to start backend server: $_" -ForegroundColor Red
    exit 1
}

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server (React + Vite)..." -ForegroundColor Magenta
try {
    Set-Location "C:\Users\hp\Desktop\Crop\frontend"
    
    # Check if node_modules exists
    if (-not (Test-Path ".\node_modules")) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start frontend in a new PowerShell window
    $frontendScript = @"
Set-Location 'C:\Users\hp\Desktop\Crop\frontend'
Write-Host '🎨 Starting React development server...' -ForegroundColor Magenta
Write-Host '🌐 Frontend will be available at http://localhost:5173' -ForegroundColor Green
Write-Host '🔄 Hot reload enabled for development' -ForegroundColor Blue
npm run dev
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
    Write-Host "✅ Frontend server starting..." -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to start frontend server: $_" -ForegroundColor Red
    exit 1
}

# Wait for servers to fully start
Write-Host "⏳ Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check if servers are running
Write-Host "🔍 Checking server status..." -ForegroundColor Blue

$backendRunning = Test-Port 8000
$frontendRunning = Test-Port 5173

Write-Host "================================" -ForegroundColor Green
Write-Host "🌱 CropAI Application Status" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

if ($backendRunning) {
    Write-Host "✅ Backend Server: RUNNING on http://localhost:8000" -ForegroundColor Green
    Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Blue
} else {
    Write-Host "❌ Backend Server: NOT RUNNING" -ForegroundColor Red
}

if ($frontendRunning) {
    Write-Host "✅ Frontend Server: RUNNING on http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend Server: NOT RUNNING" -ForegroundColor Red
}

Write-Host "================================" -ForegroundColor Green

if ($backendRunning -and $frontendRunning) {
    Write-Host "🎉 All servers are running successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Quick Links:" -ForegroundColor Cyan
    Write-Host "🏠 Main Application: http://localhost:5173" -ForegroundColor White
    Write-Host "🤖 AI Chatbot: http://localhost:5173/chatbot" -ForegroundColor White
    Write-Host "🌾 Crop Recommendations: http://localhost:5173/recommendation" -ForegroundColor White
    Write-Host "📊 API Documentation: http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Opening the application in your default browser..." -ForegroundColor Green
    
    # Wait a moment then open the browser
    Start-Sleep -Seconds 2
    try {
        Start-Process "http://localhost:5173"
        Write-Host "✅ Browser opened successfully!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not auto-open browser. Please manually visit http://localhost:5173" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "⚠️  Some servers failed to start. Check the individual terminal windows for errors." -ForegroundColor Yellow
    
    if (-not $backendRunning) {
        Write-Host "💡 Backend troubleshooting:" -ForegroundColor Cyan
        Write-Host "   - Check if virtual environment is properly set up" -ForegroundColor White
        Write-Host "   - Ensure all Python dependencies are installed" -ForegroundColor White
        Write-Host "   - Check if port 8000 is available" -ForegroundColor White
    }
    
    if (-not $frontendRunning) {
        Write-Host "💡 Frontend troubleshooting:" -ForegroundColor Cyan
        Write-Host "   - Check if Node.js is installed" -ForegroundColor White
        Write-Host "   - Ensure npm dependencies are installed" -ForegroundColor White
        Write-Host "   - Check if port 5173 is available" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "📝 Features Available:" -ForegroundColor Cyan
Write-Host "   🌾 Smart Crop Recommendations with GPS auto-location" -ForegroundColor White
Write-Host "   🤖 AI-Powered Full-Page Chatbot with voice support" -ForegroundColor White
Write-Host "   🌍 Multi-language support (English, Hindi, Marathi)" -ForegroundColor White
Write-Host "   📱 Responsive design for all devices" -ForegroundColor White
Write-Host "   🎨 Modern UI with smooth animations" -ForegroundColor White
Write-Host ""
Write-Host "ℹ️  To stop all servers, close the terminal windows or press Ctrl+C in each" -ForegroundColor Gray
Write-Host "🔄 This script can be run again anytime to restart the application" -ForegroundColor Gray
Write-Host ""
Write-Host "🌱 Happy farming with CropAI! 🚀" -ForegroundColor Green