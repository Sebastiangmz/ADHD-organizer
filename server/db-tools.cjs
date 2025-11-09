#!/usr/bin/env node

/**
 * Herramientas de Base de Datos para FocusFlow AI
 *
 * Uso:
 *   node server/db-tools.cjs stats    - Ver estadísticas de la BD
 *   node server/db-tools.cjs backup   - Crear backup
 *   node server/db-tools.cjs export   - Exportar a JSON
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'focusflow.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error abriendo base de datos:', err.message);
    process.exit(1);
  }
});

const dbPromise = {
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
};

async function showStats() {
  try {
    const tasks = await dbPromise.all('SELECT COUNT(*) as count FROM tasks');
    const completedTasks = await dbPromise.all('SELECT COUNT(*) as count FROM tasks WHERE completed = 1');
    const subtasks = await dbPromise.all('SELECT COUNT(*) as count FROM subtasks');
    const priorities = await dbPromise.all('SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority');

    const fileStats = fs.statSync(DB_PATH);
    const sizeInKB = (fileStats.size / 1024).toFixed(2);

    console.log('\n📊 Estadísticas de Base de Datos\n');
    console.log(`📁 Archivo: ${DB_PATH}`);
    console.log(`💾 Tamaño: ${sizeInKB} KB`);
    console.log(`\n📋 Tareas:`);
    console.log(`   Total: ${tasks[0].count}`);
    console.log(`   Completadas: ${completedTasks[0].count}`);
    console.log(`   Pendientes: ${tasks[0].count - completedTasks[0].count}`);
    console.log(`\n🔸 Subtareas: ${subtasks[0].count}`);
    console.log(`\n⚡ Por Prioridad:`);
    priorities.forEach(p => {
      const emoji = p.priority === 'Alta' ? '🔴' : p.priority === 'Media' ? '🟡' : '🟢';
      console.log(`   ${emoji} ${p.priority}: ${p.count}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupPath = path.join(__dirname, `focusflow-backup-${timestamp}.db`);

    fs.copyFileSync(DB_PATH, backupPath);

    const fileStats = fs.statSync(backupPath);
    const sizeInKB = (fileStats.size / 1024).toFixed(2);

    console.log(`\n✅ Backup creado exitosamente!`);
    console.log(`📁 Ubicación: ${backupPath}`);
    console.log(`💾 Tamaño: ${sizeInKB} KB\n`);
  } catch (error) {
    console.error('❌ Error creando backup:', error.message);
  }
}

async function exportToJSON() {
  try {
    const tasks = await dbPromise.all('SELECT * FROM tasks ORDER BY created_timestamp DESC');

    const tasksWithSubtasks = await Promise.all(
      tasks.map(async (task) => {
        const subtasks = await dbPromise.all(
          'SELECT id, text, completed FROM subtasks WHERE task_id = ? ORDER BY position',
          [task.id]
        );

        return {
          id: task.id,
          title: task.title,
          priority: task.priority,
          details: task.details || undefined,
          completed: Boolean(task.completed),
          createdAt: task.created_at,
          targetDate: task.target_date || undefined,
          subtasks: subtasks.map(sub => ({
            id: sub.id,
            text: sub.text,
            completed: Boolean(sub.completed)
          }))
        };
      })
    );

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const exportPath = path.join(__dirname, `focusflow-export-${timestamp}.json`);

    fs.writeFileSync(exportPath, JSON.stringify(tasksWithSubtasks, null, 2));

    console.log(`\n✅ Exportación completada!`);
    console.log(`📁 Ubicación: ${exportPath}`);
    console.log(`📋 Tareas exportadas: ${tasksWithSubtasks.length}\n`);
  } catch (error) {
    console.error('❌ Error exportando:', error.message);
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'stats':
      await showStats();
      break;
    case 'backup':
      await createBackup();
      break;
    case 'export':
      await exportToJSON();
      break;
    default:
      console.log(`
🛠️  Herramientas de Base de Datos - FocusFlow AI

Uso:
  node server/db-tools.cjs stats    - Ver estadísticas de la BD
  node server/db-tools.cjs backup   - Crear backup de la BD
  node server/db-tools.cjs export   - Exportar tareas a JSON

Ejemplos:
  node server/db-tools.cjs stats
  node server/db-tools.cjs backup
  node server/db-tools.cjs export
      `);
  }

  db.close();
}

main();
