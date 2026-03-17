# Story 7.7: Appointment Form Enhancements

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want more detailed fields on the Appointment card to accurately record my doctor visits,
So that I can log the exact time, appointment type, address, purpose, and track required repeat prescriptions.

## Acceptance Criteria

1. **Given** I am viewing an Appointment Glass Box (in `/appointments` or `/journal`)
   **When** the entry is in edit mode or viewed
   **Then** there should be a "Time" field formatted as HH:MM AM/PM

2. **Given** the Appointment Glass Box
   **When** I view or edit it
   **Then** an "In-person / Telehealth" radio selection should appear under the Profession/Practitioner Name fields

3. **Given** the Appointment Glass Box
   **When** I view or edit it
   **Then** the "Location" field should be renamed to "Address"

4. **Given** the Appointment Glass Box
   **When** I view or edit the "Reason for Visit" section
   **Then** the "Admin Needs" heading should be removed
   **And** the chip selections should be updated to exclusively: "Repeat Prescription", "Medical Certificate", "Specialist Referral", and "Pathology Referral"

5. **Given** the Appointment Glass Box
   **When** I view or edit the area below "Questions to Ask"
   **Then** a "Repeat Prescription" list section should exist (before Outcomes/Plan)
   **And** I can add items dynamically to this list

## Tasks / Subtasks

