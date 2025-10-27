# Capability: Manual Task Editing

## ADDED Requirements

### Requirement: Users SHALL be able to create tasks manually without AI
**ID**: EDIT-001
**Priority**: High

A form MUST allow users to create new tasks by typing directly, bypassing voice recording and AI organization.

#### Scenario: User creates basic task with required fields
**Given** the user clicks "Nueva Tarea" button
**When** the user fills in title "Comprar leche" and selects priority "Alta"
**And** the user clicks "Guardar"
**Then** a new task should be created with the entered title and priority
**And** the task should have an auto-generated unique ID
**And** the task should have `createdAt` set to current timestamp
**And** the task should appear in the task list immediately
**And** the task should be saved to localStorage

#### Scenario: User creates task with all optional fields
**Given** the user opens the task creation form
**When** the user enters:
  - Title: "Preparar presentación"
  - Priority: "Media"
  - Details: "Para reunión del equipo el viernes"
  - Target date: "2025-10-30"
  - Subtasks: ["Crear slides", "Ensayar"]
**And** clicks "Guardar"
**Then** all fields should be saved correctly
**And** the task should have 2 subtasks with auto-generated IDs
**And** `targetDate` should be "2025-10-30"

#### Scenario: User attempts to save task with empty title
**Given** the user opens the task creation form
**When** the user leaves title blank and clicks "Guardar"
**Then** a validation error should appear: "El título es obligatorio"
**And** the form should not submit
**And** the title field should be highlighted in red

---

### Requirement: Users SHALL be able to add and remove subtasks
**ID**: EDIT-002
**Priority**: High

Existing tasks MUST support inline addition and deletion of subtasks.

#### Scenario: User adds subtask to existing task
**Given** a task "Organizar escritorio" is displayed with 2 subtasks
**When** the user clicks the "+ Agregar subtarea" button on that task
**And** enters "Limpiar monitor" in the new subtask field
**And** presses Enter or clicks save icon
**Then** a third subtask "Limpiar monitor" should appear
**And** the subtask should have a unique ID and `completed: false`
**And** the updated task should be saved to localStorage

#### Scenario: User deletes subtask
**Given** a task has 3 subtasks
**When** the user hovers over subtask #2 "Guardar documentos"
**And** clicks the delete icon (trash/X)
**Then** a confirmation prompt should appear: "¿Eliminar esta subtarea?"
**When** the user confirms
**Then** the subtask should be removed from the task
**And** the remaining subtasks should reorder visually
**And** the change should persist to localStorage

#### Scenario: User deletes last subtask
**Given** a task has only 1 subtask
**When** the user deletes that subtask
**Then** the task should have an empty subtasks array
**And** the task should still exist and be valid
**And** no auto-completion should occur (task remains incomplete if it was)

---

### Requirement: Users SHALL be able to change task priority
**ID**: EDIT-003
**Priority**: High

Task priority (Alta/Media/Baja) MUST be editable after creation.

#### Scenario: User changes priority via dropdown
**Given** a task "Llamar al doctor" has priority "Media"
**When** the user clicks the priority badge or edit button
**And** selects "Alta" from the priority dropdown
**And** saves the change
**Then** the task priority should update to "Alta"
**And** the priority badge color should change to red (alta color)
**And** the change should persist to localStorage

#### Scenario: User changes priority in edit modal
**Given** the user opens the full edit modal for a task
**When** the user changes priority from "Baja" to "Alta"
**And** clicks "Guardar cambios"
**Then** the priority should update in the task list
**And** the modal should close
**And** the task should be saved to localStorage

---

### Requirement: Users SHALL be able to edit task title and details
**ID**: EDIT-004
**Priority**: Medium

Task title and details fields MUST be editable without recreating the task.

#### Scenario: User edits task title
**Given** a task titled "Revisar correo" exists
**When** the user clicks edit button and opens the task modal
**And** changes the title to "Revisar correos importantes"
**And** clicks "Guardar"
**Then** the task title should update in the task list
**And** the task ID should remain unchanged
**And** all other task properties (priority, subtasks, dates) should remain unchanged
**And** the change should persist to localStorage

