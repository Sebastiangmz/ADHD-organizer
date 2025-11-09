# FocusFlow AI - Backend Server

Este es el servidor backend de FocusFlow AI que proporciona persistencia de datos usando SQLite.

## Estructura de Base de Datos

### Tabla `tasks`
- `id` (TEXT, PRIMARY KEY): Identificador único de la tarea
- `title` (TEXT, NOT NULL): Título de la tarea
- `priority` (TEXT, NOT NULL): Prioridad (Alta, Media, Baja)
- `details` (TEXT): Detalles adicionales
- `completed` (INTEGER): Estado de completado (0 o 1)
- `created_at` (TEXT, NOT NULL): Timestamp ISO 8601 de creación
- `target_date` (TEXT): Fecha objetivo (YYYY-MM-DD)
- `created_timestamp` (INTEGER): Timestamp Unix para ordenamiento

### Tabla `subtasks`
- `id` (TEXT, PRIMARY KEY): Identificador único de la subtarea
- `task_id` (TEXT, NOT NULL): ID de la tarea padre
- `text` (TEXT, NOT NULL): Texto de la subtarea
- `completed` (INTEGER): Estado de completado (0 o 1)
- `position` (INTEGER): Orden de la subtarea

## API Endpoints

### GET /api/health
Verifica el estado del servidor
```json
{ "status": "ok", "timestamp": "2025-11-09T..." }
```

### GET /api/tasks
Obtiene todas las tareas con sus subtareas

### GET /api/tasks/:id
Obtiene una tarea específica por ID

### POST /api/tasks
Crea una nueva tarea
```json
{
  "id": "task-xxx",
  "title": "Mi tarea",
  "priority": "Media",
  "details": "Detalles opcionales",
  "completed": false,
  "createdAt": "2025-11-09T...",
  "targetDate": "2025-11-10",
  "subtasks": [
    { "id": "sub-xxx", "text": "Subtarea 1", "completed": false }
  ]
}
```

### PUT /api/tasks/:id
Actualiza una tarea existente

### DELETE /api/tasks/:id
Elimina una tarea

### POST /api/tasks/bulk
Importa múltiples tareas (usado para migración desde localStorage)

## Ejecución

```bash
# Iniciar servidor
npm run server

# Iniciar servidor con auto-reload (desarrollo)
npm run server:dev

# Iniciar frontend + backend simultáneamente
npm start
```

El servidor corre en `http://localhost:3001` por defecto.

## Archivo de Base de Datos

La base de datos SQLite se guarda en:
```
/home/sebastian/Documents/ADHD-organizer/server/focusflow.db
```

Para hacer backup, simplemente copia este archivo.
