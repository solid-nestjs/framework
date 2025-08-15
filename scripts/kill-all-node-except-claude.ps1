# Script para matar todos los procesos de Node.js excepto Claude Code
Write-Host "🧹 Searching for Node.js processes to terminate..." -ForegroundColor Yellow

try {
    # Buscar procesos de Node.js
    $nodeProcesses = Get-WmiObject Win32_Process -Filter "name='node.exe'"
    
    if ($nodeProcesses) {
        $killedCount = 0
        foreach ($process in $nodeProcesses) {
            $commandLine = $process.CommandLine
            
            # Verificar si NO es Claude Code
            if ($commandLine -and 
                $commandLine -notlike "*claude*" -and 
                $commandLine -notlike "*Claude*" -and
                $commandLine -notlike "*.claude*") {
                
                Write-Host "💀 Killing Node.js process (PID: $($process.ProcessId))" -ForegroundColor Red
                Write-Host "   Command: $($commandLine.Substring(0, [Math]::Min(80, $commandLine.Length)))..." -ForegroundColor Gray
                
                try {
                    Stop-Process -Id $process.ProcessId -Force
                    $killedCount++
                    Write-Host "✅ Process $($process.ProcessId) terminated successfully" -ForegroundColor Green
                } catch {
                    Write-Host "⚠️  Could not terminate process $($process.ProcessId): $_" -ForegroundColor Yellow
                }
            } else {
                Write-Host "⚡ Skipping Claude Code process (PID: $($process.ProcessId))" -ForegroundColor Cyan
            }
        }
        
        if ($killedCount -eq 0) {
            Write-Host "✅ No Node.js processes to terminate (Claude Code preserved)" -ForegroundColor Green
        } else {
            Write-Host "🎯 Terminated $killedCount Node.js process(es)" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ No Node.js processes found" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error searching for processes: $_" -ForegroundColor Red
}

Write-Host "🚀 All orphaned Node.js processes cleaned up!" -ForegroundColor Cyan