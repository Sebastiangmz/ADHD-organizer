# FocusFlow AI - Manual Testing Checklist

**Phase**: 7.1 - Manual Testing Execution
**Status**: 🔄 IN PROGRESS
**Date Started**: 2025-10-27
**Estimated Duration**: 1-2 hours

---

## 📋 Test Plan Overview

This checklist validates all features work correctly before production deployment. Tests are organized by feature area with pass/fail columns.

**Legend**:
- ✅ = PASS
- ❌ = FAIL (report bug)
- 🟡 = PARTIAL (explain issue)
- ⏭️ = SKIP (explain why)

---

## 🎤 Feature 1: Voice Recording & AI Processing

### Recording Button & Transcription
- [ ] **1.1** - Microphone button is blue and clickable on page load
- [ ] **1.2** - Clicking microphone requests microphone permission from browser
- [ ] **1.3** - Permission granted → microphone button turns red
- [ ] **1.4** - Text appears below button as you speak
- [ ] **1.5** - Transcription shows in real-time (updates every 1-2 words)
- [ ] **1.6** - Stop button appears as red circle while recording
- [ ] **1.7** - Clicking red button stops recording
- [ ] **1.8** - "Escuchando..." message appears while recording
- [ ] **1.9** - "Escuchando..." message disappears when recording stops

### AI Task Organization
- [ ] **1.10** - After recording stops, loading spinner appears
- [ ] **1.11** - AI processes audio (2-5 seconds typical)
- [ ] **1.12** - Tasks appear in Tareas tab after processing
- [ ] **1.13** - Transcription text is cleared after creating tasks
- [ ] **1.14** - Tasks have correct title extracted from speech
- [ ] **1.15** - Tasks have default priority (Media)
- [ ] **1.16** - Each task gets createdAt timestamp
- [ ] **1.17** - Multiple tasks created in one session all appear
- [ ] **1.18** - Microphone can be used again after first recording

### Error Handling
- [ ] **1.19** - Deny microphone permission → error message appears
- [ ] **1.20** - Error message is in Spanish
- [ ] **1.21** - Very short audio (< 0.5s) → no tasks created (expected)
- [ ] **1.22** - Network error → error message displayed
- [ ] **1.23** - Can retry after error occurs

---

## ✅ Feature 2: Task Management (Tareas Tab)

### Task Display
- [ ] **2.1** - All tasks appear in Tareas tab
- [ ] **2.2** - Task title shows with correct text
- [ ] **2.3** - Priority badge shows (Alta/Media/Baja)
- [ ] **2.4** - Priority color matches:
  - [ ] Alta = Red background
  - [ ] Media = Yellow background
  - [ ] Baja = Green background
- [ ] **2.5** - Task details (if present) show below title
- [ ] **2.6** - Subtasks are hidden by default (chevron icon visible)
- [ ] **2.7** - Clicking chevron expands/collapses subtasks

### Task Completion
- [ ] **2.8** - Checkbox exists on left side of each task
- [ ] **2.9** - Clicking checkbox marks task complete
- [ ] **2.10** - Completed task shows strikethrough on title
- [ ] **2.11** - Completed task background turns gray
- [ ] **2.12** - Text color changes to gray when completed
- [ ] **2.13** - Unchecking marks task incomplete again
- [ ] **2.14** - Subtasks also have checkboxes
- [ ] **2.15** - Clicking subtask checkbox marks it complete
- [ ] **2.16** - Completing all subtasks auto-completes main task
- [ ] **2.17** - Uncompleting any subtask uncompletes main task

### Task Persistence
- [ ] **2.18** - Tasks persist after page refresh
- [ ] **2.19** - Task completion state persists
- [ ] **2.20** - Subtask completion state persists
- [ ] **2.21** - Task data shows in localStorage (DevTools)
- [ ] **2.22** - localStorage key is "focusflow_tasks"
- [ ] **2.23** - Data format is valid JSON

---

## 📝 Feature 3: Manual Task Creation

