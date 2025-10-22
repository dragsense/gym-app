# SSH Agent Setup Script for Windows Docker Containers
# This script helps configure SSH agent forwarding for GitHub access in Docker containers

Write-Host "Setting up SSH agent forwarding for Docker containers..." -ForegroundColor Green

# Check if SSH agent is running
if (-not $env:SSH_AUTH_SOCK) {
    Write-Host "SSH agent is not running. Starting SSH agent..." -ForegroundColor Yellow
    
    # Start SSH agent
    Start-Service ssh-agent
    Set-Service ssh-agent -StartupType Automatic
    
    Write-Host "Please add your SSH key:" -ForegroundColor Cyan
    Write-Host "ssh-add ~/.ssh/id_rsa" -ForegroundColor White
    Write-Host "or" -ForegroundColor White
    Write-Host "ssh-add ~/.ssh/id_ed25519" -ForegroundColor White
    
    Write-Host ""
    Write-Host "After adding your key, restart your terminal or run:" -ForegroundColor Cyan
    Write-Host "`$env:SSH_AUTH_SOCK = (Get-ChildItem Env:SSH_AUTH_SOCK).Value" -ForegroundColor White
    
} else {
    Write-Host "SSH agent is already running at: $env:SSH_AUTH_SOCK" -ForegroundColor Green
}

Write-Host ""
Write-Host "To test GitHub SSH access:" -ForegroundColor Cyan
Write-Host "ssh -T git@github.com" -ForegroundColor White

Write-Host ""
Write-Host "To start Docker containers with SSH forwarding:" -ForegroundColor Cyan
Write-Host "docker compose -f shared/docker-compose.yml up -d" -ForegroundColor White

