# 🗄️ Configuración de Base de Datos - FocusFlow AI

## ✅ ¡Ya está configurado!

Tu aplicación ahora usa **SQLite** como base de datos permanente. Esto significa que:

- ✅ **Tus tareas nunca se perderán**
- ✅ **Persistencia real en disco** (no solo navegador)
- ✅ **Fácil de respaldar** (solo copia el archivo .db)
- ✅ **Sin límite de 5MB** como localStorage
- ✅ **Migración automática** desde localStorage

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción 1: Todo junto (Recomendado)
```bash
npm start
```
Esto inicia **automáticamente**:
- Backend en `http://localhost:3001`
- Frontend en `http://localhost:3000`

### Opción 2: Por separado (para desarrollo)

**Terminal 1 - Backend:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 📂 Ubicación de la Base de Datos

Tu base de datos SQLite se encuentra en:
```
/home/sebastian/Documents/ADHD-organizer/server/focusflow.db
```

### 💾 Hacer Backup

Para respaldar todas tus tareas:
```bash
cp /home/sebastian/Documents/ADHD-organizer/server/focusflow.db ~/focusflow-backup-$(date +%Y%m%d).db
```

### 🔄 Restaurar desde Backup

```bash
cp ~/focusflow-backup-YYYYMMDD.db /home/sebastian/Documents/ADHD-organizer/server/focusflow.db
```

---

## 🔧 API Endpoints

El backend expone estos endpoints:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Verifica estado del servidor |
| GET | `/api/tasks` | Obtiene todas las tareas |
| GET | `/api/tasks/:id` | Obtiene una tarea específica |
| POST | `/api/tasks` | Crea una nueva tarea |
| PUT | `/api/tasks/:id` | Actualiza una tarea |
| DELETE | `/api/tasks/:id` | Elimina una tarea |
| POST | `/api/tasks/bulk` | Importa múltiples tareas |

---

## 🔍 Verificar que Todo Funciona

### 1. Verifica que el servidor esté corriendo:
```bash
curl http://localhost:3001/api/health
```
Deberías ver: `{"status":"ok","timestamp":"..."}`

### 2. Verifica la base de datos:
```bash
ls -lh /home/sebastian/Documents/ADHD-organizer/server/focusflow.db
```

### 3. Abre la aplicación:
```
http://localhost:3000
```

---

## 📊 Estructura de la Base de Datos

### Tabla `tasks`
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('Alta', 'Media', 'Baja')),
  details TEXT,
  completed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  target_date TEXT,
  created_timestamp INTEGER DEFAULT (strftime('%s', 'now'))
)
```

### Tabla `subtasks`
```sql
CREATE TABLE subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
)
```

---

## 🛡️ Modo de Respaldo (Fallback)

Si el servidor no está disponible, la aplicación automáticamente:
- ⚠️ Muestra un aviso: "Modo Sin Conexión"
- 💾 Guarda cambios en localStorage como respaldo
- 🔄 Migra datos cuando el servidor vuelve a estar disponible

---

## 🐛 Solución de Problemas

### Error: "No se puede conectar al servidor"
```bash
# Verifica que el servidor esté corriendo
npm run server
```

### Error: Puerto 3001 en uso
```bash
# Encuentra el proceso
lsof -i :3001

# Mata el proceso
kill -9 <PID>
```

### Ver logs del servidor
```bash
npm run server:dev
```

### Reiniciar base de datos (⚠️ BORRA TODAS LAS TAREAS)
```bash
rm /home/sebastian/Documents/ADHD-organizer/server/focusflow.db
npm run server
```

---

## 📝 Notas Importantes

1. **Siempre inicia el servidor antes del frontend** (o usa `npm start`)
2. **La migración desde localStorage es automática** la primera vez
3. **Después de la migración, localStorage se limpia automáticamente**
4. **Haz backups periódicos** del archivo .db

---

## 🎉 ¡Listo!

Tu aplicación ahora tiene persistencia permanente. Todas tus tareas se guardan en la base de datos SQLite y nunca se perderán, incluso si cierras el navegador o reinicias la computadora.

Para iniciar la aplicación, simplemente ejecuta:
```bash
npm start
```

¡Y a organizarte! 🚀