### Create Button & Form
- [ ] **3.1** - "+ Nueva Tarea" button visible in Tareas tab
- [ ] **3.2** - Clicking button opens modal/form overlay
- [ ] **3.3** - Form modal has title "Nueva Tarea"
- [ ] **3.4** - Modal has semi-transparent dark background
- [ ] **3.5** - Form can be closed by clicking cancel button
- [ ] **3.6** - Modal can't be closed by clicking background (modal focus)

### Form Fields
- [ ] **3.7** - Title field is required (asterisk shown)
- [ ] **3.8** - Title field has placeholder text
- [ ] **3.9** - Character counter shows below title (e.g., "0/200")
- [ ] **3.10** - Counter updates as you type
- [ ] **3.11** - Max 200 characters enforced
- [ ] **3.12** - Priority dropdown has three options (Alta/Media/Baja)
- [ ] **3.13** - Default priority is Media
- [ ] **3.14** - Details textarea is optional (no asterisk)
- [ ] **3.15** - Details placeholder suggests helpful text
- [ ] **3.16** - Date picker is optional
- [ ] **3.17** - Date picker shows native date picker on click
- [ ] **3.18** - Date format in picker is YYYY-MM-DD

### Form Validation
- [ ] **3.19** - Submitting with empty title shows error
- [ ] **3.20** - Error message is "El título es requerido"
- [ ] **3.21** - Error color is red
- [ ] **3.22** - Title with 200 chars allows submission
- [ ] **3.23** - Title with 201 chars shows error
- [ ] **3.24** - Can't submit with whitespace-only title

### Form Submission
- [ ] **3.25** - Clicking "Crear Tarea" creates task
- [ ] **3.26** - Modal closes after creation
- [ ] **3.27** - New task appears in task list immediately
- [ ] **3.28** - New task has correct title
- [ ] **3.29** - New task has selected priority
- [ ] **3.30** - New task has details (if filled)
- [ ] **3.31** - New task has target date (if selected)
- [ ] **3.32** - Task has auto-generated ID
- [ ] **3.33** - Task has createdAt timestamp (current date/time)
- [ ] **3.34** - New task persists in localStorage

### Subtasks in Form
- [ ] **3.35** - "+ Agregar Subtarea" button visible
- [ ] **3.36** - Clicking adds empty subtask input field
- [ ] **3.37** - Can add multiple subtasks
- [ ] **3.38** - Each subtask has "Eliminar" button
- [ ] **3.39** - Clicking Eliminar removes that subtask
- [ ] **3.40** - Subtask text can be entered
- [ ] **3.41** - Empty subtasks are not saved (filtered out)
- [ ] **3.42** - Can remove subtask after adding

---

## ✏️ Feature 4: Task Editing

### Edit Button & Form
- [ ] **4.1** - "Editar" button visible on each task
- [ ] **4.2** - Clicking Editar opens modal with "Editar Tarea" title
- [ ] **4.3** - Form fields are pre-filled with current task data
- [ ] **4.4** - Title field has current task title
- [ ] **4.5** - Priority dropdown shows current priority
- [ ] **4.6** - Details field has current details
- [ ] **4.7** - Date field shows current target date (if set)
- [ ] **4.8** - Subtasks list shows current subtasks

### Edit Submission
- [ ] **4.9** - Changing title and clicking "Guardar Cambios" updates task
- [ ] **4.10** - Updated title appears in task list immediately
- [ ] **4.11** - Changed priority updates badge color
- [ ] **4.12** - Changed details appear in task
- [ ] **4.13** - Changed date appears in task
- [ ] **4.14** - Modal closes after save
- [ ] **4.15** - Changes persist after page refresh

### Edit Cancel
- [ ] **4.16** - Clicking "Cancelar" closes modal without saving
- [ ] **4.17** - Changes are discarded (reverted to original)

---

## 🗑️ Feature 5: Task Deletion

