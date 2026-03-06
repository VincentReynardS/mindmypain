# Story 6.8: Remove "Save as Doctor Summary" Feature

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I do not want to see a specific "Save as Doctor Summary" feature,
So that I am not confused about how it differs from the proactive chat interface.

## Acceptance Criteria

1. **Given** the active application views
2. **When** navigating through the journal or chat
3. **Then** any UI elements (buttons, forms, cards) related to generating or approving a "Doctor Summary" or "Clinical Summary" should be removed.
4. **And** the primary way to recall data for doctor visits is explicitly directed through the Proactive Chat interface.

## Tasks / Subtasks

- [x] Task 1: Audit and Remove UI Elements (AC: 1, 3)
  - [x] Audit `src/app/(patient)` and `src/components/patient` for "Save as Doctor Summary", "Doctor Summary", or "Clinical Summary" features.
  - [x] Remove buttons, forms, and Glass Box layouts dedicated to generating these summaries.
  - [x] Clean up any dead front-end code (hooks, local states) linked to these removed components.
- [x] Task 2: Verify chat interface as the primary recall mechanism (AC: 4)
  - [x] Ensure that the chat interface remains accessible and properly highlighted for data recall without competition from the removed summary feature.
- [x] Task 3: Testing & Verification
  - [x] Run type-checking (`tsc`) and linting to ensure no broken imports or missing component errors.
  - [x] Perform manual UI testing to ensure the journal and chat pages load successfully without the removed feature.

## Dev Notes

- **Architecture Constraints**:
  - This story focuses primarily on front-end UI element removal. Story 6.9 will handle the deep refactor of the backend data model (`clinical_summary` enum type) and the `smart-parser.ts` logic.
  - Do not aggressively delete backend endpoints if they are shared or needed by Story 6.9, instead focus on the UI and Client Components.
- **Git Intelligence/Previous Story Learnings**:
  - Story 6.7 recently refactored the Zustand store (`journal-store.ts`) and optimistic UI with robust error handling and snapshots (`getEntriesSnapshot`, `restoreSnapshot`). Ensure that removing the "Doctor Summary" doesn't inadvertently break the optimistic UI flow for other Glass Box cards.
  - The tri-state data flow (Draft -> Pending Review -> Added) remains active for other features.

### Project Structure Notes

- Remove references primarily from: `src/components/patient/*` and related views.
- Shared components like `glass-box` should be preserved for other uses (like Agendas), just remove the summary-specific variants or usage.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.8-Remove-Save-as-Doctor-Summary-Feature]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (code review pass)

### Debug Log References

### Completion Notes List

- Removed "Save as Doctor Summary" button and `handleSaveAsSummary` handler from `journal-input.tsx`
- Removed `ClinicalSummaryEditForm` editor and `SafeClinicalSummaryRender` renderer (deleted files)
- Removed clinical_summary import references and shape detection from `glass-box-card.tsx`
- Set `clinical_summary` badge config to empty/null in both `glass-box-card.tsx` and `journal-entry-card.tsx`
- Updated tests to verify removal and assert fallback behavior for legacy clinical_summary entries
- All 360 tests pass; no new broken imports

### Known Deferrals (Story 6.9 scope)

- `generateClinicalSummary()` function, Zod schema, and tests remain in `smart-parser.ts` (backend)
- `clinical_summary` enum value remains in `database.ts` type (DB enum change)
- `createJournalEntry()` in `journal-actions.ts` still accepts `'clinical_summary'` parameter (dead code path)
- Empty `clinical_summary` entries in `TYPE_CONFIG` / `TYPE_BADGE_CONFIG` kept for TypeScript exhaustiveness

### File List

- `src/components/patient/journal-input.tsx` — Removed "Save as Doctor Summary" button, `handleSaveAsSummary`, `isGeneratingSummary` state, unused `processJournalEntry` import
- `src/components/shared/glass-box/glass-box-card.tsx` — Removed `SafeClinicalSummaryRender` import, `ClinicalSummaryEditForm` import, clinical_summary shape detection/dispatch, clinical_summary renderer branch; emptied badge config
- `src/components/patient/journal-entry-card.tsx` — Set `clinical_summary` badge to `null`
- `src/components/shared/glass-box/editors/clinical-summary-edit-form.tsx` — DELETED
- `src/components/shared/glass-box/renderers/safe-clinical-summary-render.tsx` — DELETED
- `src/components/shared/glass-box/renderers/safe-clinical-summary-render.test.tsx` — DELETED
- `src/__tests__/glass-box-card.test.tsx` — Updated: removed ClinicalSummaryEditForm assertion, added negative assertion for removed imports
- `src/__tests__/glass-box-edit-dispatch.test.tsx` — Updated: clinical_summary now falls back to JournalEditForm
- `src/__tests__/story-2-2-daily-list-view.test.ts` — Added: assertion that clinical_summary badge label is not "Summary"
