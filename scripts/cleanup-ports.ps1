# Script para limpiar puertos específicos antes de ejecutar aplicaciones
param(
    [Parameter(Mandatory=$false)]
    [string]$Port = "3000"
)

Write-Host "🧹 Cleaning up port $Port..." -ForegroundColor Yellow

# Buscar procesos usando el puerto especificado
$processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process -and $process.ProcessName -eq "node") {
                Write-Host "💀 Killing Node.js process on port $Port (PID: $pid)" -ForegroundColor Red
                Stop-Process -Id $pid -Force
                Write-Host "✅ Process $pid terminated successfully" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "⚠️  Could not terminate process $pid" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ Port $Port is already free" -ForegroundColor Green
}

# Esperar un momento para que el puerto se libere
Start-Sleep -Seconds 2
Write-Host "🚀 Port $Port is ready for use" -ForegroundColor Cyan