#### Scenario: User adds details to task without details
**Given** a task has no details (details field is undefined)
**When** the user opens the edit modal
**And** adds details text: "Enfocarse en clientes VIP"
**And** saves
**Then** the task should now have details property set
**And** the details should be visible when task is expanded

---

### Requirement: Users SHALL be able to assign or change target dates
**ID**: EDIT-005
**Priority**: Medium

Tasks MUST support setting and updating the target date (when user plans to do the task).

#### Scenario: User assigns target date to task created without one
**Given** a task created via voice input has no target date
**When** the user opens the edit modal
**And** selects target date "2025-11-05" from date picker
**And** saves
**Then** the task `targetDate` should be set to "2025-11-05"
**And** the task should appear on Nov 5 in calendar's target date view

#### Scenario: User changes existing target date
**Given** a task has target date "2025-10-28"
**When** the user edits the task and changes target date to "2025-10-30"
**And** saves
**Then** the task should update to show new target date
**And** the calendar should reflect the change (task moves to Oct 30)

#### Scenario: User removes target date
**Given** a task has target date "2025-10-28"
**When** the user opens edit modal and clears the date picker
**And** saves
**Then** the task `targetDate` should be set to `undefined`
**And** the task should no longer appear in any specific date in target view
**And** it should appear in "Sin Fecha Asignada" section

---

### Requirement: Users SHALL be able to delete entire tasks
**ID**: EDIT-006
**Priority**: Medium

Users MUST be able to permanently remove tasks they no longer need.

#### Scenario: User deletes task from edit modal
**Given** a task is displayed in the task list
**When** the user opens the edit modal
**And** clicks "Eliminar Tarea" button
**Then** a confirmation dialog should appear: "¿Estás seguro? Esta acción no se puede deshacer."
**When** the user confirms
**Then** the task should be removed from the task list
**And** the task should be deleted from localStorage
**And** the modal should close
**And** a success message should appear: "Tarea eliminada"

#### Scenario: User cancels task deletion
**Given** the user initiates task deletion
**When** the confirmation dialog appears
**And** the user clicks "Cancelar"
**Then** the task should remain in the list
**And** the modal should remain open
**And** no changes should be made to localStorage

---

### Requirement: Edit operations SHALL preserve task completion state
**ID**: EDIT-007
**Priority**: Medium

When editing a task, its completion status and subtask completion states MUST NOT be affected unless explicitly changed.

#### Scenario: User edits completed task
**Given** a task is marked as completed (all subtasks done)
**When** the user edits the task title
**And** saves
**Then** the task should remain marked as completed
**And** all subtasks should remain completed

#### Scenario: User adds subtask to completed task
**Given** a task is marked as completed with 2 completed subtasks
**When** the user adds a new subtask "Extra step"
**Then** the new subtask should have `completed: false`
**And** the main task should automatically become incomplete (per existing auto-completion logic)
**And** the original 2 subtasks should remain completed

---

### Requirement: Manual editing UI SHALL validate input
**ID**: EDIT-008
**Priority**: Medium

All user input in task creation and editing forms MUST be validated to prevent invalid data.

#### Scenario: Title exceeds reasonable length
**Given** the user is creating or editing a task
**When** the user enters a title longer than 200 characters
**Then** a warning should appear: "El título es muy largo (máx. 200 caracteres)"
**And** the save button should be disabled

#### Scenario: Subtask text is empty
**Given** the user clicks "+ Agregar subtarea"
**When** the user tries to save without entering text
**Then** the empty subtask should not be added
**And** a validation message should appear: "La subtarea no puede estar vacía"

#### Scenario: Target date is in the past
**Given** today is Oct 26, 2025
**When** the user sets target date to "2025-10-20" (past date)
**Then** a warning should appear: "⚠️ Esta fecha ya pasó"
**And** the save should still be allowed (warning only, not blocking)
