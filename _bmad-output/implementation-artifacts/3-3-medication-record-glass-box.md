# Story 3.3: Medication Record Glass Box

Status: backlog

## Story

As a patient user,
I want a specific form to log my medications,
So that I can track dosages, side effects, and adherence over time.

## Acceptance Criteria

1. **Given** the user navigates to the Medication tab OR the AI classifies an input as a Medication log
2. **When** the entry is displayed
3. **Then** it should render a `MedicationGlassBox` component
4. **And** Edit mode should provide explicit fields for: Brand Name, Generic Name, Dosage, Date Started, Reason, Side Effects, Feelings, Date Stopped, Stop Reason, Notes.
5. **And** Saving updates the structured data in Supabase.

## Tasks / Subtasks

- [ ] Create `MedicationGlassBox` UI Component (ReadOnly and Edit Mode state)
- [ ] Connect state to schema actions
- [ ] Support CRUD via `app/actions/journal-actions.ts`
- [ ] Implement `Medication` list view
