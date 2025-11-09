import { Task } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * API Service for communicating with the backend
 * Handles all HTTP requests for task CRUD operations
 */
export const apiService = {
  /**
   * Fetch all tasks from the database
   */
  async getTasks(): Promise<Task[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('No se pudieron cargar las tareas desde el servidor');
    }
  },

  /**
   * Fetch a single task by ID
   */
  async getTask(id: string): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw new Error('No se pudo cargar la tarea');
    }
  },

  /**
   * Create a new task
   */
  async createTask(task: Task): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('No se pudo crear la tarea');
    }
  },

  /**
   * Update an existing task
   */
  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw new Error('No se pudo actualizar la tarea');
    }
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw new Error('No se pudo eliminar la tarea');
    }
  },

  /**
   * Bulk create tasks (for migration from localStorage)
   */
  async bulkCreateTasks(tasks: Task[]): Promise<{ success: number; errors: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tasks),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error bulk creating tasks:', error);
      throw new Error('No se pudieron migrar las tareas');
    }
  },

  /**
   * Check if the API server is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },
};