### Delete Button & Confirmation
- [ ] **5.1** - "Eliminar" button visible on each task
- [ ] **5.2** - Clicking Eliminar shows confirmation dialog
- [ ] **5.3** - Dialog asks for confirmation in Spanish
- [ ] **5.4** - Dialog shows task title in message
- [ ] **5.5** - Dialog has "Confirmar" and "Cancelar" buttons

### Delete Confirmation
- [ ] **5.6** - Clicking "Cancelar" closes dialog, task remains
- [ ] **5.7** - Clicking confirmation deletes task
- [ ] **5.8** - Task disappears from list immediately
- [ ] **5.9** - Deleted task no longer in localStorage
- [ ] **5.10** - Deletion persists after page refresh
- [ ] **5.11** - Can't undo deletion (no undo button)

---

## 📅 Feature 6: Calendar View

### Calendar Display
- [ ] **6.1** - Calendar tab shows current month
- [ ] **6.2** - Month and year displayed (e.g., "Octubre 2025")
- [ ] **6.3** - Calendar grid is 7 columns (Sunday-Saturday)
- [ ] **6.4** - Day names show in Spanish (Dom, Lun, Mar, etc.)
- [ ] **6.5** - Empty cells at start of month (before 1st)
- [ ] **6.6** - All days of month displayed
- [ ] **6.7** - Today's date has blue border
- [ ] **6.8** - Empty cells at end of month are not clickable

### Calendar Navigation
- [ ] **6.9** - Left arrow button navigates to previous month
- [ ] **6.10** - Right arrow button navigates to next month
- [ ] **6.11** - "Hoy" button returns to current month
- [ ] **6.12** - Can navigate multiple months forward/backward
- [ ] **6.13** - All months show correct number of days

### Task Indicators
- [ ] **6.14** - Dates with 1 task show dot indicator (●)
- [ ] **6.15** - Dates with multiple tasks show count (2, 3, etc.)
- [ ] **6.16** - Dates with 10+ tasks show "9+" (capped at 9+)
- [ ] **6.17** - Indicator color is blue
- [ ] **6.18** - Dates without tasks have no indicator

### Date Selection & Filtering
- [ ] **6.19** - Clicking date shows tasks for that date below
- [ ] **6.20** - Selected date has blue background highlight
- [ ] **6.21** - Selecting different date updates task list
- [ ] **6.22** - Date header shows "Tareas de YYYY-MM-DD"
- [ ] **6.23** - Task list shows only tasks for selected date
- [ ] **6.24** - Task list is empty if no tasks on selected date
- [ ] **6.25** - Empty state message shows "No hay tareas para esta fecha"

### Grouping Toggle
- [ ] **6.26** - "Agrupar por" radio buttons visible
- [ ] **6.27** - "Fecha de Creación" is default selection
- [ ] **6.28** - Clicking "Fecha de Creación" shows by creation date
- [ ] **6.29** - Clicking "Fecha Objetivo" shows by target date
- [ ] **6.30** - Indicators update when toggling grouping
- [ ] **6.31** - Task filtering updates based on grouping mode

### Unscheduled Tasks (Target Date Mode)
- [ ] **6.32** - "Tareas Sin Fecha Asignada" section appears in target date mode
- [ ] **6.33** - Section doesn't appear in creation date mode
- [ ] **6.34** - Unscheduled tasks show with count
- [ ] **6.35** - "Todas las tareas tienen fecha asignada!" shows when all scheduled
- [ ] **6.36** - Success message has green styling

---

## 💾 Feature 7: Storage & Persistence

### Storage Indicator
- [ ] **7.1** - Storage indicator visible in Tareas tab
- [ ] **7.2** - Shows percentage (e.g., "25%")
- [ ] **7.3** - Progress bar matches percentage
- [ ] **7.4** - Color is green for <60%
- [ ] **7.5** - Color is orange for 60-79%
- [ ] **7.6** - Color is yellow for 80-89%
- [ ] **7.7** - Color is red for ≥90%
- [ ] **7.8** - Task count shows (e.g., "5 tareas guardadas")
- [ ] **7.9** - Singular form for 1 task ("1 tarea guardada")
- [ ] **7.10** - Bytes used and limit show (optional detail view)

