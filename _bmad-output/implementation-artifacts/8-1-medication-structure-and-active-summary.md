# Story 8.1: Medication Structure & Active Summary

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want my entered medications to be displayed on a Medications Home Screen with an Active Summary checklist,
so that I can see what I am currently taking, what is inactive, and track natural supplements without the AI constantly re-adding duplicates to my journal.

## Acceptance Criteria

1. **Given** I input a medication via voice/text
   **When** the AI processes it
   **Then** the system checks for existing active medications to deduplicate entries
2. **And** the `/medications` tab displays three distinct sections: "Active Medications Summary", "Natural Supplements Summary", and "Inactive Medications Summary".
3. **And** each section has an "Edit" button in its header.
4. **And** the lists display items with checkboxes (checked/unchecked) and formatted as `Brand Name Dosage (Generic Name)`.
5. **And** tapping a medication shows full details (dosages, side effects, etc.) in the `MedicationGlassBox`.

## Tasks / Subtasks

- [x] Deduplication Logic in Smart Parser
  - [x] Implement checks in `smart-parser.ts` to identify if the extracted medication already exists as active.
  - [x] Prevent duplicate creation if it already exists; perhaps update the last-mentioned date or log a reference.
- [x] Medications Summary UI
  - [x] Update `/app/(patient)/medications/page.tsx` to group medications into three distinct sections:
    - **Active Medications Summary**: Currently prescribed pharmaceutical medications. Items have interactive checkboxes to track adherence.
    - **Natural Supplements Summary**: Non-prescription, over-the-counter supplements, vitamins, and minerals (e.g., Vitamin C, Omega-3). Items have interactive checkboxes.
    - **Inactive Medications Summary**: Past medications or supplements the user has stopped taking. Checkboxes should be disabled or show an 'x' icon to indicate they are discontinued.
  - [x] Add an "Edit" button to the header of each section to manage items.
  - [x] Display items with checkboxes and format text as `Brand Name Dosage (Generic Name)`.
  - [x] Add a specific icon (e.g., archive or file box) for the "Inactive Medications Summary" section header.
- [x] Medication Detail View
  - [x] Ensure tapping an item on the list opens the `MedicationGlassBox` in edit/view mode with full details.

## Dev Notes

- **Architecture:** The `journal_entries` table with `entry_type: 'MEDICATION'` must include fields in the JSON structure to differentiate state and type: `is_active` (boolean) and `category` (e.g., 'prescription' vs 'supplement').
- **Store / State:** `useJournalStore` should efficiently compute and group the three lists (Active Prescriptions, Active Supplements, Inactive) from the entry stream.
- **Deduplication:** Ensure `smart-parser.ts` calls a function to fetch existing active meds before appending a new one to avoid re-inserting duplicates. It should also attempt to classify items as supplements vs prescriptions.

### Project Structure Notes

- Alignment with unified project structure: Ensure the new UI components reside in `components/patient/` or `components/shared/glass-box/`.
- No new tables required if using JSON within the single `journal_entries` table, adhering to Architecture Decision 1.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 8]
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (1M context)  -  dev-story workflow

### Debug Log References

N/A

### Completion Notes List

- **Data model (no migration needed):** Medication state is stored entirely in the existing `journal_entries.ai_response` JSONB, per Architecture Decision 1. Added two new keys to the medication shape: `Category` (`'prescription' | 'supplement'`) and `Is Active` (boolean). An adherence-tracking `Checked` boolean and a dedup `Last Mentioned` date are also persisted there.
- **Task 1  -  Deduplication & classification (`smart-parser.ts`, `journal-entry-ai.ts`, `journal-actions.ts`):**
  - Extended `MedicationResponseSchema` + `MEDICATION_SYSTEM_PROMPT` so the LLM classifies `Category` (prescription vs supplement) and `Is Active`, defaulting to prescription/active when unsure.
  - Added pure, unit-tested helpers in `journal-entry-ai.ts`: `getMedicationCategory`, `isMedicationActive` (inactive when `Is Active === false` or a `Date Stopped` exists), `groupMedicationEntries`, `formatMedicationLabel`, and `findDuplicateActiveMedication` (case-insensitive brand/generic name match against ACTIVE meds only).
  - Wired dedup into `processJournalEntry`: when a parsed medication matches an existing active record, the new raw entry is deleted and the existing entry gets a `Last Mentioned` date instead of creating a duplicate card (returns `{ success: true, deduplicated: true }`).
