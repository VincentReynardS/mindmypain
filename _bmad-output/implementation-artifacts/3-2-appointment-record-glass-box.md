# Story 3.2: Appointment Record Glass Box

Status: backlog

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

- [ ] Create `AppointmentGlassBox` UI Component (ReadOnly and Edit Mode state)
- [ ] Connect state to schema actions 
- [ ] Support CRUD via `app/actions/journal-actions.ts`
- [ ] Implement `Appointment` list view
