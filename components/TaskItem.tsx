
import React, { useState } from 'react';
import { Task, Subtask, Priority } from '../types';
import { CheckCircleIcon, ChevronDownIcon } from './icons';

interface TaskItemProps {
  task: Task;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const priorityStyles: { [key in Priority]: { bg: string; text: string; border: string } } = {
  [Priority.ALTA]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
  [Priority.MEDIA]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
  [Priority.BAJA]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleTask, onToggleSubtask }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const styles = priorityStyles[task.priority];

  const allSubtasksCompleted = task.subtasks.length > 0 && task.subtasks.every(s => s.completed);

  return (
    <div className={`transition-all duration-300 rounded-lg shadow-sm mb-4 border-l-4 ${task.completed ? 'bg-gray-100 border-gray-300' : `${styles.bg} ${styles.border}`}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <input
              type="checkbox"
              className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-1"
              checked={task.completed}
              onChange={() => onToggleTask(task.id)}
            />
            <div className="ml-4">
              <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : styles.text}`}>{task.title}</h3>
              {task.details && <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>{task.details}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}>{task.priority}</span>
              {task.subtasks.length > 0 && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full hover:bg-black/10 transition-colors">
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`} />
                </button>
              )}
          </div>
        </div>
      </div>
      
      {isExpanded && task.subtasks.length > 0 && (
        <div className={`px-4 pb-4 transition-all duration-500 ease-in-out overflow-hidden`}>
          <div className="border-t border-gray-300/60 pt-3 ml-10 space-y-2">
            {task.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
                  checked={subtask.completed}
                  onChange={() => onToggleSubtask(task.id, subtask.id)}
                  disabled={task.completed}
                />
                <label className={`ml-3 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {subtask.text}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
       {allSubtasksCompleted && !task.completed && (
        <div className="px-4 pb-4 mt-2">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md flex items-center ml-10">
                <CheckCircleIcon className="h-5 w-5 mr-2"/>
                <p className="text-sm font-medium">¡Todas las subtareas completas! ¿Marcar la tarea principal como finalizada?</p>
            </div>
        </div>
        )}
    </div>
  );
};

export default TaskItem;

