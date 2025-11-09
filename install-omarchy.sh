#!/bin/bash

# FocusFlow - Omarchy Installation Script
# Este script instala FocusFlow en el launcher de Omarchy

set -e

echo "🎯 FocusFlow - Instalador para Omarchy"
echo "======================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que estamos en Omarchy
if [ ! -d "$HOME/.local/share/omarchy" ]; then
    echo -e "${YELLOW}⚠️  Advertencia: No se detectó Omarchy en este sistema${NC}"
    echo "Este script está diseñado para Omarchy OS"
    read -p "¿Continuar de todos modos? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHER_SCRIPT="$PROJECT_DIR/focusflow-launcher.sh"

echo -e "${BLUE}📁 Directorio del proyecto: $PROJECT_DIR${NC}"
echo ""

# Verificar que el script de lanzamiento existe
if [ ! -f "$LAUNCHER_SCRIPT" ]; then
    echo -e "${YELLOW}❌ Error: No se encontró focusflow-launcher.sh${NC}"
    exit 1
fi

# Hacer ejecutable el launcher
chmod +x "$LAUNCHER_SCRIPT"
echo -e "${GREEN}✅ Script de lanzamiento preparado${NC}"

# Crear directorio para íconos
ICON_DIR="$HOME/.local/share/applications/icons"
mkdir -p "$ICON_DIR"

# Descargar ícono
ICON_PATH="$ICON_DIR/focusflow.png"
echo -e "${BLUE}📥 Descargando ícono...${NC}"

if curl -sL -o "$ICON_PATH" "https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/notion.png"; then
    echo -e "${GREEN}✅ Ícono descargado${NC}"
else
    echo -e "${YELLOW}⚠️  No se pudo descargar el ícono, usando ícono por defecto${NC}"
    ICON_PATH="utilities-terminal"
fi

# Crear archivo .desktop
DESKTOP_FILE="$HOME/.local/share/applications/FocusFlow.desktop"
echo -e "${BLUE}📝 Creando entrada de aplicación...${NC}"

cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Name=FocusFlow
Comment=ADHD Task Organizer with AI
Exec=$LAUNCHER_SCRIPT
Terminal=false
Type=Application
Icon=$ICON_PATH
Categories=Utility;Office;ProjectManagement;
StartupNotify=true
Keywords=adhd;tasks;productivity;ai;focus;organizer;
EOF

chmod +x "$DESKTOP_FILE"
echo -e "${GREEN}✅ Archivo .desktop creado${NC}"

# Actualizar cache de aplicaciones
echo -e "${BLUE}🔄 Actualizando cache de aplicaciones...${NC}"
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$HOME/.local/share/applications/" 2>/dev/null || true
    echo -e "${GREEN}✅ Cache actualizado${NC}"
else
    echo -e "${YELLOW}⚠️  update-desktop-database no disponible, omitiendo${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ¡Instalación completada!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Para abrir FocusFlow:"
echo -e "   1. Presiona ${BLUE}Super + Space${NC}"
echo "   2. Escribe 'focusflow' o 'focus'"
echo "   3. Presiona Enter"
echo ""
echo "🗑️  Para desinstalar:"
echo "   rm ~/.local/share/applications/FocusFlow.desktop"
echo "   rm ~/.local/share/applications/icons/focusflow.png"
echo ""
echo "📖 Más información en: OMARCHY_INSTALL.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
