# Requires: Run PowerShell as Administrator
Write-Host "Starting Docker Desktop service if not running..."
try {
  Start-Service -Name com.docker.service -ErrorAction SilentlyContinue
} catch {}

Write-Host "Waiting for Docker engine..."
$maxWait = 60
for ($i=0; $i -lt $maxWait; $i++) {
  $ver = & docker version 2>$null
  if ($LASTEXITCODE -eq 0) { break }
  Start-Sleep -Seconds 2
}
if ($LASTEXITCODE -ne 0) {
  Write-Error "Docker engine not available. Please open Docker Desktop and try again."
  exit 1
}

Write-Host "Bringing up containers..."
& docker compose up -d --build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Containers running:"
& docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"