# Listmonk Email Server Backup Script
$BackupDir = "$PSScriptRoot\backups"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupPath = "$BackupDir\listmonk-backup-$Timestamp"

Write-Host "Creating Listmonk backup..." -ForegroundColor Green

New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null

# Backup docker-compose and config files
Copy-Item "$PSScriptRoot\docker-compose.yml" -Destination "$BackupPath\" -ErrorAction SilentlyContinue
Copy-Item "$PSScriptRoot\config.toml" -Destination "$BackupPath\" -ErrorAction SilentlyContinue
Copy-Item "$PSScriptRoot\tunnel-config.yml" -Destination "$BackupPath\" -ErrorAction SilentlyContinue
Copy-Item "$PSScriptRoot\tunnel-credentials.json" -Destination "$BackupPath\" -ErrorAction SilentlyContinue
Copy-Item "$PSScriptRoot\.env" -Destination "$BackupPath\" -ErrorAction SilentlyContinue

# Backup PostgreSQL database
Write-Host "Backing up PostgreSQL database..." -ForegroundColor Yellow
docker exec listmonk-db pg_dump -U listmonk listmonk > "$BackupPath\database.sql" 2>$null

# Save container info
docker inspect listmonk-app | Out-File "$BackupPath\listmonk-app-info.json"
docker inspect listmonk-db | Out-File "$BackupPath\listmonk-db-info.json"
docker inspect cloudflared-tunnel | Out-File "$BackupPath\cloudflared-tunnel-info.json"

# Create zip
$zipPath = "$BackupDir\listmonk-backup-$Timestamp.zip"
Compress-Archive -Path "$BackupPath\*" -DestinationPath $zipPath -Force

Write-Host "Backup complete: $zipPath" -ForegroundColor Cyan

# Keep only last 10 backups
$allBackups = Get-ChildItem -Path $BackupDir -Filter "listmonk-backup-*.zip" | Sort-Object LastWriteTime -Descending
if ($allBackups.Count -gt 10) {
    $allBackups | Select-Object -Skip 10 | ForEach-Object {
        Remove-Item $_.FullName -Force
    }
}
