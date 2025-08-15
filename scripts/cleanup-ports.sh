#!/bin/bash
# Script para limpiar puertos específicos antes de ejecutar aplicaciones

PORT=${1:-3000}

echo "🧹 Cleaning up port $PORT..."

# Buscar procesos usando el puerto especificado
if command -v lsof &> /dev/null; then
    # En sistemas Unix-like
    PIDS=$(lsof -ti:$PORT 2>/dev/null)
elif command -v netstat &> /dev/null; then
    # En Windows con Git Bash
    PIDS=$(netstat -ano | grep ":$PORT " | awk '{print $5}' | sort -u)
fi

if [ ! -z "$PIDS" ]; then
    for pid in $PIDS; do
        echo "💀 Killing process on port $PORT (PID: $pid)"
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            # Windows
            taskkill //PID $pid //F 2>/dev/null
        else
            # Unix-like
            kill -9 $pid 2>/dev/null
        fi
        echo "✅ Process $pid terminated successfully"
    done
else
    echo "✅ Port $PORT is already free"
fi

# Esperar un momento para que el puerto se libere
sleep 2
echo "🚀 Port $PORT is ready for use"