### Storage Warnings
- [ ] **7.11** - No warning at <80% usage
- [ ] **7.12** - Warning appears at 80% usage
- [ ] **7.13** - Critical warning appears at 90% usage
- [ ] **7.14** - Warning messages are in Spanish
- [ ] **7.15** - Warning suggests deleting tasks

### Storage Errors
- [ ] **7.16** - StorageError component appears on quota exceeded
- [ ] **7.17** - Error message is user-friendly
- [ ] **7.18** - "Limpiar Datos" button shows confirmation dialog
- [ ] **7.19** - Confirming clears all tasks
- [ ] **7.20** - All tasks deleted, list becomes empty
- [ ] **7.21** - Error dismisses after clearing data

### localStorage Integrity
- [ ] **7.22** - Can store 100+ tasks without errors
- [ ] **7.23** - Data survives browser restart
- [ ] **7.24** - Data survives tab close/reopen
- [ ] **7.25** - Corrupted localStorage handled gracefully
- [ ] **7.26** - Invalid JSON returns empty list (no crash)

---

## 🎨 Feature 8: UI/UX & Accessibility

### Layout & Navigation
- [ ] **8.1** - Header shows "FocusFlow AI" title
- [ ] **8.2** - Subtitle in header explains purpose
- [ ] **8.3** - Three tabs visible: Grabar, Tareas, Calendario
- [ ] **8.4** - Active tab has blue text and underline
- [ ] **8.5** - Inactive tabs have gray text
- [ ] **8.6** - Clicking tab switches content
- [ ] **8.7** - Tab state changes visible immediately

### Responsive Design
- [ ] **8.8** - Layout works on desktop (1920px+)
- [ ] **8.9** - Layout works on tablet (768px)
- [ ] **8.10** - Layout works on mobile (375px)
- [ ] **8.11** - No horizontal scrolling needed
- [ ] **8.12** - Touch targets are ≥44px (mobile)
- [ ] **8.13** - Buttons are easily clickable on mobile
- [ ] **8.14** - Text is readable at all sizes

### Accessibility
- [ ] **8.15** - All buttons have clear labels
- [ ] **8.16** - Forms have associated labels
- [ ] **8.17** - Error messages are announced
- [ ] **8.18** - Can tab through all interactive elements
- [ ] **8.19** - Can use keyboard to navigate calendar
- [ ] **8.20** - Can submit forms with Enter key
- [ ] **8.21** - Modals focus on form (not background)
- [ ] **8.22** - Modals can be closed with Escape key (optional)

### Spanish Localization
- [ ] **8.23** - All UI text is in Spanish
- [ ] **8.24** - Error messages are in Spanish
- [ ] **8.25** - Date format is Spanish-appropriate
- [ ] **8.26** - Month names are Spanish (Enero, Febrero, etc.)
- [ ] **8.27** - Day names are Spanish (Lun, Mar, Mié, etc.)
- [ ] **8.28** - Pluralization is correct in Spanish
- [ ] **8.29** - No English text in UI (except maybe links)

### Colors & Visual Hierarchy
- [ ] **8.30** - Important elements are prominent
- [ ] **8.31** - Colors match design (blue, red, yellow, green)
- [ ] **8.32** - Error states are clearly visible (red)
- [ ] **8.33** - Success states are clearly visible (green)
- [ ] **8.34** - Disabled buttons appear grayed out
- [ ] **8.35** - Hover states are visible on buttons

---

## ⚡ Feature 9: Performance

### Load Time
- [ ] **9.1** - Page loads in <2 seconds (first visit)
- [ ] **9.2** - Page loads in <1 second (cached)
- [ ] **9.3** - No blank screen or layout shift

