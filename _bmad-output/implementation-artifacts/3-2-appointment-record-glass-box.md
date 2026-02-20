# Story 3.2: Appointment Record Glass Box

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want a specific form to log my doctor appointments,
So that I can capture the exact details prescribed in my physical journal.

## Acceptance Criteria

1. **Given** the user navigates to the Appointment tab OR the AI classifies an input as an Appointment
2. **When** the entry is displayed
3. **Then** it should render an `AppointmentGlassBox` component
4. **And** Edit mode should provide explicit form fields for: Date, Profession, Practitioner Name, Visit Type, Location, Reason, Admin Needs (checkboxes), Questions, Outcomes, Follow-up Questions, Notes.
5. **And** Saving updates the structured data in Supabase.

## Tasks / Subtasks

- [x] Task 1: Create `AppointmentGlassBox` UI Component (AC: 1, 2, 3, 4)
  - [x] Subtask 1.1: Create `src/components/patient/appointment-glass-box.tsx` adhering to the `GlassBoxCard` pattern. Use `bg-calm-surface-raised` and `calm` text tokens for styling.
  - [x] Subtask 1.2: Implement the "Approved / Draft" visual state, matching the existing `GlassBoxCard`.
  - [x] Subtask 1.3: Build an Edit Mode that includes explicit form fields mapped to a JSON structure: Date, Profession, Practitioner Name, Visit Type, Location, Reason, Admin Needs (checkboxes), Questions, Outcomes, Follow-up Questions, Notes.
- [x] Task 2: Implement Data Mutations and Saving (AC: 5)
  - [x] Subtask 2.1: Ensure the component accepts an `entry` object and `onUpdate`/`onApprove` prop callbacks similar to `GlassBoxCard`.
  - [x] Subtask 2.2: The `onUpdate` function must stringify the complex appointment JSON data before saving to the `content` field in Supabase.
- [x] Task 3: Integrate into Appointment Route (AC: 1, 2)
  - [x] Subtask 3.1: Update `src/app/(patient)/appointments/page.tsx` to query entries filtered by the `agendas` or custom appointment type (or mock the data flow for the prototype).
  - [x] Subtask 3.2: Render `AppointmentGlassBox` for each appointment entry in the list instead of generic fallback.

## Dev Notes

### Technical Requirements

- **Architecture:** `AppointmentGlassBox` must be a client component (`"use client";`) handling local `useState` for editing. Stringify JSON data on save to adapt to the generic `content` field of the `journal_entries` table.
- **State Management:** Use atomic selectors when picking state from Zustand stores if applicable, to avoid re-renders.
- **Security Context:** Persona-based auth relies on a string-based `user_id` passed contextually, not UUID via `auth.uid()`.

### File Structure Requirements

- **Components:** `src/components/patient/appointment-glass-box.tsx`
- **Pages:** Update `src/app/(patient)/appointments/page.tsx`
- **Server Actions:** All data mutations MUST happen via Server Actions. Ensure actions align with `actions/journal-actions.ts` if adding/modifying CRUD operations.

### Testing Requirements

- **Unit Testing:** Write robust Vitest component tests. Tests must cover Edit mode toggling, field updates, and save interactions. Use `__tests__/appointment-glass-box.test.tsx`.

### UI & Aesthetics

- **Accessibility:** Touch targets MUST be >44px for users with motor impairments. Ensure high contrast text against the surface raised backgrounds.
- **Styling:** Adhere to Tailwind "calm" semantic tokens, adopting a mobile-first display architecture suited for the patient app layout which was configured in Epic 3 Story 1.

### Previous Story Intelligence

- **Relevant Git Commits:** From story `3.1-bottom-navigation-structure`, the `src/app/(patient)/appointments/page.tsx` route was established. Ensure any structural padding for the bottom nav bar remains intact when building the listing view.
- **Code Pattern Established:** `src/components/shared/glass-box/glass-box-card.tsx` acts as the primary reference for Draft vs Approved states. Note the JSON parsing logic used in `SafeAgendaRender` as Inspiration for `SafeAppointmentRender`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2: Appointment Record Glass Box]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/prd.md#Accessibility (WCAG 2.1 AA)]
- [Source: src/components/shared/glass-box/glass-box-card.tsx]

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Implemented `AppointmentGlassBox` read-only and edit modes.
- Added comprehensive unit tests in `src/__tests__/appointment-glass-box.test.tsx`.
- Refactored `src/app/(patient)/appointments/page.tsx` to use the DB to fetch records.
- Completed full validation, TypeCheck, and Unit testing suites successfully.
- Code Review completed: Fixed Critical IDOR vulnerability in `journal-actions.ts`, caching path errors, and TypeScript issues in `page.tsx`.

### File List

- `src/components/patient/appointment-glass-box.tsx`
- `src/app/(patient)/appointments/page.tsx`
- `src/app/actions/journal-actions.ts`
- `src/__tests__/appointment-glass-box.test.tsx`
