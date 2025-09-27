# Combined dev script for Windows PowerShell
# Starts FastAPI backend and Vite frontend concurrently

$ErrorActionPreference = 'Stop'

# Resolve absolute paths
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontend'

# Ports
$backendPort = 8000
$frontendPort = 3000

Write-Host "Starting backend (FastAPI) on port $backendPort..." -ForegroundColor Green
$backend = Start-Process -PassThru -WorkingDirectory $backendDir -FilePath "powershell" -ArgumentList @(
  "-NoExit",
  "-Command",
  "python -m uvicorn app:app --host 0.0.0.0 --port $backendPort --reload"
)

Start-Sleep -Seconds 2

Write-Host "Starting frontend (Vite) on port $frontendPort..." -ForegroundColor Green
$frontend = Start-Process -PassThru -WorkingDirectory $frontendDir -FilePath "powershell" -ArgumentList @(
  "-NoExit",
  "-Command",
  "npm run dev"
)

Write-Host "Both processes started. Close their terminal windows to stop them." -ForegroundColor Yellow

# Optionally, open the browser
try {
  Start-Process "http://localhost:$frontendPort"
} catch {}

# Keep this controller window alive
while ($true) {
  if ($backend.HasExited -or $frontend.HasExited) {
    break
  }
  Start-Sleep -Seconds 1
}

Write-Host "One of the processes exited. Stopping the other..." -ForegroundColor Red
try { if (-not $backend.HasExited) { Stop-Process -Id $backend.Id -Force } } catch {}
try { if (-not $frontend.HasExited) { Stop-Process -Id $frontend.Id -Force } } catch {}
