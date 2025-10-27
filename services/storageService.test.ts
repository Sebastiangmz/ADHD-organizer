import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { storageService } from './storageService';
import { Task, Priority } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getTasks', () => {
    it('should return empty array when localStorage is empty', () => {
      const tasks = storageService.getTasks();
      expect(tasks).toEqual([]);
    });

    it('should return tasks from localStorage', () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          priority: Priority.ALTA,
          details: 'Test details',
          subtasks: [],
          completed: false,
          createdAt: '2025-10-26T14:30:00Z',
          targetDate: undefined
        }
      ];

      localStorage.setItem('focusflow_tasks', JSON.stringify(mockTasks));
      const tasks = storageService.getTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Test Task');
    });

    it('should filter out invalid tasks', () => {
      const invalidData = [
        {
          id: '1',
          title: 'Valid Task',
          priority: Priority.MEDIA,
          subtasks: [],
          completed: false,
          createdAt: '2025-10-26T14:30:00Z'
        },
        {
          // Missing title - invalid
          id: '2',
          priority: Priority.BAJA,
          subtasks: [],
          completed: false,
          createdAt: '2025-10-26T14:30:00Z'
        }
      ];

      localStorage.setItem('focusflow_tasks', JSON.stringify(invalidData));
      const tasks = storageService.getTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Valid Task');
    });

    it('should return empty array on corrupted JSON', () => {
      localStorage.setItem('focusflow_tasks', 'invalid json {]');
      const tasks = storageService.getTasks();

      expect(tasks).toEqual([]);
      expect(localStorage.getItem('focusflow_tasks')).toBeNull();
    });
  });

  describe('saveTasks', () => {
    it('should save tasks to localStorage', () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          priority: Priority.ALTA,
          subtasks: [],
          completed: false,
          createdAt: '2025-10-26T14:30:00Z'
        }
      ];

      storageService.saveTasks(mockTasks);
      const stored = localStorage.getItem('focusflow_tasks');

      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe('Test Task');
    });

    it('should set initialization flag', () => {
      const mockTasks: Task[] = [];
      storageService.saveTasks(mockTasks);

      expect(localStorage.getItem('focusflow_initialized')).toBe('true');
    });

    it('should throw error when quota exceeded', () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test',
          priority: Priority.MEDIA,
          subtasks: [],
          completed: false,
          createdAt: '2025-10-26T14:30:00Z'
        }
      ];

      expect(() => storageService.saveTasks(mockTasks)).toThrow();

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('addTask', () => {
    it('should add task to storage', () => {
      const newTask: Task = {
        id: '1',
        title: 'New Task',
        priority: Priority.MEDIA,
        subtasks: [],
        completed: false,
        createdAt: '2025-10-26T14:30:00Z'
      };

      storageService.addTask(newTask);
      const tasks = storageService.getTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('New Task');
    });

    it('should append to existing tasks', () => {
      const task1: Task = {
        id: '1',
        title: 'Task 1',
        priority: Priority.ALTA,
        subtasks: [],
        completed: false,
        createdAt: '2025-10-26T14:30:00Z'
      };

      const task2: Task = {
        id: '2',
        title: 'Task 2',
        priority: Priority.MEDIA,
        subtasks: [],
        completed: false,
        createdAt: '2025-10-26T14:35:00Z'
      };

      storageService.addTask(task1);
      storageService.addTask(task2);

      const tasks = storageService.getTasks();
      expect(tasks).toHaveLength(2);
    });
  });

  describe('updateTask', () => {
    it('should update existing task', () => {
      const originalTask: Task = {
        id: '1',
        title: 'Original Title',
        priority: Priority.MEDIA,
        subtasks: [],
        completed: false,
        createdAt: '2025-10-26T14:30:00Z'
      };

      storageService.addTask(originalTask);
      storageService.updateTask('1', { title: 'Updated Title', priority: Priority.ALTA });

      const tasks = storageService.getTasks();
      expect(tasks[0].title).toBe('Updated Title');
      expect(tasks[0].priority).toBe(Priority.ALTA);
    });

    it('should not update if task not found', () => {
      const task: Task = {
        id: '1',
        title: 'Task',
        priority: Priority.MEDIA,
        subtasks: [],
        completed: false,
        createdAt: '2025-10-26T14:30:00Z'
      };

      storageService.addTask(task);
      storageService.updateTask('nonexistent', { title: 'Updated' });

      const tasks = storageService.getTasks();
      expect(tasks[0].title).toBe('Task');
    });
  });

  describe('deleteTask', () => {
    it('should delete task from storage', () => {
      const task: Task = {
        id: '1',
        title: 'Task to Delete',
        priority: Priority.MEDIA,
        subtasks: [],
        completed: false,
        createdAt: '2025-10-26T14:30:00Z'
      };

      storageService.addTask(task);
      expect(storageService.getTasks()).toHaveLength(1);

      storageService.deleteTask('1');
      expect(storageService.getTasks()).toHaveLength(0);
    });

    it('should handle deleting nonexistent task', () => {
      const task: Task = {
        id: '1',
        title: 'Task',
        priority: Priority.MEDIA,
        subtasks: [],
        completed: false,
        createdAt: '2025-10-26T14:30:00Z'
      };

      storageService.addTask(task);
      storageService.deleteTask('nonexistent');

      expect(storageService.getTasks()).toHaveLength(1);
    });
  });

  describe('getStorageInfo', () => {
    it('should return correct storage info', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        priority: Priority.MEDIA,
        subtasks: [],
        completed: false,
        createdAt: '2025-10-26T14:30:00Z'
      };

      storageService.addTask(task);
      const tasks = storageService.getTasks();
      expect(tasks).toHaveLength(1); // Verify task was actually saved

      const info = storageService.getStorageInfo();

      expect(info.limit).toBe(5 * 1024 * 1024);
      expect(info.taskCount).toBe(1);
      expect(info.percentage).toBeGreaterThanOrEqual(0);
      expect(info.percentage).toBeLessThan(1); // Should be very small percentage
    });

    it('should show minimal percentage when empty', () => {
      const info = storageService.getStorageInfo();

      // Even empty JSON array "[]" takes 2 bytes
      expect(info.used).toBeGreaterThanOrEqual(0);
      expect(info.percentage).toBeLessThanOrEqual(0.1);
      expect(info.taskCount).toBe(0);
    });
  });

  describe('isInitialized', () => {
    it('should return false initially', () => {
      expect(storageService.isInitialized()).toBe(false);
    });

    it('should return true after saving', () => {
      storageService.saveTasks([]);
      expect(storageService.isInitialized()).toBe(true);
    });
  });

  describe('clearAll', () => {
    it('should clear all data from storage', () => {
      const task: Task = {
        id: '1',
        title: 'Task',
        priority: Priority.MEDIA,
        subtasks: [],
        completed: false,
        createdAt: '2025-10-26T14:30:00Z'
      };

      storageService.addTask(task);
      expect(storageService.getTasks()).toHaveLength(1);

      storageService.clearAll();

      expect(storageService.getTasks()).toHaveLength(0);
      expect(storageService.isInitialized()).toBe(false);
    });
  });
});
