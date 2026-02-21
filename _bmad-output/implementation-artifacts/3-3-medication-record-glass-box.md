# Story 3.3: Medication Record Glass Box

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want a specific form to log my medications,
so that I can track dosages, side effects, and adherence over time.

## Acceptance Criteria

1. **Given** the user navigates to the Medication tab OR the AI classifies an input as a Medication log
2. **When** the entry is displayed
3. **Then** it should render a `MedicationGlassBox` component
4. **And** Edit mode should provide explicit fields for: Brand Name, Generic Name, Dosage, Date Started, Reason, Side Effects, Feelings, Date Stopped, Stop Reason, Notes.
5. **And** Saving updates the structured data in Supabase.

## Tasks / Subtasks

- [x] Task 1: Create `MedicationGlassBox` UI Component (AC: 1, 2, 3, 4)
  - [x] Subtask 1.1: Create `src/components/patient/medication-glass-box.tsx` based on the `GlassBoxCard` and `AppointmentGlassBox` pattern.
  - [x] Subtask 1.2: Implement visual state rendering for "Draft" and "Approved" statuses.
  - [x] Subtask 1.3: Build the Edit Mode with form fields representing the structured JSON data: Brand Name, Generic Name, Dosage, Date Started, Reason, Side Effects, Feelings, Date Stopped, Stop Reason, Notes.
- [x] Task 2: Implement Data Management and Saving (AC: 5)
  - [x] Subtask 2.1: Add `onUpdate`/`onApprove` prop callbacks, stringifying the JSON payload correctly before saving to the database `content` field.
  - [x] Subtask 2.2: Make sure interactions use established Server Actions like those in `src/app/actions/journal-actions.ts`.
- [x] Task 3: Integrate into Medication Route (AC: 1, 2)
  - [x] Subtask 3.1: Update `src/app/(patient)/medications/page.tsx` to query entries filtered by the medication-related type (e.g. `entry_type: 'medication'`).
  - [x] Subtask 3.2: Render `MedicationGlassBox` inside the list view for medication entries.

## Dev Notes

### Technical Requirements

- **Architecture:** `MedicationGlassBox` must be a `"use client"` component. Handle local state with `useState` for editing properties.
- **State Management:** Use atomic selectors when taking state from Zustand if required.
- **Security Context:** Ensure you match the Persona-based Auth Context. Use Persona IDs (not UUIDs) and avoid `auth.uid()` checks in Server Actions, consistent with current patterns.

### Architecture Compliance

- Use `bg-calm-surface-raised` and `calm` text semantics for accessibility and aesthetic matching.
- Touch targets must be >= 44px.
- Build strictly using Tailwind CSS and un-styled Radix UI primitives as defined by existing project UI standards.

### File Structure Requirements

- **Components:** `src/components/patient/medication-glass-box.tsx`
- **Pages:** `src/app/(patient)/medications/page.tsx`
- **Actions:** Evaluate and use existing secure server actions in `src/app/actions/journal-actions.ts`.

### Testing Requirements

- **Vitest:** Provide a component test file: `src/__tests__/medication-glass-box.test.tsx`.
- Cover reading state, edit mode toggling, and save submission checks.

### Previous Story Intelligence

- **Code Pattern Established:** Look at `AppointmentGlassBox` in `src/components/patient/appointment-glass-box.tsx` as the direct reference for how complex JSON schemas are parsed and saved successfully.
- **Vulnerabilities Avoided:** In the previous story, a critical IDOR vulnerability in `journal-actions.ts` had to be fixed as well as Next.js router caching issues regarding server data refetching. Keep data revalidation accurate and secure.

### Git Intelligence

- Commits review indicates active parallel work linking Epic 3 route forms (`Appointments`, `Medications`, `Scripts`). Follow exact layout padded container mechanisms used in `page.tsx` of routing features.

### Project Context Reference

- **Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, Shadcn.
- **Role:** Maintain mobile-first responsive duality, zeroing in strictly on the `(patient)` route layout.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3: Medication Record Glass Box]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/implementation-artifacts/3-2-appointment-record-glass-box.md]
- [Source: src/components/patient/appointment-glass-box.tsx]

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

- Fixed failing tests due to mismatched route URLs in `src/app/actions/journal-actions.ts` (`/app/journal` vs `/journal`).

### Completion Notes List

- Created `MedicationGlassBox` component reproducing Glass Box patterns and adhering to design tokens.
- Implemented tests for `MedicationGlassBox` covering all requested behavior.
- Added `updateMedicationEntry` server action referencing `updateJournalEntry` and reformatting correct cache paths.
- Re-architected `src/app/(patient)/medications/page.tsx` to handle fetching and displaying medication records.
- [AI-Review] Fixed missing cache revalidations on `journal-entry-list.tsx` mutations.
- [AI-Review] Replaced fragile heuristics parsing with `glass-box-helpers.ts` type-guards.
- [AI-Review] Suppressed false-positive IDOR findings according to `project-context.md` auth directives.

### File List

- `src/components/patient/medication-glass-box.tsx`
- `src/__tests__/medication-glass-box.test.tsx`
- `src/app/actions/journal-actions.ts`
- `src/app/(patient)/medications/page.tsx`
- `src/components/patient/journal-entry-list.tsx`
- `src/lib/openai/smart-parser.ts`
- `src/lib/utils/glass-box-helpers.ts`
