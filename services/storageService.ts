import { Task } from '../types';

// Constants
const STORAGE_KEY = 'focusflow_tasks';
const STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB in bytes
const INIT_FLAG_KEY = 'focusflow_initialized';

/**
 * LocalStorage service for task persistence
 * Provides CRUD operations and storage quota monitoring
 */
export const storageService = {
  /**
   * Retrieve all tasks from localStorage
   * Returns empty array if no tasks exist or on error
   */
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }

      const tasks = JSON.parse(data) as Task[];

      // Validate tasks have required fields
      const validTasks = tasks.filter(task =>
        task.id &&
        task.title &&
        task.priority &&
        Array.isArray(task.subtasks)
      );

      if (validTasks.length !== tasks.length) {
        console.warn(`Filtered out ${tasks.length - validTasks.length} invalid tasks`);
      }

      return validTasks;
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  },

  /**
   * Save all tasks to localStorage
   * Throws error if quota exceeded
   */
  saveTasks(tasks: Task[]): void {
    try {
      const data = JSON.stringify(tasks);

      // Check if data would exceed quota
      const estimatedSize = new Blob([data]).size;
      if (estimatedSize > STORAGE_LIMIT * 0.95) { // 95% threshold
        throw new Error('QUOTA_EXCEEDED');
      }

      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(INIT_FLAG_KEY, 'true');
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('No se puede guardar. El almacenamiento está lleno. Elimina tareas antiguas.');
      }
      throw error;
    }
  },

  /**
   * Add a single task to storage
   */
  addTask(task: Task): void {
    const tasks = this.getTasks();
    tasks.push(task);
    this.saveTasks(tasks);
  },

  /**
   * Update an existing task by ID with partial updates
   */
  updateTask(taskId: string, updates: Partial<Task>): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);

    if (index === -1) {
      console.warn(`Task with id ${taskId} not found`);
      return;
    }

    tasks[index] = { ...tasks[index], ...updates };
    this.saveTasks(tasks);
  },

  /**
   * Delete a task by ID
   */
  deleteTask(taskId: string): void {
    const tasks = this.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    this.saveTasks(filtered);
  },

  /**
   * Get storage usage statistics
   */
  getStorageInfo(): { used: number; limit: number; percentage: number; taskCount: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEY) || '[]';
      const used = new Blob([data]).size;
      const percentage = (used / STORAGE_LIMIT) * 100;
      const tasks = this.getTasks();

      return {
        used,
        limit: STORAGE_LIMIT,
        percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
        taskCount: tasks.length
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        used: 0,
        limit: STORAGE_LIMIT,
        percentage: 0,
        taskCount: 0
      };
    }
  },

  /**
   * Check if storage has been initialized (to distinguish empty from uninitialized)
   */
  isInitialized(): boolean {
    return localStorage.getItem(INIT_FLAG_KEY) === 'true';
  },

  /**
   * Clear all tasks from storage
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(INIT_FLAG_KEY);
  }
};
