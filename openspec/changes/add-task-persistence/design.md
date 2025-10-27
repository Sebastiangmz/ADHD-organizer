# Design Document: Task Persistence and Management

## Architecture Overview

This change introduces three major architectural additions:
1. **Persistence Layer**: LocalStorage service abstracting storage operations
2. **Calendar Component**: Monthly view with date-based task filtering
3. **Manual Editing UI**: Forms and modals for CRUD operations on tasks

## Data Model Changes

### Extended Task Interface
```typescript
export interface Task {
  id: string;
  title: string;
  priority: Priority;
  details?: string;
  subtasks: Subtask[];
  completed: boolean;
  createdAt: string; // ISO 8601 timestamp - NEW
  targetDate?: string; // ISO 8601 date (YYYY-MM-DD) - NEW
}
```

**Rationale**:
- `createdAt`: Automatic timestamp for historical tracking and calendar grouping
- `targetDate`: Optional user-assigned date for "when I plan to do this"
- ISO format ensures consistent serialization/deserialization with localStorage

## Storage Strategy

### LocalStorage Service (`services/storageService.ts`)

**Key Design Decisions**:
1. **Single key approach**: Store all tasks in one localStorage key `focusflow_tasks`
2. **JSON serialization**: Simple `JSON.stringify/parse` for Task array
3. **Error handling**: Try-catch around all operations with fallback to in-memory state
4. **Storage quota tracking**: Monitor usage and warn at 80% capacity

**API Surface**:
```typescript
export const storageService = {
  getTasks(): Task[]
  saveTasks(tasks: Task[]): void
  addTask(task: Task): void
  updateTask(taskId: string, updates: Partial<Task>): void
  deleteTask(taskId: string): void
  getStorageInfo(): { used: number; limit: number; percentage: number }
}
```

**Alternatives Considered**:
- IndexedDB: More complex API, overkill for current needs
- Individual keys per task: More localStorage operations, harder to manage
- SQLite via WASM: Adds bundle size, unnecessary for MVP

## Calendar Component Design

### Calendar UI (`components/Calendar.tsx`)

**Layout**:
```
┌─────────────────────────────────────┐
│  ← Octubre 2025 →                   │
├─────────────────────────────────────┤
│ Dom Lun Mar Mié Jue Vie Sáb        │
│         1   2   3   4   5   6      │
│  7   8   9  10  11  12  13          │
│ 14  15  16  17• 18  19  20          │  • = has tasks
│ 21  22  23  24  25  26  27          │
│ 28  29  30  31                      │
└─────────────────────────────────────┘
```

**State Management**:
- `currentMonth`: Date object for navigation
- `selectedDate`: Date | null for filtering view
- `tasksGroupedByDate`: Map<string, Task[]> computed from all tasks

**Interaction Flow**:
1. User clicks date with indicator dot
2. Calendar expands or sidebar shows filtered tasks for that date
3. User can click "today" button to return to current month/date

**Grouping Logic**:
- Group by `createdAt` date by default
- Allow toggle to group by `targetDate` instead
- Show count badges on dates with multiple tasks

## Manual Task Editing

### Task Creation Form (`components/TaskForm.tsx`)

**Fields**:
- Title (required)
- Priority dropdown (required, default: Media)
- Details (optional textarea)
- Target date picker (optional)
- Subtasks (dynamic list with add/remove buttons)

**Validation**:
- Title must be non-empty
- At least one subtask recommended (warn if empty, but allow)
- Target date cannot be in past (warning, not blocking)

### Inline Editing Approach

**Design Choice**: Edit in place vs. modal
- **Decision**: Use modal for full task editing
- **Rationale**: Cleaner UI, less clutter, better focus for ADHD users

**Modal Contents**:
- Same form as TaskForm but pre-populated
- "Save" commits changes to localStorage
- "Cancel" discards changes
- Delete button with confirmation

### Subtask Management

