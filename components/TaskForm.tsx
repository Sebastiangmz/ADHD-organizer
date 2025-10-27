import React, { useState } from 'react';
import { Task, Priority, Subtask } from '../types';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
  initialTask?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  mode,
  initialTask
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || Priority.MEDIA);
  const [details, setDetails] = useState(initialTask?.details || '');
  const [targetDate, setTargetDate] = useState(initialTask?.targetDate || '');
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialTask?.subtasks || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate unique ID for new subtasks
  const generateSubtaskId = () => {
    // Simple UUID-like generator for browser compatibility
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (title.length > 200) {
      newErrors.title = 'El título debe tener máximo 200 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Always validate before any action
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    const taskData: Omit<Task, 'id' | 'createdAt'> = {
      title: title.trim(),
      priority,
      details: details.trim(),
      subtasks: subtasks.filter(s => s.text.trim() !== ''),
      completed: initialTask?.completed || false,
      targetDate: targetDate || undefined
    };

    onSubmit(taskData);
  };

  const handleAddSubtask = () => {
    const newSubtask: Subtask = {
      id: generateSubtaskId(),
      text: '',
      completed: false
    };
    setSubtasks([...subtasks, newSubtask]);
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubtaskChange = (id: string, text: string) => {
    setSubtasks(
      subtasks.map(s =>
        s.id === id ? { ...s, text } : s
      )
    );
  };

  const headerText = mode === 'create' ? 'Nueva Tarea' : 'Editar Tarea';
  const submitButtonText = mode === 'create' ? 'Crear Tarea' : 'Guardar Cambios';

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{headerText}</h2>

      {/* Title Input */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) {
              setErrors({ ...errors, title: '' });
            }
          }}
          placeholder="Ej: Estudiar para examen"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">{title.length}/200 caracteres</p>
      </div>

      {/* Priority Select */}
      <div className="mb-4">
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          Prioridad
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={Priority.BAJA}>{Priority.BAJA}</option>
          <option value={Priority.MEDIA}>{Priority.MEDIA}</option>
          <option value={Priority.ALTA}>{Priority.ALTA}</option>
        </select>
      </div>

      {/* Details Textarea */}
      <div className="mb-4">
        <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
          Detalles
        </label>
        <textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Ej: Revisar capítulos 1-5 del libro de matemáticas"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Target Date Input */}
      <div className="mb-6">
        <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha objetivo
        </label>
        <input
          id="targetDate"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Subtasks Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Subtareas
          </label>
          <button
            type="button"
            onClick={handleAddSubtask}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Agregar Subtarea
          </button>
        </div>

        {subtasks.length > 0 && (
          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={subtask.text}
                  onChange={(e) => handleSubtaskChange(subtask.id, e.target.value)}
                  placeholder="Nueva subtarea"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(subtask.id)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {submitButtonText}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
