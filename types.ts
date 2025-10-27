
export enum Priority {
  ALTA = 'Alta',
  MEDIA = 'Media',
  BAJA = 'Baja',
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  details?: string;
  subtasks: Subtask[];
  completed: boolean;
  /** ISO 8601 timestamp (e.g., "2025-10-26T14:30:00.000Z") indicating when the task was created */
  createdAt: string;
  /** ISO 8601 date (e.g., "2025-10-30") indicating when the user plans to complete the task (optional) */
  targetDate?: string;
}