**Inline approach for subtasks**:
- Each subtask has tiny edit/delete icons on hover
- Click "+" button at bottom to add new subtask
- Immediate save to localStorage on each change

**Rationale**: Subtasks are simple enough to edit inline without modal

## State Synchronization

### React State ↔ LocalStorage

**Pattern**:
1. App.tsx maintains `tasks` state as source of truth for UI
2. All state changes trigger localStorage save via `useEffect`
3. On mount, hydrate state from localStorage

```typescript
// Hydration on mount
useEffect(() => {
  const stored = storageService.getTasks();
  setTasks(stored);
}, []);

// Sync to storage on change
useEffect(() => {
  if (tasks.length > 0 || /* some tasks were deleted */) {
    storageService.saveTasks(tasks);
  }
}, [tasks]);
```

**Edge Cases**:
- Empty array vs. uninitialized: Check flag in localStorage
- Corrupted data: Fall back to empty array, log error
- Quota exceeded: Show error, prevent new tasks until cleanup

## UI/UX Considerations

### Layout Changes

**Before**: Single column with recording + task list
**After**: Two-column or tabbed layout

**Option 1 - Tabs** (Recommended):
```
┌─────────────────────────────────┐
│ [Grabar] [Tareas] [Calendario]  │
├─────────────────────────────────┤
│                                 │
│  Tab content here               │
│                                 │
└─────────────────────────────────┘
```

**Option 2 - Split View**:
```
┌──────────────┬──────────────────┐
│              │                  │
│  Calendar    │  Tasks + Record  │
│              │                  │
└──────────────┴──────────────────┘
```

**Decision**: Tabs for mobile-first approach, cleaner on small screens

### Accessibility

- Calendar keyboard navigation (arrow keys)
- ARIA labels for date cells
- Screen reader announcements for task counts
- Focus management in modals

## Performance Considerations

### LocalStorage Limits
- Average task size: ~500 bytes (title, priority, 3 subtasks)
- 5MB limit ≈ 10,000 tasks (unrealistic for single user)
- Monitor at 1,000 tasks threshold, warn user

### Calendar Rendering
- Render only current month (7 rows × 7 cols = 49 cells)
- Memoize task grouping computation
- Virtualize task list if > 100 tasks per day (unlikely)

### State Updates
- Debounce localStorage writes if editing rapidly (e.g., typing in subtask)
- Use functional setState for task array mutations

## Migration Strategy

**Initial Launch**: No existing localStorage data
**Future Changes**:
- Add version field to stored data structure
- Implement migration functions for schema changes
- Keep migration utils in `services/migrations.ts`

## Error Handling

### LocalStorage Failures
- QuotaExceededError: Show friendly message, offer task cleanup
- SecurityError: Detect incognito/blocked storage, show warning
- Parse errors: Log, clear corrupted data, start fresh

### User Feedback
- Toast notifications for save success/failure
- Subtle indicators for auto-save status
- Clear error messages in Spanish

## Testing Strategy

### Manual Testing Checklist
- [ ] Create task via voice → appears in calendar on creation date
- [ ] Manually create task → saves to localStorage
- [ ] Refresh page → tasks persist
- [ ] Edit task title → changes save
- [ ] Add subtask → appears immediately
- [ ] Delete subtask → removes from storage
- [ ] Change priority → updates color coding
- [ ] Assign target date → task appears on that calendar date
- [ ] Fill localStorage to ~80% → warning appears
- [ ] Clear all tasks → calendar empty

### Future Automated Tests
- Unit tests for storageService methods
- Integration tests for persistence hooks
- E2E tests for full user workflows

## Open Questions
- ✅ Calendar view: Monthly (answered)
- ✅ Date handling: Both creation + target dates (answered)
- ✅ Edit capabilities: Subtasks, priority, manual creation (answered)
- ⚠️ Should completed tasks auto-archive after X days? (deferred to future)
- ⚠️ Export data as JSON backup? (deferred to future)
