# AI Crop Recommendation System - Startup Script
# This script starts both backend (FastAPI) and frontend (React/Vite) servers

Write-Host "Starting AI Crop Recommendation System..." -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Yellow

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$FrontendDir = Join-Path $ScriptDir "frontend"

# Function to check if a port is available
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $false  # Port is occupied
    }
    catch {
        return $true   # Port is available
    }
}

# Check if required directories exist
if (!(Test-Path $BackendDir)) {
    Write-Host "ERROR: Backend directory not found: $BackendDir" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $FrontendDir)) {
    Write-Host "ERROR: Frontend directory not found: $FrontendDir" -ForegroundColor Red
    exit 1
}

# Check if ports are available
if (!(Test-Port 8000)) {
    Write-Host "WARNING: Port 8000 is already in use. Backend might already be running." -ForegroundColor Yellow
}

if (!(Test-Port 5173)) {
    Write-Host "WARNING: Port 5173 is already in use. Frontend might already be running." -ForegroundColor Yellow
}

Write-Host "Starting Backend Server (FastAPI)..." -ForegroundColor Cyan
Write-Host "   Directory: $BackendDir" -ForegroundColor Gray
Write-Host "   URL: http://localhost:8000" -ForegroundColor Gray

# Start Backend Server
$BackendJob = Start-Job -ScriptBlock {
    param($BackendPath)
    Set-Location $BackendPath
    
    # Activate virtual environment and start server
    if (Test-Path "venv\Scripts\Activate.ps1") {
        & "venv\Scripts\Activate.ps1"
    }
    
    # Start uvicorn server
    uvicorn app:app --reload --host 0.0.0.0 --port 8000
} -ArgumentList $BackendDir

Write-Host "Starting Frontend Server (React + Vite)..." -ForegroundColor Cyan
Write-Host "   Directory: $FrontendDir" -ForegroundColor Gray
Write-Host "   URL: http://localhost:5173" -ForegroundColor Gray

# Start Frontend Server  
$FrontendJob = Start-Job -ScriptBlock {
    param($FrontendPath)
    Set-Location $FrontendPath
    npm run dev
} -ArgumentList $FrontendDir

# Wait a moment for servers to start
Write-Host "Initializing servers..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Monitor the jobs
Write-Host ""
Write-Host "Application Started Successfully!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host "Backend API:      http://localhost:8000" -ForegroundColor White
Write-Host "API Docs:         http://localhost:8000/docs" -ForegroundColor White  
Write-Host "Frontend App:     http://localhost:5173" -ForegroundColor White
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host "Server logs will appear below:" -ForegroundColor Gray
Write-Host ""

try {
    # Monitor both jobs and display output
    while ($BackendJob.State -eq "Running" -or $FrontendJob.State -eq "Running") {
        
        # Get backend output
        $BackendOutput = Receive-Job $BackendJob 2>&1
        if ($BackendOutput) {
            $BackendOutput | ForEach-Object { 
                Write-Host "[BACKEND] $_" -ForegroundColor Blue 
            }
        }
        
        # Get frontend output  
        $FrontendOutput = Receive-Job $FrontendJob 2>&1
        if ($FrontendOutput) {
            $FrontendOutput | ForEach-Object { 
                Write-Host "[FRONTEND] $_" -ForegroundColor Green 
            }
        }
        
        Start-Sleep -Milliseconds 500
    }
}
catch {
    Write-Host "Stopping servers..." -ForegroundColor Red
}
finally {
    # Clean up jobs
    if ($BackendJob) {
        Stop-Job $BackendJob -ErrorAction SilentlyContinue
        Remove-Job $BackendJob -ErrorAction SilentlyContinue
    }
    
    if ($FrontendJob) {
        Stop-Job $FrontendJob -ErrorAction SilentlyContinue  
        Remove-Job $FrontendJob -ErrorAction SilentlyContinue
    }
    
    Write-Host "All servers stopped." -ForegroundColor Green
}