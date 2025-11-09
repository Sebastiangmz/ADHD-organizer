const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'focusflow.db');

// Initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
    initDatabase();
  }
});

// Initialize database schema
function initDatabase() {
  db.serialize(() => {
    // Create tasks table
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        priority TEXT NOT NULL CHECK(priority IN ('Alta', 'Media', 'Baja')),
        details TEXT,
        completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        target_date TEXT,
        created_timestamp INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `, (err) => {
      if (err) {
        console.error('Error creating tasks table:', err.message);
      } else {
        console.log('Tasks table ready');
      }
    });

    // Create subtasks table
    db.run(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating subtasks table:', err.message);
      } else {
        console.log('Subtasks table ready');
      }
    });

    // Create index for faster queries
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at)
    `);

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_tasks_target_date ON tasks(target_date)
    `);

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id)
    `);
  });
}

// Promisify database operations for easier async/await usage
const dbPromise = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

module.exports = { db, dbPromise };
