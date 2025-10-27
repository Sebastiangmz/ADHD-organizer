# Add Task Persistence and Management Features

## Summary
Implement localStorage-based persistence for tasks, add a monthly calendar view to visualize tasks by day, and enable manual task editing capabilities (add/remove subtasks, change priorities, create new tasks).

## Why
Currently, all tasks exist only in React state and are lost on page refresh. For ADHD users, losing their organized tasks is particularly frustrating and defeats the purpose of the app. This change adds:

1. **Persistence**: Tasks survive page refreshes and browser restarts
2. **Calendar View**: Visual organization to see when tasks were created and planned
3. **Manual Editing**: Flexibility to adjust AI-generated tasks without re-recording

## Scope

### In Scope
- LocalStorage service for CRUD operations on tasks
- Extended Task model with `createdAt` and `targetDate` timestamps
- Monthly calendar UI component showing tasks by date
- Manual task creation form (without AI)
- Edit capabilities for subtasks and priority
- Date assignment for tasks (when user wants to do them)

### Out of Scope
- Cloud synchronization or multi-device support
- Task reminders or notifications
- Recurring tasks
- Task sharing or collaboration
- Migration to database (future consideration)
- Export/import functionality

## User Impact
- **Positive**: Users can now refresh the page without losing work, see task history, manually adjust tasks, and plan ahead with calendar view
- **Neutral**: Slightly more complex UI with calendar and edit buttons
- **Risk**: LocalStorage has ~5-10MB limit; heavy users might hit this (mitigated by providing clear storage info)

## Implementation Approach
1. Extend type definitions for timestamps
2. Create localStorage service module
3. Build calendar component with date navigation
4. Add manual task creation UI
5. Implement edit modals/forms for existing tasks
6. Wire up persistence hooks in App.tsx
7. Add storage usage indicators

## Success Criteria
- [ ] Tasks persist across page refreshes
- [ ] Calendar displays tasks correctly by creation date
- [ ] Users can assign target dates to tasks
- [ ] Users can create tasks manually without voice input
- [ ] Users can add/remove subtasks on existing tasks
- [ ] Users can change task priorities
- [ ] LocalStorage stays under 5MB with clear warnings approaching limit
- [ ] All existing functionality (voice recording, AI organization) still works

## Dependencies
None - pure client-side feature using browser APIs

## Related Changes
None (first OpenSpec change for this project)
