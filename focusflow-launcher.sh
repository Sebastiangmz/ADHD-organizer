#!/bin/bash

# FocusFlow AI Launcher Script
# Este script inicia el backend y frontend de FocusFlow AI

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="/home/sebastian/Documents/ADHD-organizer"

echo -e "${BLUE}🚀 Iniciando FocusFlow AI...${NC}"

# Verificar que el proyecto existe
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Error: No se encontró el directorio del proyecto${NC}"
    exit 1
fi

# Cambiar al directorio del proyecto
cd "$PROJECT_DIR" || exit 1

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias...${NC}"
    npm install
fi

# Verificar que .env existe y tiene API_KEY
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: Falta el archivo .env con tu API_KEY${NC}"
    echo -e "${YELLOW}Por favor, crea un archivo .env con tu API_KEY de Gemini${NC}"
    exit 1
fi

# Verificar si el backend ya está corriendo
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  El backend ya está corriendo en el puerto 3001${NC}"
else
    echo -e "${GREEN}📦 Iniciando backend...${NC}"
    npm run server > /tmp/focusflow-backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > /tmp/focusflow-backend.pid

    # Esperar a que el backend esté listo
    echo -e "${BLUE}⏳ Esperando a que el backend esté listo...${NC}"
    sleep 3

    # Verificar que el backend arrancó correctamente
    if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Error: El backend no pudo iniciarse${NC}"
        echo -e "${YELLOW}Ver logs en: /tmp/focusflow-backend.log${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Backend iniciado correctamente${NC}"
fi

# Verificar si el frontend ya está corriendo
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  El frontend ya está corriendo en el puerto 3000${NC}"
    echo -e "${GREEN}✅ Abriendo como aplicación...${NC}"
    # Intentar abrir en modo app (sin barras del navegador)
    firefox --new-window --class="FocusFlow" "http://localhost:3000" 2>/dev/null || \
    chromium --app="http://localhost:3000" --class="FocusFlow" 2>/dev/null || \
    google-chrome --app="http://localhost:3000" --class="FocusFlow" 2>/dev/null || \
    xdg-open "http://localhost:3000" 2>/dev/null
else
    echo -e "${GREEN}🎨 Iniciando frontend...${NC}"
    npm run dev > /tmp/focusflow-frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/focusflow-frontend.pid

    # Esperar a que el frontend esté listo
    echo -e "${BLUE}⏳ Esperando a que el frontend esté listo...${NC}"
    sleep 5

    # Verificar que el frontend arrancó correctamente
    if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Error: El frontend no pudo iniciarse${NC}"
        echo -e "${YELLOW}Ver logs en: /tmp/focusflow-frontend.log${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Frontend iniciado correctamente${NC}"
    echo -e "${GREEN}✅ Abriendo como aplicación...${NC}"

    # Abrir en modo app (ventana independiente sin barras del navegador)
    sleep 2
    firefox --new-window --class="FocusFlow" "http://localhost:3000" 2>/dev/null || \
    chromium --app="http://localhost:3000" --class="FocusFlow" 2>/dev/null || \
    google-chrome --app="http://localhost:3000" --class="FocusFlow" 2>/dev/null || \
    xdg-open "http://localhost:3000" 2>/dev/null
fi

echo -e "${GREEN}✨ FocusFlow AI está listo!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:3001${NC}"
echo -e ""
echo -e "${YELLOW}Para ver logs:${NC}"
echo -e "  Backend:  tail -f /tmp/focusflow-backend.log"
echo -e "  Frontend: tail -f /tmp/focusflow-frontend.log"
echo -e ""
echo -e "${YELLOW}Para detener la aplicación:${NC}"
echo -e "  pkill -f 'node server/index.cjs'"
echo -e "  pkill -f 'vite'"