### Interaction Responsiveness
- [ ] **9.4** - Buttons respond instantly to click
- [ ] **9.5** - Task completion marks immediately
- [ ] **9.6** - Checkbox feedback is instant
- [ ] **9.7** - Tab switching is instant
- [ ] **9.8** - Calendar navigation is instant
- [ ] **9.9** - No lag when typing in forms

### Data Operations
- [ ] **9.10** - Creating task takes <50ms
- [ ] **9.11** - Editing task takes <50ms
- [ ] **9.12** - Deleting task takes <50ms
- [ ] **9.13** - Calendar render takes <200ms
- [ ] **9.14** - localStorage save takes <100ms

### Browser Performance
- [ ] **9.15** - No console errors
- [ ] **9.16** - No console warnings (except expected)
- [ ] **9.17** - Memory usage is stable (no leaks)
- [ ] **9.18** - CPU usage is low at idle

---

## 🌐 Feature 10: Browser Compatibility

### Chrome/Chromium
- [ ] **10.1** - Works on Chrome 90+
- [ ] **10.2** - Microphone works
- [ ] **10.3** - All features functional
- [ ] **10.4** - No console errors

### Firefox
- [ ] **10.5** - Works on Firefox 88+
- [ ] **10.6** - Microphone works
- [ ] **10.7** - All features functional
- [ ] **10.8** - No console errors

### Safari
- [ ] **10.9** - Works on Safari 14+
- [ ] **10.10** - Microphone works (may need permission)
- [ ] **10.11** - All features functional
- [ ] **10.12** - No console errors

### Edge
- [ ] **10.13** - Works on Edge 90+
- [ ] **10.14** - Microphone works
- [ ] **10.15** - All features functional
- [ ] **10.16** - No console errors

### Mobile Browsers
- [ ] **10.17** - Works on iOS Safari
- [ ] **10.18** - Works on Chrome Mobile
- [ ] **10.19** - Responsive layout on mobile
- [ ] **10.20** - Microphone permission works on mobile

---

## 🔒 Feature 11: Security & Data

### Data Privacy
- [ ] **11.1** - No personal data sent to third parties (except Google)
- [ ] **11.2** - Data stays in browser (localStorage only)
- [ ] **11.3** - No analytics/tracking on page
- [ ] **11.4** - No cookies set (except what browser needs)
- [ ] **11.5** - Can clear all data with button

### Input Validation
- [ ] **11.6** - Title input validates length
- [ ] **11.7** - Special characters allowed in text
- [ ] **11.8** - No XSS vulnerability (sanitized output)
- [ ] **11.9** - Form rejects invalid dates

### Error Handling
- [ ] **11.10** - No sensitive data in error messages
- [ ] **11.11** - Error messages don't expose system details
- [ ] **11.12** - All errors handled gracefully

---

## 📝 Test Execution Notes

### Summary
**Total Test Cases**: 156
**Passed**: ___
**Failed**: ___
**Skipped**: ___
**Pass Rate**: ___%

### Issues Found
_(List any bugs or issues discovered)_

1. **Issue #1**: [Description]
   - Severity: Low/Medium/High
   - Steps to reproduce: [Steps]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]

2. **Issue #2**: [Description]
   - Severity: Low/Medium/High
   - Steps to reproduce: [Steps]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]

### Recommendations
- [Any recommendations for improvements]
- [Any features that need refinement]
- [Any documentation updates needed]

---

## 👤 Tester Information

- **Tester Name**: _______________
- **Date Tested**: 2025-10-27
- **Browser(s) Tested**: _______________
- **Device(s) Tested**: _______________
- **OS Version(s)**: _______________

---

## ✅ Final Sign-Off

- [ ] All critical features tested
- [ ] All major bugs identified and noted
- [ ] Application ready for production
- [ ] Documentation is accurate
- [ ] Performance is acceptable

**Tested By**: _______________
**Date**: _______________
**Approved For Release**: Yes / No

---

*Last Updated: 2025-10-27*
*Phase 7.1: Manual Testing Checklist*
