import React, { useState, useMemo } from 'react';
import { Task } from '../types';

interface CalendarProps {
  tasks: Task[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  groupBy: 'createdAt' | 'targetDate';
}

const Calendar: React.FC<CalendarProps> = ({
  tasks,
  selectedDate,
  onDateSelect,
  groupBy
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Group tasks by date
  const tasksGroupedByDate = useMemo(() => {
    const grouped = new Map<string, Task[]>();

    tasks.forEach(task => {
      const dateField = groupBy === 'createdAt' ? task.createdAt : task.targetDate;
      if (!dateField) return;

      // Extract date part (YYYY-MM-DD)
      const dateStr = dateField.split('T')[0];
      if (!grouped.has(dateStr)) {
        grouped.set(dateStr, []);
      }
      grouped.get(dateStr)!.push(task);
    });

    return grouped;
  }, [tasks, groupBy]);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Format date as YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Get today's date as YYYY-MM-DD
  const getTodayString = (): string => {
    const today = new Date();
    return formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    onDateSelect(getTodayString());
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const todayString = getTodayString();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          aria-label="Mes anterior"
        >
          ←
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">
            {monthNames[month]} {year}
          </h2>
        </div>

        <button
          onClick={handleNextMonth}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          aria-label="Próximo mes"
        >
          →
        </button>
      </div>

      {/* Today button */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={handleToday}
          className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Hoy
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center font-semibold text-gray-600 text-sm py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square"
              />
            );
          }

          const dateString = formatDateString(year, month, day);
          const dayTasks = tasksGroupedByDate.get(dateString) || [];
          const isToday = dateString === todayString;
          const isSelected = dateString === selectedDate;

          return (
            <button
              key={`day-${day}`}
              onClick={() => onDateSelect(dateString)}
              className={`
                aspect-square p-1 rounded text-sm relative
                transition-all duration-200
                ${isToday ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200'}
                ${isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-50'}
                flex flex-col items-center justify-start
              `}
              aria-label={`${day} de ${monthNames[month]}`}
              aria-pressed={isSelected}
            >
              <span className="font-semibold text-gray-800">{day}</span>
              {dayTasks.length > 0 && (
                <div className="mt-1">
                  {dayTasks.length === 1 ? (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  ) : (
                    <span className="inline-block bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {dayTasks.length > 9 ? '9+' : dayTasks.length}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>● = 1 tarea | Número = múltiples tareas</p>
      </div>
    </div>
  );
};

export default Calendar;
