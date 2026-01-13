# Listmonk Email Server Watchdog Script
# Ensures Listmonk containers and Cloudflare tunnel are always running

$LogFile = "$PSScriptRoot\watchdog-listmonk.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

function Write-Log {
    param($Message)
    "$Timestamp - $Message" | Add-Content -Path $LogFile
    Write-Host "$Timestamp - $Message"
}

Write-Log "=== Listmonk Watchdog Check Starting ==="

# Check if Docker Desktop is running
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerProcess) {
    Write-Log "WARNING: Docker Desktop is not running. Attempting to start..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Log "Waiting 30 seconds for Docker to start..."
    Start-Sleep -Seconds 30
}

# Wait for Docker daemon to be ready
$maxWait = 60
$waited = 0
while ($waited -lt $maxWait) {
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Docker daemon is ready"
            break
        }
    } catch {}
    Start-Sleep -Seconds 2
    $waited += 2
}

if ($waited -ge $maxWait) {
    Write-Log "ERROR: Docker daemon did not start within $maxWait seconds"
    exit 1
}

# Check if listmonk containers exist and are running
$containers = @("listmonk-app", "listmonk-db", "cloudflared-tunnel")

foreach ($container in $containers) {
    $exists = docker ps -a --filter "name=$container" --format "{{.Names}}" 2>&1
    if ($exists -ne $container) {
        Write-Log "WARNING: $container does not exist. Starting via docker-compose..."
        Set-Location "$PSScriptRoot"
        docker-compose up -d
        Write-Log "Containers started via docker-compose"
        Start-Sleep -Seconds 10
        break
    }

    $running = docker ps --filter "name=$container" --format "{{.Names}}" 2>&1
    if ($running -ne $container) {
        Write-Log "WARNING: $container is not running. Starting..."
        docker start $container
        Write-Log "$container started"
        Start-Sleep -Seconds 5
    } else {
        Write-Log "[OK] $container is running"
    }
}

# Check if listmonk UI is accessible
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9010" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Log "[OK] Listmonk UI is accessible at http://localhost:9010"
    }
} catch {
    Write-Log "WARNING: Listmonk UI is not accessible. Error: $_"
    Write-Log "Restarting listmonk-app container..."
    docker restart listmonk-app
}

# Check if tunnel is connected
$tunnelLogs = docker logs cloudflared-tunnel --tail 20 2>&1
if ($tunnelLogs -like "*Registered tunnel connection*") {
    Write-Log "[OK] Cloudflare tunnel is connected"

    # Extract and log the domain
    if ($tunnelLogs -match 'hostname":"([^"]+)"') {
        $domain = $matches[1]
        Write-Log "[OK] Tunnel domain: $domain"
    }
} else {
    Write-Log "WARNING: Cloudflare tunnel not connected. Restarting..."
    docker restart cloudflared-tunnel
}

# Test tunnel URL (if configured)
if ($domain) {
    try {
        $tunnelResponse = Invoke-WebRequest -Uri "https://$domain" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($tunnelResponse.StatusCode -eq 200) {
            Write-Log "[OK] Tunnel URL https://$domain is accessible"
        }
    } catch {
        Write-Log "WARNING: Tunnel URL not accessible. Error: $($_.Exception.Message)"
    }
}

Write-Log "=== Listmonk Watchdog Check Complete ==="
Write-Log ""
