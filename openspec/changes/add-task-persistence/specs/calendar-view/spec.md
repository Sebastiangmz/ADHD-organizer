# Capability: Calendar View

## ADDED Requirements

### Requirement: Monthly calendar SHALL display task indicators
**ID**: CALENDAR-001
**Priority**: High

A calendar component MUST show a visual indicator (dot/badge) on dates that have tasks associated with them.

#### Scenario: User views calendar for current month
**Given** the user has tasks created on Oct 15, Oct 17, and Oct 20
**When** the calendar renders for October 2025
**Then** dates 15, 17, and 20 should display a visual indicator (colored dot)
**And** other dates should have no indicator
**And** the calendar should show day names (Dom, Lun, Mar, etc.)

#### Scenario: Date with multiple tasks shows count badge
**Given** the user has 5 tasks created on Oct 26
**When** the calendar renders October 2025
**Then** date 26 should display a badge with number "5"
**And** the badge should be visually distinct from single-task indicators

---

### Requirement: Calendar SHALL support month navigation
**ID**: CALENDAR-002
**Priority**: High

Users MUST be able to navigate between months to view tasks from past and future dates.

#### Scenario: User navigates to previous month
**Given** the calendar is showing October 2025
**When** the user clicks the left arrow button
**Then** the calendar should display September 2025
**And** task indicators should update to show September's tasks

#### Scenario: User navigates to future month
**Given** the calendar is showing October 2025
**When** the user clicks the right arrow button
**Then** the calendar should display November 2025
**And** task indicators should reflect November's tasks (if any)

#### Scenario: User returns to current month with today button
**Given** the calendar is showing March 2024 (past month)
**When** the user clicks the "Hoy" (Today) button
**Then** the calendar should jump to October 2025 (current month)
**And** today's date should be visually highlighted

---

### Requirement: Clicking a date SHALL filter and display its tasks
**ID**: CALENDAR-003
**Priority**: High

When a user clicks a date on the calendar, the application MUST show all tasks associated with that date.

#### Scenario: User clicks date with tasks created that day
**Given** the calendar shows October 2025
**And** 3 tasks were created on Oct 15
**When** the user clicks on date 15
**Then** a task list should appear showing those 3 tasks
**And** the task list header should read "Tareas del 15 de Octubre"
**And** the selected date should be visually highlighted on calendar

#### Scenario: User clicks date with no tasks
**Given** the calendar shows October 2025
**And** no tasks exist for Oct 10
**When** the user clicks on date 10
**Then** an empty state message should appear: "No hay tareas para este día"
**And** the date should still be highlighted as selected

---

### Requirement: Calendar SHALL support both creation and target date grouping
**ID**: CALENDAR-004
**Priority**: Medium

Users MUST be able to toggle between viewing tasks by creation date vs. target date.

#### Scenario: User views tasks grouped by creation date (default)
**Given** a task was created on Oct 15 with target date Oct 20
**When** the calendar is in "Fecha de Creación" mode
**Then** the task should appear under Oct 15 when that date is selected
**And** Oct 15 should have a task indicator
**And** Oct 20 should have no indicator for this task

#### Scenario: User switches to target date view
**Given** the calendar is in "Fecha de Creación" mode
**And** a task with target date Oct 20 exists
**When** the user toggles to "Fecha Objetivo" mode
**Then** the calendar indicators should update
**And** the task should now appear under Oct 20 when selected
**And** Oct 20 should show a task indicator

#### Scenario: Task with no target date in target view
**Given** a task was created on Oct 15 with no target date
**When** calendar is in "Fecha Objetivo" mode
**Then** the task should not appear in any date's filtered view
**And** it should appear in an "Sin Fecha Asignada" section

---

### Requirement: Calendar SHALL be responsive and accessible
**ID**: CALENDAR-005
**Priority**: Medium

The calendar component MUST work on mobile devices and be keyboard-navigable.

#### Scenario: User views calendar on mobile device
**Given** the user opens the app on a 375px wide screen (mobile)
**When** the calendar renders
**Then** all 7 day columns should be visible without horizontal scroll
**And** date cells should be tappable (min 44px touch target)
**And** task indicators should be clearly visible

#### Scenario: User navigates calendar with keyboard
**Given** the calendar is focused
**When** the user presses the Right Arrow key
**Then** focus should move to the next date
**When** the user presses Enter on a focused date
**Then** that date's tasks should be displayed
**When** the user presses Tab
**Then** focus should move to the month navigation buttons

---

### Requirement: Calendar SHALL highlight today's date
**ID**: CALENDAR-006
**Priority**: Low

The current date MUST be visually distinguished from other dates for orientation.

#### Scenario: User views calendar containing today
**Given** today is October 26, 2025
**When** the calendar renders October 2025
**Then** date 26 should have a distinct visual style (e.g., border or background color)
**And** the highlight should be visible even if the date has task indicators

#### Scenario: User views calendar for different month than today
**Given** today is October 26, 2025
**When** the user navigates to November 2025
**Then** no date should be highlighted as "today"
**And** all dates should use the standard styling
