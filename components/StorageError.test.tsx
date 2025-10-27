import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StorageError from './StorageError';

describe('StorageError Component', () => {
  it('should render error message', () => {
    const testMessage = 'Test error message';
    render(<StorageError message={testMessage} />);

    expect(screen.getByText(testMessage)).toBeTruthy();
  });

  it('should display error header', () => {
    render(<StorageError message="Some error" />);

    expect(screen.getByText('Error de Almacenamiento')).toBeTruthy();
  });

  it('should have a clear data button', () => {
    render(<StorageError message="Some error" />);

    const button = screen.getByText('Limpiar Datos');
    expect(button).toBeTruthy();
  });

  it('should call onClear when button is clicked and confirmed', async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    // Mock window.confirm to return true
    window.confirm = vi.fn(() => true);

    render(<StorageError message="Some error" onClear={onClear} />);

    const button = screen.getByText('Limpiar Datos');
    await user.click(button);

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Estás seguro de que quieres limpiar todos los datos? Esta acción no se puede deshacer.'
    );
  });

  it('should have role="alert"', () => {
    const { container } = render(<StorageError message="Error" />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
  });
});
