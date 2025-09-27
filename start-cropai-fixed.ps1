# CropAI Complete Startup Script
# This script starts both backend and frontend servers

Write-Host "Starting CropAI Application..." -ForegroundColor Green
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
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Stop-ProcessOnPort 8000  # Backend
Stop-ProcessOnPort 5173  # Frontend

# Kill any remaining node processes
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Cleaned up Node.js processes" -ForegroundColor Yellow
} catch {
    Write-Host "No Node.js processes to clean up" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Navigate to project root
Set-Location "C:\Users\hp\Desktop\Crop"

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
try {
    if (Test-Path ".\backend\venv\Scripts\Activate.ps1") {
        Write-Host "Found virtual environment" -ForegroundColor Green
        
        # Create backend startup command
        $backendCommand = "Set-Location 'C:\Users\hp\Desktop\Crop\backend'; .\venv\Scripts\Activate.ps1; Write-Host 'Backend activated' -ForegroundColor Green; uvicorn main:app --reload --host 0.0.0.0 --port 8000"
        
        Start-Process powershell -ArgumentList @("-NoExit", "-Command", $backendCommand)
        Write-Host "Backend server starting..." -ForegroundColor Green
        
    } else {
        Write-Host "Virtual environment not found!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Failed to start backend: $_" -ForegroundColor Red
    exit 1
}

# Wait for backend to start
Start-Sleep -Seconds 5

# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Magenta
try {
    Set-Location "C:\Users\hp\Desktop\Crop\frontend"
    
    # Check if node_modules exists
    if (-not (Test-Path ".\node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Create frontend startup command
    $frontendCommand = "Set-Location 'C:\Users\hp\Desktop\Crop\frontend'; Write-Host 'Starting React server...' -ForegroundColor Magenta; npm run dev"
    
    Start-Process powershell -ArgumentList @("-NoExit", "-Command", $frontendCommand)
    Write-Host "Frontend server starting..." -ForegroundColor Green
    
} catch {
    Write-Host "Failed to start frontend: $_" -ForegroundColor Red
    exit 1
}

# Wait for servers to start
Write-Host "Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check server status
Write-Host "Checking server status..." -ForegroundColor Blue

$backendRunning = Test-Port 8000
$frontendRunning = Test-Port 5173

Write-Host "================================" -ForegroundColor Green
Write-Host "CropAI Application Status" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

if ($backendRunning) {
    Write-Host "Backend Server: RUNNING on http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "Backend Server: NOT RUNNING" -ForegroundColor Red
}

if ($frontendRunning) {
    Write-Host "Frontend Server: RUNNING on http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "Frontend Server: NOT RUNNING" -ForegroundColor Red
}

Write-Host "================================" -ForegroundColor Green

if ($backendRunning -and $frontendRunning) {
    Write-Host "All servers running successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Quick Links:" -ForegroundColor Cyan
    Write-Host "Main App: http://localhost:5173" -ForegroundColor White
    Write-Host "AI Chatbot: http://localhost:5173/chatbot" -ForegroundColor White
    Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    
    # Open browser
    Write-Host "Opening browser..." -ForegroundColor Green
    Start-Sleep -Seconds 2
    try {
        Start-Process "http://localhost:5173"
        Write-Host "Browser opened!" -ForegroundColor Green
    } catch {
        Write-Host "Could not open browser. Visit http://localhost:5173 manually" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "Some servers failed to start. Check terminal windows for errors." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Features Available:" -ForegroundColor Cyan
Write-Host "- Smart Crop Recommendations with GPS" -ForegroundColor White
Write-Host "- AI Chatbot with voice support" -ForegroundColor White  
Write-Host "- Multi-language support" -ForegroundColor White
Write-Host "- Responsive modern design" -ForegroundColor White
Write-Host ""
Write-Host "Happy farming with CropAI!" -ForegroundColor Green