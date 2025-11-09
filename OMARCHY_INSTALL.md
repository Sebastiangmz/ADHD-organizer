# 🎯 Instalar FocusFlow en Omarchy

## Opción 1: Usando el sistema TUI de Omarchy (⭐ RECOMENDADA)

1. **Abre el menú de Omarchy:**
   ```
   Super + Alt + Space
   ```

2. **Selecciona:** `Install > TUI`

3. **Completa los datos:**
   - **Name:** `FocusFlow`
   - **Launch Command:** `/home/sebastian/Documents/ADHD-organizer/focusflow-launcher.sh`
   - **Window style:** `tile` (o `float` si prefieres ventana flotante)
   - **Icon URL:** Usa una de estas opciones:
     - PNG de internet: `https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/notion.png`
     - O tu propio icono local

4. **¡Listo!** Ahora puedes abrir FocusFlow con:
   ```
   Super + Space
   ```
   Y buscar "FocusFlow"

---

## Opción 2: Instalación manual (.desktop)

Si prefieres hacerlo manualmente, ejecuta:

```bash
# 1. Crear directorio de íconos
mkdir -p ~/.local/share/applications/icons

# 2. Descargar un ícono (o usa tu propio PNG)
curl -sL -o ~/.local/share/applications/icons/focusflow.png \
  "https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/notion.png"

# 3. Crear archivo .desktop
cat > ~/.local/share/applications/FocusFlow.desktop << 'DESKTOP'
[Desktop Entry]
Version=1.0
Name=FocusFlow
Comment=ADHD Task Organizer with AI
Exec=/home/sebastian/Documents/ADHD-organizer/focusflow-launcher.sh
Terminal=false
Type=Application
Icon=/home/sebastian/.local/share/applications/icons/focusflow.png
Categories=Utility;Office;ProjectManagement;
StartupNotify=true
DESKTOP

# 4. Hacer ejecutable
chmod +x ~/.local/share/applications/FocusFlow.desktop

# 5. Actualizar cache
update-desktop-database ~/.local/share/applications/
```

---

## Opción 3: Script de instalación automática

Ejecuta este comando desde el directorio del proyecto:

```bash
./install-omarchy.sh
```

---

## Opción 4: Como Web App

1. **Abre el menú de Omarchy:**
   ```
   Super + Alt + Space
   ```

2. **Selecciona:** `Install > Web App`

3. **Completa:**
   - **Name:** `FocusFlow`
   - **URL:** `http://localhost:3000`
   - **Icon URL:** (mismo que arriba)

**Nota:** Con esta opción necesitarás iniciar el backend manualmente primero:
```bash
cd ~/Documents/ADHD-organizer && npm run server &
```

---

## 🎨 Iconos sugeridos

Puedes usar cualquiera de estos PNG de Dashboard Icons:

- **Brain/Mind:** `https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/notion.png`
- **Tasks:** `https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/todoist.png`
- **Focus:** `https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/trello.png`
- **Productivity:** `https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/obsidian.png`

O crea tu propio PNG (256x256 recomendado) y usa la ruta local:
```
/home/sebastian/Documents/ADHD-organizer/focusflow-icon.png
```

---

## ✅ Verificar que funciona

Después de instalar:

1. Presiona `Super + Space`
2. Escribe "focus" o "focusflow"
3. Presiona Enter

¡Debería abrir tu aplicación!

---

## 🔧 Troubleshooting

### No aparece en el launcher
```bash
# Actualizar cache de aplicaciones
update-desktop-database ~/.local/share/applications/
```

### El launcher no inicia correctamente
```bash
# Ver logs
tail -f /tmp/focusflow-backend.log
tail -f /tmp/focusflow-frontend.log
```

### Eliminar FocusFlow del launcher

**Si instalaste con TUI:**
```
Super + Alt + Space > Remove > TUI > FocusFlow
```

**Si instalaste manualmente:**
```bash
rm ~/.local/share/applications/FocusFlow.desktop
rm ~/.local/share/applications/icons/focusflow.png
update-desktop-database ~/.local/share/applications/
```

---

## 📋 Resumen

**Método más fácil:** Usa `Super + Alt + Space > Install > TUI`

**Método más rápido:** Ejecuta `./install-omarchy.sh`

**Método manual:** Copia y pega los comandos de la Opción 2

¡Disfruta de FocusFlow integrado en Omarchy! 🎉
