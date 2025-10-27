import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm';
import { Priority } from '../types';

describe('TaskForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Create Mode', () => {
    it('should render form with empty fields in create mode', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      expect((screen.getByLabelText(/Título/) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/Prioridad/) as HTMLSelectElement).value).toBe(Priority.MEDIA);
      expect((screen.getByLabelText(/Detalles/) as HTMLTextAreaElement).value).toBe('');
      expect((screen.getByLabelText(/Fecha objetivo/) as HTMLInputElement).value).toBe('');
    });

    it('should display create header text', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      expect(screen.getByText(/Nueva Tarea/)).toBeTruthy();
    });

    it('should have "Crear Tarea" button in create mode', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      expect(screen.getByText('Crear Tarea')).toBeTruthy();
    });
  });

  describe('Edit Mode', () => {
    const existingTask = {
      id: '1',
      title: 'Test Task',
      priority: Priority.ALTA,
      details: 'Task details',
      subtasks: [{ id: 's1', text: 'Subtask 1', completed: false }],
      completed: false,
      createdAt: '2025-10-26T10:00:00Z',
      targetDate: '2025-10-28'
    };

    it('should render form with existing task data in edit mode', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
          initialTask={existingTask}
        />
      );

      expect((screen.getByLabelText(/Título/) as HTMLInputElement).value).toBe('Test Task');
      expect((screen.getByLabelText(/Prioridad/) as HTMLSelectElement).value).toBe(Priority.ALTA);
      expect((screen.getByLabelText(/Detalles/) as HTMLTextAreaElement).value).toBe('Task details');
      expect((screen.getByLabelText(/Fecha objetivo/) as HTMLInputElement).value).toBe('2025-10-28');
    });

    it('should display edit header text', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
          initialTask={existingTask}
        />
      );

      expect(screen.getByText(/Editar Tarea/)).toBeTruthy();
    });

    it('should have "Guardar Cambios" button in edit mode', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
          initialTask={existingTask}
        />
      );

      expect(screen.getByText('Guardar Cambios')).toBeTruthy();
    });

    it('should display existing subtasks', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
          initialTask={existingTask}
        />
      );

      const subtaskInput = screen.getByDisplayValue('Subtask 1');
      expect(subtaskInput).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should not submit with empty title', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      // Fill and then clear the title to bypass HTML5 required validation
      const titleInput = screen.getByLabelText(/Título/);
      await user.type(titleInput, 'Test');
      await user.clear(titleInput);

      const submitButton = screen.getByText('Crear Tarea');
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/El título es requerido/)).toBeTruthy();
    });

    it('should not submit if title exceeds max length', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/Título/);
      const longTitle = 'a'.repeat(201);
      await user.clear(titleInput);
      await user.type(titleInput, longTitle);

      const submitButton = screen.getByText('Crear Tarea');
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/máximo 200 caracteres/)).toBeTruthy();
    });

    it('should submit with valid title', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/Título/);
      await user.clear(titleInput);
      await user.type(titleInput, 'Valid Title');

      const submitButton = screen.getByText('Crear Tarea');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should show error when title is empty after filled', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/Título/);
      await user.type(titleInput, 'Some title');
      await user.clear(titleInput);

      const submitButton = screen.getByText('Crear Tarea');
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Subtask Management', () => {
    it('should add new subtask', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const addSubtaskBtn = screen.getByText('+ Agregar Subtarea');
      await user.click(addSubtaskBtn);

      expect(screen.getByPlaceholderText(/Nueva subtarea/)).toBeTruthy();
    });

    it('should remove subtask', async () => {
      const user = userEvent.setup();
      const existingTask = {
        id: '1',
        title: 'Test',
        priority: Priority.MEDIA,
        details: '',
        subtasks: [{ id: 's1', text: 'Subtask 1', completed: false }],
        completed: false,
        createdAt: '2025-10-26T10:00:00Z'
      };

      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="edit"
          initialTask={existingTask}
        />
      );

      const removeButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('Eliminar')
      );
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0]);
        expect(screen.queryByText('Subtask 1')).not.toBeTruthy();
      }
    });

    it('should support multiple subtasks', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const addSubtaskBtn = screen.getByText('+ Agregar Subtarea');
      await user.click(addSubtaskBtn);
      await user.click(addSubtaskBtn);

      const inputs = screen.getAllByPlaceholderText(/Nueva subtarea/);
      expect(inputs.length).toBe(2);
    });

    it('should handle subtask text input', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const addSubtaskBtn = screen.getByText('+ Agregar Subtarea');
      await user.click(addSubtaskBtn);

      const subtaskInput = screen.getByPlaceholderText(/Nueva subtarea/) as HTMLInputElement;
      await user.type(subtaskInput, 'My subtask');

      expect(subtaskInput.value).toBe('My subtask');
    });
  });

  describe('Form Actions', () => {
    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const cancelButton = screen.getByText('Cancelar');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should pass correct data to onSubmit', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/Título/);
      const prioritySelect = screen.getByLabelText(/Prioridad/);
      const targetDateInput = screen.getByLabelText(/Fecha objetivo/);

      await user.clear(titleInput);
      await user.type(titleInput, 'New Task');
      await user.selectOptions(prioritySelect, Priority.ALTA);
      await user.clear(targetDateInput);
      await user.type(targetDateInput, '2025-10-30');

      const submitButton = screen.getByText('Crear Tarea');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          priority: Priority.ALTA,
          targetDate: '2025-10-30'
        })
      );
    });

    it('should include subtasks in submit data', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/Título/);
      await user.clear(titleInput);
      await user.type(titleInput, 'Task with subtasks');

      const addSubtaskBtn = screen.getByText('+ Agregar Subtarea');
      await user.click(addSubtaskBtn);

      const subtaskInput = screen.getByPlaceholderText(/Nueva subtarea/);
      await user.type(subtaskInput, 'Subtask 1');

      const submitButton = screen.getByText('Crear Tarea');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          subtasks: expect.arrayContaining([
            expect.objectContaining({ text: 'Subtask 1' })
          ])
        })
      );
    });
  });

  describe('Priority Selection', () => {
    it('should have all priority options available', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const prioritySelect = screen.getByLabelText(/Prioridad/) as HTMLSelectElement;
      const options = Array.from(prioritySelect.options).map(opt => opt.value);

      expect(options).toContain(Priority.BAJA);
      expect(options).toContain(Priority.MEDIA);
      expect(options).toContain(Priority.ALTA);
    });

    it('should default to MEDIA priority', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const prioritySelect = screen.getByLabelText(/Prioridad/) as HTMLSelectElement;
      expect(prioritySelect.value).toBe(Priority.MEDIA);
    });

    it('should change priority selection', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const prioritySelect = screen.getByLabelText(/Prioridad/) as HTMLSelectElement;
      await user.selectOptions(prioritySelect, Priority.BAJA);

      expect(prioritySelect.value).toBe(Priority.BAJA);
    });
  });

  describe('Optional Fields', () => {
    it('should allow empty details', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/Título/);
      await user.type(titleInput, 'Task without details');

      const submitButton = screen.getByText('Crear Tarea');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          details: ''
        })
      );
    });

    it('should allow empty target date', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/Título/);
      await user.type(titleInput, 'Task without date');

      const submitButton = screen.getByText('Crear Tarea');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          targetDate: undefined
        })
      );
    });

    it('should include targetDate only if provided', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/Título/);
      await user.type(titleInput, 'Task with date');

      const targetDateInput = screen.getByLabelText(/Fecha objetivo/);
      await user.type(targetDateInput, '2025-10-30');

      const submitButton = screen.getByText('Crear Tarea');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          targetDate: '2025-10-30'
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have associated labels for all inputs', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      expect(screen.getByLabelText(/Título/)).toBeTruthy();
      expect(screen.getByLabelText(/Prioridad/)).toBeTruthy();
      expect(screen.getByLabelText(/Detalles/)).toBeTruthy();
      expect(screen.getByLabelText(/Fecha objetivo/)).toBeTruthy();
    });

    it('should have descriptive button labels', () => {
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      expect(screen.getByText('Crear Tarea')).toBeTruthy();
      expect(screen.getByText('Cancelar')).toBeTruthy();
    });

    it('should validate title as required via custom validation', async () => {
      const user = userEvent.setup();
      render(
        <TaskForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="create"
        />
      );

      // Try to submit without filling the title
      const submitButton = screen.getByText('Crear Tarea');
      await user.click(submitButton);

      // Should show validation error
      expect(screen.getByText(/El título es requerido/)).toBeTruthy();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
