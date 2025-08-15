# Script para ejecutar npm run start:dev de forma segura, limpiando puertos primero
param(
    [Parameter(Mandatory=$false)]
    [string]$Port = "3000",
    
    [Parameter(Mandatory=$false)]
    [string]$Workspace = "",
    
    [Parameter(Mandatory=$false)]
    [int]$Timeout = 30
)

# Limpiar el puerto primero
& "$PSScriptRoot\cleanup-ports.ps1" -Port $Port

# Ejecutar npm run start:dev
if ($Workspace) {
    Write-Host "🚀 Starting development server for workspace: $Workspace" -ForegroundColor Cyan
    $cmd = "npm run start:dev -w $Workspace"
} else {
    Write-Host "🚀 Starting development server" -ForegroundColor Cyan
    $cmd = "npm run start:dev"
}

Write-Host "⏰ Will timeout after $Timeout seconds" -ForegroundColor Yellow

# Ejecutar el comando con timeout
try {
    $job = Start-Job -ScriptBlock {
        param($command)
        Invoke-Expression $command
    } -ArgumentList $cmd
    
    # Esperar hasta el timeout
    $result = Wait-Job $job -Timeout $Timeout
    
    if ($result) {
        Receive-Job $job
    } else {
        Write-Host "⏰ Timeout reached, stopping process..." -ForegroundColor Yellow
        Stop-Job $job
        Remove-Job $job
        
        # Limpiar el puerto nuevamente después del timeout
        & "$PSScriptRoot\cleanup-ports.ps1" -Port $Port
    }
} catch {
    Write-Host "❌ Error executing command: $_" -ForegroundColor Red
}