- **Task 2  -  Summary UI (`medication-summary.tsx`, `medications/page.tsx`):** New `MedicationSummary` renders the three sections (Active Medications, Natural Supplements, Inactive). Each header has an Edit button (expands all items in the section for management); the Inactive header shows an archive icon. Items render as `Brand Name Dosage (Generic Name)` with an interactive adherence checkbox (disabled for inactive items). The toggle persists `Checked` optimistically via `updateJournalAiResponse`.
- **Task 3  -  Detail view (`medication-glass-box.tsx`):** Tapping an item expands the existing `MedicationGlassBox` for full view/edit. Added a `Category` selector to its edit form and made serialization preserve `Category`, `Is Active` (derived from `Date Stopped`), `Checked`, and `Last Mentioned` so edits no longer wipe these fields. Internal flags are hidden from the read-only detail render.
- **Test status:** Full suite 596/597 passing. The single failure (`story-7-1-date-formatting.test.ts`  -  Michael's seed `Date Started` expected `05-03-2026`, seed contains `12-03-2026`) is **pre-existing** and confirmed failing on clean `HEAD` with all story-8.1 changes stashed; it is unrelated to this story (seed-data drift). Lint: all changed files pass; the one repo lint error (`persona-guard.tsx` set-state-in-effect) is also pre-existing. `tsc --noEmit` clean.
- **Code review fixes (AI):** Fixed all HIGH/MEDIUM review findings: medication stop/change mentions now route to medication intent; dedup lookup errors fail closed instead of creating duplicate medication records; `Last Mentioned` uses `dd-mm-yyyy`; legacy medication JSON is preserved when adherence checkboxes are toggled before backfill; section header Edit labels are visible; medications page fetch failures surface an error instead of an empty state.
- **Review verification:** `npm test -- medication journal-actions smart-parser` passes (103 tests). `npm run type-check` passes.

### Senior Developer Review (AI)

- **Outcome:** Approved after fixes.
- **Issues fixed:** 3 High, 3 Medium.
- **High:** stopped-medication mentions could bypass medication parsing; dedup Supabase lookup errors were ignored; legacy medication checkbox toggles could overwrite structured data with only `Checked`.
- **Medium:** section header Edit labels were not visible; `Last Mentioned` used `yyyy-mm-dd`; medications page fetch errors looked like "No medications found".
- **Validation:** Acceptance Criteria 1-5 rechecked against implementation. Focused regression coverage added/updated for stop intent prompt coverage, dedup lookup failure behavior, legacy adherence preservation, visible Edit labels, and normalized `Last Mentioned` dates.

### File List

- `_bmad-output/implementation-artifacts/8-1-medication-structure-and-active-summary.md`
- `src/lib/openai/smart-parser.ts` (modified)
- `src/lib/openai/smart-parser.test.ts` (modified)
- `src/lib/journal-entry-ai.ts` (modified)
- `src/app/actions/journal-actions.ts` (modified)
- `src/app/(patient)/medications/page.tsx` (modified)
- `src/components/patient/medication-glass-box.tsx` (modified)
- `src/components/patient/medication-summary.tsx` (new)
- `src/__tests__/medication-glass-box.test.tsx` (modified)
- `src/__tests__/journal-actions.test.ts` (modified)
- `src/__tests__/medication-summary.test.tsx` (new)
- `src/__tests__/story-8-1-medication-summary.test.ts` (new)

## Change Log

| Date       | Change                                                                                       |
|------------|----------------------------------------------------------------------------------------------|
| 2026-06-22 | Review fixes: resolved 3 High and 3 Medium code review findings; added regression tests; Status -> done. |
| 2026-06-22 | Enhancement (review): added a one-click "Mark Inactive" / "Reactivate" button to the `MedicationGlassBox` card header so users can move an active med/supplement to Inactive (and back) without opening the edit form. Added 2 unit tests. |
| 2026-06-22 | Fix (review): dedup now MERGES the incoming parse into the existing active record via `mergeMedicationMention`, so a "stopped taking X" mention applies `Is Active=false` / `Date Stopped` and moves the med to Inactive, instead of only stamping a date. Added 4 unit tests. |
| 2026-06-22 | Implemented Story 8.1: medication `Category`/`Is Active` classification, active-medication deduplication in `processJournalEntry`, and the three-section Medications Summary UI (Active / Supplements / Inactive) with adherence checkboxes and expandable `MedicationGlassBox` detail. Status -> review. |
