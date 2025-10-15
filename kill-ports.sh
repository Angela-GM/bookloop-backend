#!/bin/bash

# Script para matar procesos en puertos de desarrollo
PORTS=(3001 3002 3003 3004 3005)

echo "🔍 Buscando procesos en puertos de desarrollo..."

for PORT in "${PORTS[@]}"; do
    PID=$(netstat -ano | grep ":$PORT " | grep LISTENING | awk '{print $5}' | head -1)
    if [ ! -z "$PID" ]; then
        echo "🔥 Terminando proceso PID $PID en puerto $PORT"
        taskkill.exe //PID $PID //F 2>/dev/null
    else
        echo "✅ Puerto $PORT ya está libre"
    fi
done

echo "🎉 Limpieza completada!"
echo "Puertos disponibles:"
netstat -ano | grep -E ":(3001|3002|3003|3004|3005)" | grep LISTENING || echo "Todos los puertos están libres ✅"