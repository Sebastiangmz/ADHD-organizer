# Capability: Task Persistence

## ADDED Requirements

### Requirement: Tasks SHALL persist across browser sessions
**ID**: PERSIST-001
**Priority**: Critical

Tasks created through voice input or manual creation MUST be saved to browser localStorage and restored when the application reloads.

#### Scenario: User refreshes page after creating tasks
**Given** the user has created 3 tasks via voice recording
**When** the user refreshes the browser page (F5)
**Then** all 3 tasks should appear in the task list with correct titles, priorities, subtasks, and completion states

#### Scenario: User closes and reopens browser
**Given** the user has active tasks in the application
**And** the user closes all browser windows
**When** the user opens the application URL again
**Then** all previously created tasks should be restored exactly as they were

---

### Requirement: Task data model SHALL include timestamps
**ID**: PERSIST-002
**Priority**: Critical

Each task MUST store a creation timestamp and optional target date for calendar organization.

#### Scenario: AI creates task from voice input
**Given** the user records voice input at 2025-10-26T14:30:00Z
**When** the AI generates tasks from the transcription
**Then** each task should have `createdAt` set to "2025-10-26T14:30:00Z"
**And** `targetDate` should be `undefined` unless user specifies a date

#### Scenario: User manually creates task with target date
**Given** the user opens the manual task creation form
**When** the user fills in title, priority, and selects target date "2025-10-30"
**Then** the saved task should have `createdAt` as current timestamp
**And** `targetDate` should be "2025-10-30"

---

### Requirement: Storage service SHALL handle quota limits gracefully
**ID**: PERSIST-003
**Priority**: High

The application MUST detect localStorage quota limits and prevent data loss when approaching capacity.

#### Scenario: User approaches 80% storage capacity
**Given** the user has stored tasks using 4MB of the 5MB localStorage quota
**When** the application checks storage on load or after task creation
**Then** a warning message should appear: "Tu almacenamiento está casi lleno (80%). Considera archivar o eliminar tareas antiguas."

#### Scenario: User exceeds storage quota
**Given** localStorage is at full capacity
**When** the user attempts to create a new task
**Then** the application should show error: "No se puede guardar la tarea. El almacenamiento está lleno."
**And** the task should not be lost from React state (kept in memory)
**And** the user should be prompted to delete old tasks

---

### Requirement: Corrupted storage data SHALL NOT crash the application
**ID**: PERSIST-004
**Priority**: High

If localStorage contains invalid JSON or incompatible data structures, the application MUST recover gracefully.

#### Scenario: LocalStorage contains malformed JSON
**Given** localStorage key `focusflow_tasks` contains invalid JSON string
**When** the application attempts to load tasks on startup
**Then** an error should be logged to console
**And** the corrupted data should be cleared
**And** the user should see an empty task list with message: "No se pudieron cargar las tareas guardadas. Comenzando de nuevo."

#### Scenario: Stored task is missing required fields
**Given** localStorage contains a task object without `id` or `title` field
**When** the application loads and validates tasks
**Then** the invalid task should be filtered out
**And** a console warning should be logged
**And** valid tasks should still load correctly

---

### Requirement: Storage operations SHALL be synchronous with UI state
**ID**: PERSIST-005
**Priority**: High

All task modifications in the UI MUST immediately sync to localStorage to prevent data loss.

#### Scenario: User completes a subtask
**Given** a task with 3 incomplete subtasks is displayed
**When** the user checks the checkbox for subtask #2
**Then** the subtask completion state should update in React state
**And** the updated task should be saved to localStorage within 100ms
**And** if localStorage save fails, an error notification should appear

#### Scenario: User edits task while offline
**Given** the browser has localStorage access but no internet connection
**When** the user edits a task title
**Then** the change should save to localStorage successfully
**And** the task should update in the UI immediately
**Note**: localStorage works offline, unlike cloud storage

---

### Requirement: Storage service SHALL provide usage statistics
**ID**: PERSIST-006
**Priority**: Medium

Users MUST be able to see how much storage space their tasks are consuming.

#### Scenario: User views storage info in settings
**Given** the user has 50 tasks stored
**When** the user opens a storage info panel (or it displays automatically)
**Then** the panel should show "Usando 245 KB de 5 MB (4.9%)"
**And** the number of stored tasks: "50 tareas guardadas"

#### Scenario: Storage percentage displayed with visual indicator
**Given** storage is at 65% capacity
**When** storage info is rendered
**Then** a progress bar should show 65% filled
**And** the bar color should be yellow (warning color for >50%)
**And** color should be red if >80%
