const express = require('express');
const cors = require('cors');
const { dbPromise } = require('./database.cjs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to convert DB row to Task object
function convertToTask(taskRow, subtaskRows) {
  return {
    id: taskRow.id,
    title: taskRow.title,
    priority: taskRow.priority,
    details: taskRow.details || undefined,
    completed: Boolean(taskRow.completed),
    createdAt: taskRow.created_at,
    targetDate: taskRow.target_date || undefined,
    subtasks: subtaskRows.map(sub => ({
      id: sub.id,
      text: sub.text,
      completed: Boolean(sub.completed)
    }))
  };
}

// GET /api/tasks - Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await dbPromise.all('SELECT * FROM tasks ORDER BY created_timestamp DESC');

    // Get subtasks for all tasks
    const tasksWithSubtasks = await Promise.all(
      tasks.map(async (task) => {
        const subtasks = await dbPromise.all(
          'SELECT * FROM subtasks WHERE task_id = ? ORDER BY position',
          [task.id]
        );
        return convertToTask(task, subtasks);
      })
    );

    res.json(tasksWithSubtasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id - Get a single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await dbPromise.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const subtasks = await dbPromise.all(
      'SELECT * FROM subtasks WHERE task_id = ? ORDER BY position',
      [task.id]
    );

    res.json(convertToTask(task, subtasks));
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { id, title, priority, details, completed, createdAt, targetDate, subtasks } = req.body;

    // Validate required fields
    if (!id || !title || !priority || !createdAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert task
    await dbPromise.run(
      `INSERT INTO tasks (id, title, priority, details, completed, created_at, target_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, title, priority, details || null, completed ? 1 : 0, createdAt, targetDate || null]
    );

    // Insert subtasks
    if (subtasks && subtasks.length > 0) {
      for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        await dbPromise.run(
          `INSERT INTO subtasks (id, task_id, text, completed, position)
           VALUES (?, ?, ?, ?, ?)`,
          [subtask.id, id, subtask.text, subtask.completed ? 1 : 0, i]
        );
      }
    }

    // Fetch and return the created task
    const task = await dbPromise.get('SELECT * FROM tasks WHERE id = ?', [id]);
    const taskSubtasks = await dbPromise.all(
      'SELECT * FROM subtasks WHERE task_id = ? ORDER BY position',
      [id]
    );

    res.status(201).json(convertToTask(task, taskSubtasks));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, priority, details, completed, targetDate, subtasks } = req.body;

    // Update task
    await dbPromise.run(
      `UPDATE tasks
       SET title = ?, priority = ?, details = ?, completed = ?, target_date = ?
       WHERE id = ?`,
      [title, priority, details || null, completed ? 1 : 0, targetDate || null, req.params.id]
    );

    // Delete existing subtasks
    await dbPromise.run('DELETE FROM subtasks WHERE task_id = ?', [req.params.id]);

    // Insert updated subtasks
    if (subtasks && subtasks.length > 0) {
      for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        await dbPromise.run(
          `INSERT INTO subtasks (id, task_id, text, completed, position)
           VALUES (?, ?, ?, ?, ?)`,
          [subtask.id, req.params.id, subtask.text, subtask.completed ? 1 : 0, i]
        );
      }
    }

    // Fetch and return the updated task
    const task = await dbPromise.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    const taskSubtasks = await dbPromise.all(
      'SELECT * FROM subtasks WHERE task_id = ? ORDER BY position',
      [req.params.id]
    );

    res.json(convertToTask(task, taskSubtasks));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    // Delete subtasks first (cascade will handle this in most cases, but being explicit)
    await dbPromise.run('DELETE FROM subtasks WHERE task_id = ?', [req.params.id]);

    // Delete task
    const result = await dbPromise.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// POST /api/tasks/bulk - Bulk create tasks (for migration)
app.post('/api/tasks/bulk', async (req, res) => {
  try {
    const tasks = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Expected an array of tasks' });
    }

    let successCount = 0;
    let errorCount = 0;

    for (const task of tasks) {
      try {
        const { id, title, priority, details, completed, createdAt, targetDate, subtasks } = task;

        // Insert task
        await dbPromise.run(
          `INSERT OR REPLACE INTO tasks (id, title, priority, details, completed, created_at, target_date)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, title, priority, details || null, completed ? 1 : 0, createdAt, targetDate || null]
        );

        // Delete existing subtasks first
        await dbPromise.run('DELETE FROM subtasks WHERE task_id = ?', [id]);

        // Insert subtasks
        if (subtasks && subtasks.length > 0) {
          for (let i = 0; i < subtasks.length; i++) {
            const subtask = subtasks[i];
            await dbPromise.run(
              `INSERT INTO subtasks (id, task_id, text, completed, position)
               VALUES (?, ?, ?, ?, ?)`,
              [subtask.id, id, subtask.text, subtask.completed ? 1 : 0, i]
            );
          }
        }

        successCount++;
      } catch (error) {
        console.error(`Error importing task ${task.id}:`, error);
        errorCount++;
      }
    }

    res.json({
      message: 'Bulk import completed',
      success: successCount,
      errors: errorCount
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ error: 'Failed to import tasks' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FocusFlow API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
