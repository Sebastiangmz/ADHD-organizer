import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calendar from './Calendar';
import { Task, Priority } from '../types';

describe('Calendar Component', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    priority: Priority.MEDIA,
    details: '',
    subtasks: [],
    completed: false,
    createdAt: '2025-10-26T10:00:00Z',
    targetDate: undefined
  };

  const mockTask2: Task = {
    id: '2',
    title: 'Another Task',
    priority: Priority.ALTA,
    details: '',
    subtasks: [],
    completed: false,
    createdAt: '2025-10-26T14:00:00Z',
    targetDate: '2025-10-28'
  };

  it('should render calendar with current month', () => {
    const onDateSelect = vi.fn();
    render(
      <Calendar
        tasks={[]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    // Check if month/year is displayed
    const monthYear = screen.getByText(/Octubre 2025/);
    expect(monthYear).toBeTruthy();
  });

  it('should render day names', () => {
    const onDateSelect = vi.fn();
    render(
      <Calendar
        tasks={[]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    expect(screen.getByText('Dom')).toBeTruthy();
    expect(screen.getByText('Lun')).toBeTruthy();
    expect(screen.getByText('Vie')).toBeTruthy();
  });

  it('should call onDateSelect when date is clicked', async () => {
    const user = userEvent.setup();
    const onDateSelect = vi.fn();

    render(
      <Calendar
        tasks={[]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    const dateButton = screen.getByText('26');
    await user.click(dateButton);

    expect(onDateSelect).toHaveBeenCalledWith('2025-10-26');
  });

  it('should show task indicators for dates with tasks', () => {
    const onDateSelect = vi.fn();

    const { container } = render(
      <Calendar
        tasks={[mockTask]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    // Task created on 2025-10-26, should show dot indicator
    // Find button containing "26"
    const buttons = Array.from(container.querySelectorAll('button'));
    const dateButton = buttons.find(btn => btn.textContent?.includes('26'));
    expect(dateButton).toBeTruthy();

    // Check for dot indicator inside the button
    const dot = dateButton?.querySelector('.rounded-full');
    expect(dot).toBeTruthy();
  });

  it('should show count badge for multiple tasks on same day', () => {
    const onDateSelect = vi.fn();
    const tasksOnSameDay: Task[] = [
      { ...mockTask, id: '1', createdAt: '2025-10-26T10:00:00Z' },
      { ...mockTask, id: '2', createdAt: '2025-10-26T11:00:00Z' },
      { ...mockTask, id: '3', createdAt: '2025-10-26T12:00:00Z' }
    ];

    const { container } = render(
      <Calendar
        tasks={tasksOnSameDay}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    // Should show number "3"
    const buttons = Array.from(container.querySelectorAll('button'));
    const dateButton = buttons.find(btn => btn.textContent?.includes('26'));
    expect(dateButton?.textContent).toContain('3');
  });

  it('should navigate to previous month', async () => {
    const user = userEvent.setup();
    const onDateSelect = vi.fn();

    render(
      <Calendar
        tasks={[]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    const prevButton = screen.getByLabelText('Mes anterior');
    await user.click(prevButton);

    // Should now show September
    const monthYear = screen.getByText(/Septiembre 2025/);
    expect(monthYear).toBeTruthy();
  });

  it('should navigate to next month', async () => {
    const user = userEvent.setup();
    const onDateSelect = vi.fn();

    render(
      <Calendar
        tasks={[]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    const nextButton = screen.getByLabelText('Próximo mes');
    await user.click(nextButton);

    // Should now show November
    const monthYear = screen.getByText(/Noviembre 2025/);
    expect(monthYear).toBeTruthy();
  });

  it('should go to today when today button is clicked', async () => {
    const user = userEvent.setup();
    const onDateSelect = vi.fn();

    render(
      <Calendar
        tasks={[]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    // Navigate away first
    const nextButton = screen.getByLabelText('Próximo mes');
    await user.click(nextButton);

    // Then click today
    const todayButton = screen.getByText('Hoy');
    await user.click(todayButton);

    // Should show October again (current month at test time)
    const monthYear = screen.getByText(/Octubre 2025/);
    expect(monthYear).toBeTruthy();
  });

  it('should group tasks by createdAt by default', () => {
    const onDateSelect = vi.fn();
    const taskCreatedOct26 = { ...mockTask, createdAt: '2025-10-26T10:00:00Z', targetDate: '2025-10-28' };

    const { container } = render(
      <Calendar
        tasks={[taskCreatedOct26]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    // Should show indicator on Oct 26 (creation date), not Oct 28 (target date)
    const buttons = Array.from(container.querySelectorAll('button'));
    const oct26Button = buttons.find(btn => btn.textContent?.includes('26'));
    expect(oct26Button?.querySelector('.rounded-full')).toBeTruthy();
  });

  it('should group tasks by targetDate when specified', () => {
    const onDateSelect = vi.fn();
    const taskWithTargetDate = { ...mockTask2, createdAt: '2025-10-25T10:00:00Z', targetDate: '2025-10-28' };

    const { container } = render(
      <Calendar
        tasks={[taskWithTargetDate]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="targetDate"
      />
    );

    // Should show indicator on Oct 28 (target date), not Oct 25 (creation date)
    const buttons = Array.from(container.querySelectorAll('button'));
    const oct28Button = buttons.find(btn => btn.textContent?.includes('28'));
    expect(oct28Button?.querySelector('.rounded-full')).toBeTruthy();

    // Oct 25 should not have indicator
    const oct25Button = buttons.find(btn => btn.textContent?.includes('25'));
    expect(oct25Button?.querySelector('.rounded-full')).toBeFalsy();
  });

  it('should highlight selected date', () => {
    const onDateSelect = vi.fn();

    const { container } = render(
      <Calendar
        tasks={[]}
        selectedDate="2025-10-26"
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    // Get the button with aria-pressed attribute
    const dateButton = container.querySelector('button[aria-pressed="true"]');
    expect(dateButton?.className).toContain('bg-blue-100');
    expect(dateButton?.className).toContain('ring-2');
  });

  it('should have today highlighted with border', () => {
    const onDateSelect = vi.fn();

    const { container } = render(
      <Calendar
        tasks={[]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="createdAt"
      />
    );

    // Today is Oct 26 (mocked date) - find button with border-blue-500
    const todayButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.className.includes('border-blue-500')
    );
    expect(todayButton?.className).toContain('border-blue-500');
  });

  it('should not show task indicator for tasks without date field', () => {
    const onDateSelect = vi.fn();
    const taskWithoutTargetDate = { ...mockTask, targetDate: undefined };

    render(
      <Calendar
        tasks={[taskWithoutTargetDate]}
        selectedDate={null}
        onDateSelect={onDateSelect}
        groupBy="targetDate"
      />
    );

    // No dates should have indicator since task has no targetDate
    const dateButtons = screen.getAllByRole('button').filter(btn => {
      const text = btn.textContent;
      return text && /^\d+$/.test(text);
    });

    dateButtons.forEach(btn => {
      expect(btn.querySelector('.rounded-full')).toBeFalsy();
    });
  });
});