- [x] Task 1: Update `AppointmentResponseSchema` in `smart-parser.ts` (AC: #1, #2, #3, #4)
  - [x] Add `Time` field (string, optional, HH:MM AM/PM format)
  - [x] Add `Mode` field (enum: `'In-person' | 'Telehealth'`, optional)
  - [x] Rename `Location` to `Address` in the schema
  - [x] Replace `Admin Needs` enum values with: `'Repeat Prescription'`, `'Medical Certificate'`, `'Specialist Referral'`, `'Pathology Referral'`
  - [x] Add `Repeat Prescriptions` field (array of strings, optional)
  - [x] Update the embedded `Appointments[]` sub-schema in `JournalResponseSchema` to match
  - [x] Update the AI system prompt for `parseAppointment()` to include new fields and remove old Admin Needs values

- [x] Task 2: Update `AppointmentEditForm` in `glass-box/editors/appointment-edit-form.tsx` (AC: #1–#5)
  - [x] Add Time input field (text, placeholder "HH:MM AM/PM")
  - [x] Add In-person/Telehealth radio group below Practitioner Name
  - [x] Rename "Location" label to "Address"
  - [x] Remove "Admin Needs" heading; update chip options to the new 4 values
  - [x] Add "Repeat Prescriptions" dynamic list section (add/remove items) between Questions and Outcomes

- [x] Task 3: Update `SafeAppointmentRender` in `glass-box-card.tsx` (AC: #1–#5)
  - [x] Add Time rendering (after Date)
  - [x] Add Mode rendering (In-person/Telehealth badge)
  - [x] Rename "Location" → "Address" in display
  - [x] Remove "Admin Needs" label; display new chip values
  - [x] Render "Repeat Prescriptions" list before Outcomes

- [x] Task 4: Update legacy `AppointmentGlassBox` in `appointment-glass-box.tsx` (AC: #1–#5)
  - [x] Mirror all field changes from Task 2 and Task 3 into the standalone component
  - [x] Update the `AppointmentData` interface to include new fields
  - [x] Ensure both view and edit modes reflect the updated structure

- [x] Task 5: Update seed data (AC: all)
  - [x] Update existing appointment seed entries in `supabase/seed.sql` to include `Time`, `Mode`, `Address` (renamed from `Location`), and new chip values
  - [x] Add at least one entry with `Repeat Prescriptions` populated

- [x] Task 6: Update server actions in `journal-actions.ts` (AC: all)
  - [x] Ensure `updateAppointmentEntry` and `approveAppointmentEntry` handle the new fields correctly

- [x] Task 7: Tests (AC: all)
  - [x] Update `appointment-glass-box.test.tsx` for new fields
  - [x] Add tests for the new schema validation (Time format, Mode enum, new chips)
  - [x] Test Repeat Prescriptions dynamic list add/remove

## Dev Notes

### Technical Requirements

**Two parallel renderers must be updated in sync:**
1. **`GlassBoxCard` system** (journal/home page): `SafeAppointmentRender` + `AppointmentEditForm`
2. **`AppointmentGlassBox`** (appointments page): standalone component with inline edit

Both must display identical fields. The `GlassBoxCard` renderer is the newer pattern; the `AppointmentGlassBox` is legacy but still active on `/appointments`.

**Schema field mapping (old → new):**

| Old Field | New Field | Change Type |
|---|---|---|
| — | `Time` | ADD (string, optional, "HH:MM AM/PM") |
| — | `Mode` | ADD (enum: "In-person" / "Telehealth") |
| `Location` | `Address` | RENAME |
| `Admin Needs` (5 values) | `Admin Needs` (4 values) | REPLACE values |
| — | `Repeat Prescriptions` | ADD (string[], dynamic list) |

**Admin Needs chip values change:**

| Old Values | New Values |
|---|---|
| Referral | Repeat Prescription |
| Prescription | Medical Certificate |
| Medical Certificate | Specialist Referral |
| Imaging Request | Pathology Referral |
| Blood Test | *(removed)* |

**The `Location` → `Address` rename** applies to: Zod schema key, AI prompt, form label, render label, seed data JSON keys. The underlying JSONB storage key should change from `"Location"` to `"Address"`.

**`Time` field already exists** in the embedded `Appointments[]` sub-schema within `JournalResponseSchema` (`smart-parser.ts`). The standalone `AppointmentResponseSchema` is missing it — add it there to match.

**Repeat Prescriptions UI**: Implement as a dynamic list with an "Add" button and per-item "Remove" (X) button. Use `bg-calm-green` for the Add button per project styling conventions.

### Architecture Compliance

- **Auth**: No Supabase Auth. Persona IDs are strings passed directly — do not add auth checks.
- **State**: Zustand for client state. Use atomic selectors.
- **Supabase**: Use server client in Server Components/Actions, client in Client Components.
- **Styling**: Tailwind with `calm-*` tokens. Do NOT use `bg-calm-primary` (undefined). Use `bg-calm-blue` for primary actions, `bg-calm-green` for positive/add states. Touch targets ≥ 44px.
- **Glass Box Status**: Display "Added" in patient UI; persist as `approved` in DB.
- **Date format**: All dates strictly `dd-mm-yyyy`.

### Library / Framework Requirements

- Zod for schema validation (already in use)
- No new dependencies required — all UI can be built with existing Tailwind + Shadcn primitives
- **Do NOT add React Hook Form** — use existing local-state form pattern consistent with other Glass Box editors (record as tech debt per project-context Rule 8)

### File Structure Requirements

Files to modify (all paths from `src/`):

| File | Change |
|---|---|
| `lib/openai/smart-parser.ts` | Update `AppointmentResponseSchema`, `Appointments[]` sub-schema, and `parseAppointment` AI prompt |
| `components/shared/glass-box/editors/appointment-edit-form.tsx` | Add Time, Mode, Address rename, new chips, Repeat Prescriptions list |
| `components/shared/glass-box/glass-box-card.tsx` | Update `SafeAppointmentRender` for new fields |
| `components/patient/appointment-glass-box.tsx` | Mirror all field changes in legacy component |
| `app/actions/journal-actions.ts` | Verify server actions handle new fields |
| `supabase/seed.sql` | Update appointment seed entries with new fields |
| `__tests__/appointment-glass-box.test.tsx` | Update tests for new fields |

### Testing Requirements

- Unit tests for `AppointmentResponseSchema` Zod validation with new fields
- Component tests for `AppointmentEditForm` and `AppointmentGlassBox` — render new fields, edit interactions
- Test Repeat Prescriptions dynamic list (add item, remove item, empty state)
- **Manual UI testing required** (project-context Rule 4): spin up browser and visually inspect appointment forms on both `/appointments` and `/journal` pages

### Previous Story Intelligence

- **Story 7.6** changed `sessionStorage` → `localStorage` for session persistence. No direct impact on appointment forms, but confirms the persona hydration pattern is stable.
- **Story 7.4** (Immunisation Records) added a new entry type with its own Glass Box. Pattern: added `ImmunisationGlassBox`, updated `smart-parser.ts` with `ImmunisationResponseSchema`, added `parseImmunisation`, updated `detectAiResponseShape()` in `glass-box-card.tsx`. Follow the same pattern for schema changes.
- **Story 6.7** refactored state management and optimistic UI. The `useJournalStore` handles optimistic updates — ensure appointment field changes don't break optimistic rendering.
- **Story 3.2** originally created the appointment Glass Box. The legacy `AppointmentGlassBox` component uses `updateAppointmentEntry` which writes to `content` column (stringified JSON). The newer `AppointmentEditForm` writes to `ai_response` JSONB. Both paths must be updated.

### Git Intelligence

Recent commits show Epic 7 stories completed in sequence. Key patterns:
- Each story updates seed data when schema changes (`f0cb441`)
- Course corrections happen mid-epic when scope shifts (`4ead3d1`, `51f3834`)
- Test files follow naming pattern: `story-X-Y-description.test.ts(x)`

### Backward Compatibility

- Existing appointment entries in the DB will have `Location` instead of `Address` and old `Admin Needs` values. The renderers should gracefully handle both old and new key names during the transition:
  - Read `Address` first, fall back to `Location` for display
  - Accept both old and new `Admin Needs` values for display (but only offer new values in edit mode)
- Seed data update via `npm run db:reset` will apply the new format

### Project Structure Notes

- All appointment components are in standard locations per project structure
- No new files needed — this is an enhancement of existing files
- The two parallel renderer systems (legacy `AppointmentGlassBox` + newer `GlassBoxCard`) should ideally be consolidated, but that is out of scope for this story. Record as tech debt if appropriate.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 7.7]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Data Architecture]
- [Source: `_bmad-output/project-context.md`#Rule 2 Styling, #Rule 4 Manual UI Testing, #Rule 6 Glass Box Status, #Rule 8 React Hook Form Debt]
- [Source: `src/lib/openai/smart-parser.ts`#AppointmentResponseSchema (line ~327)]
- [Source: `src/components/shared/glass-box/editors/appointment-edit-form.tsx`]
- [Source: `src/components/patient/appointment-glass-box.tsx`]
- [Source: `src/components/shared/glass-box/glass-box-card.tsx`#SafeAppointmentRender]
- [Source: `src/app/actions/journal-actions.ts`#updateAppointmentEntry]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None required.

### Completion Notes List

- Task 1: Updated `AppointmentResponseSchema` with Time, Mode (enum), Address (renamed from Location), new Admin Needs values, and Repeat Prescriptions. Updated `JournalResponseSchema` embedded Appointments sub-schema to add Mode and Address (replacing Location). Updated `APPOINTMENT_SYSTEM_PROMPT` and `JOURNAL_SYSTEM_PROMPT` with new field descriptions.
- Task 2: Rewrote `AppointmentEditForm` with Time input, In-person/Telehealth toggle buttons, Address field, new 4 chip values under "Reason for Visit" label, and Repeat Prescriptions dynamic list with Add/Remove.
- Task 3: Updated `SafeAppointmentRender` with Time display, Mode badge (color-coded), Address with Location fallback, new chip rendering under "Reason for Visit", and Repeat Prescriptions list with green bullet indicators.
- Task 4: Rewrote `AppointmentGlassBox` legacy component with all new fields in both view and edit modes, including backward compatibility for legacy `Location` key.
- Task 5: Updated 2 appointment seed entries (Sarah + Michael) with Time, Mode, Address, new Admin Needs values. Sarah's entry includes Repeat Prescriptions populated.
- Task 6: Server actions are schema-agnostic (pass-through JSONB), no code changes needed. Verified `updateAppointmentEntry`, `approveAppointmentEntry`, and `updateJournalAiResponse` all handle new fields correctly.
- Task 7: Rewrote `appointment-glass-box.test.tsx` with coverage for new fields, legacy Location fallback, legacy Admin Needs normalization, Mode buttons, new chip options, and Repeat Prescriptions add/remove/empty state. Updated `smart-parser.test.ts` with explicit validation checks for 24-hour time format, Mode enum, and allowed Admin Needs values.
- Review follow-up: `src/app/(patient)/appointments/page.tsx` and `src/lib/utils/date-helpers.ts` were also changed during implementation and are included below for audit completeness.
- Verification recorded: targeted `vitest` runs and `npm run type-check` passed during review. Manual browser verification required by project context has not been recorded in this story.

### Change Log

- 2026-03-17: Implemented Story 7.7 — Appointment Form Enhancements (all 7 tasks complete)

### File List

- `src/lib/openai/smart-parser.ts` — Updated AppointmentResponseSchema, JournalResponseSchema Appointments sub-schema, and AI prompts
- `src/components/shared/glass-box/editors/appointment-edit-form.tsx` — Rewrote with Time, Mode, Address, new chips, Repeat Prescriptions
- `src/components/shared/glass-box/glass-box-card.tsx` — Updated SafeAppointmentRender with new fields and backward compat
- `src/components/patient/appointment-glass-box.tsx` — Rewrote legacy component with all new fields
- `src/app/(patient)/appointments/page.tsx` — Updated optimistic appointment editing to mirror structured `ai_response` changes immediately
- `src/lib/utils/date-helpers.ts` — Added `toYYYYMMDD()` helper for native date inputs
- `supabase/seed.sql` — Updated appointment seed data with new fields
- `src/__tests__/appointment-glass-box.test.tsx` — Rewrote with 12 comprehensive tests
- `src/__tests__/glass-box-edit-dispatch.test.tsx` — Updated chip test for new Admin Needs values
- `src/lib/openai/smart-parser.test.ts` — Updated parseAppointment test for new enum values
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Status updated to review
