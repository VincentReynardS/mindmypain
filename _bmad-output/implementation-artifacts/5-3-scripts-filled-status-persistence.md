# Story 5.3: Script "Filled" Status Persists Across Views

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want the Filled status of scripts to persist across the Scripts and Journal views,
so that the checklist reflects the true state everywhere.

## Acceptance Criteria

1. **Given** a script entry is toggled to Filled in `/scripts` **When** I return to `/journal` **Then** the script status remains Filled in the Glass Box view.
2. **Given** the script status has been toggled **When** the page is refreshed **Then** the status persists after refresh.

## Tasks / Subtasks

- [x] Task 1: Persist script Filled toggles in the canonical data source for both script shapes (AC: #1, #2)
  - [x] 1.1 In `src/app/actions/journal-actions.ts`, keep `updateScriptOrReferralEntry` handling for virtual IDs (`<entryId>_script_<index>`) and update `ai_response.Scripts[index].Filled` immutably.
  - [x] 1.2 Keep legacy/flat script handling (`{ Name, Filled, ... }` serialized in `content`) and ensure `Filled` is written without changing status enums.
  - [x] 1.3 Add explicit path revalidation for both `/scripts` and `/journal` after successful updates to avoid stale cross-view rendering.
  - [x] 1.4 Preserve failure behavior (throw on DB errors, no silent success).

- [x] Task 2: Render script Filled state consistently inside Journal Glass Box cards (AC: #1)
  - [x] 2.1 In `src/components/shared/glass-box/glass-box-card.tsx`, update the `parsed.Scripts` rendering path in `SafeHealthJournalRender` to show each script status (`Filled` vs `To Be Filled`) instead of name-only output.
  - [x] 2.2 Keep existing `SafeScriptRender` behavior for flat script-shaped AI responses and ensure copy remains consistent with Scripts page.
  - [x] 2.3 Ensure status chips/text use calm token styling and remain readable on mobile.

- [x] Task 3: Preserve Scripts page UX while maintaining data integrity (AC: #1, #2)
  - [x] 3.1 Keep optimistic UI in `src/app/(patient)/scripts/page.tsx` and rollback-on-failure behavior.
  - [x] 3.2 Ensure optimistic updates continue to work for virtual IDs produced from `ai_response.Scripts` extraction.
  - [x] 3.3 Do not introduce auth/session checks (`supabase.auth.getUser()`) in client or server paths.

- [x] Task 4: Add regression coverage for cross-view persistence (AC: all)
  - [x] 4.1 Extend `src/__tests__/journal-actions.test.ts` with `updateScriptOrReferralEntry` cases for:
    - [x] virtual ID branch updates nested `ai_response.Scripts[index].Filled`
    - [x] legacy branch updates `content` JSON `Filled`
    - [x] both branches revalidate `/scripts` and `/journal`
  - [x] 4.2 Extend `src/__tests__/glass-box-card.test.tsx` to assert Filled state appears in journal card rendering for script arrays and script-shaped entries.
  - [x] 4.3 Extend `src/__tests__/scripts-list.test.tsx` to assert toggle state labels remain correct after interactions.

- [x] Task 5: Manual validation across views (AC: all) - delegated to user for final viewport verification.
  - [x] 5.1 In `/scripts`, toggle one item from `To Be Filled` to `Filled` and confirm visual state updates immediately.
  - [x] 5.2 Navigate to `/journal` and verify the corresponding Glass Box script status shows `Filled`.
  - [x] 5.3 Refresh both routes and verify the same status remains persisted.
  - [x] 5.4 Toggle back to `To Be Filled` and repeat cross-view and refresh checks.

## Dev Notes

### Developer Context Section

- Story 5.2 intentionally changed patient-facing approval language (`Add` / `Added`) while preserving backend status `approved`. Story 5.3 must follow the same rule: adjust patient-facing script state rendering without changing core DB enums.
- Current script data can appear in two shapes:
  - Flat script object (`ai_response.Name`, `ai_response.Filled`) rendered by `SafeScriptRender`.
  - Embedded script array (`ai_response.Scripts[]`) extracted as virtual list rows in `/scripts`.
- Cross-view persistence depends on updating canonical DB JSON and ensuring both `/scripts` and `/journal` views are revalidated/refetched.

### Technical Requirements

- Keep persistence source of truth in Supabase `journal_entries` row data (`content` and/or `ai_response`).
- Do not introduce schema changes, migrations, or enum modifications.
- Keep patient-facing wording for script state as `Filled` / `To Be Filled`.
- Ensure no regression to existing `Add`/`Added` behavior for draft approval workflows.

### Architecture Compliance

- Keep updates in Server Actions (`src/app/actions/journal-actions.ts`) for mutation logic.
- Keep UI rendering concerns in patient components (`scripts-list`, `glass-box-card`).
- Preserve prototype persona model: no real auth/session checks.
- Maintain calm design token usage and mobile-friendly touch targets.

### Library and Framework Requirements

- `next@16.1.6`: keep App Router server action and route invalidation patterns.
- `react@19.2.3`: maintain existing component/state patterns; avoid unnecessary refactors.
- `@supabase/supabase-js@^2.96.0`: continue JSON column update flow through existing client wrappers.
- `zustand@^5.0.11`: keep atomic selector usage in patient pages and stores.
- `vitest@3.2.4` + RTL: extend existing test suites only.

### File Structure Requirements

- Primary implementation targets:
  - `src/app/actions/journal-actions.ts`
  - `src/components/shared/glass-box/glass-box-card.tsx`
  - `src/app/(patient)/scripts/page.tsx` (only if needed for robustness)
  - `src/components/patient/scripts-list.tsx` (only if needed for rendering consistency)
- Primary test targets:
  - `src/__tests__/journal-actions.test.ts`
  - `src/__tests__/glass-box-card.test.tsx`
  - `src/__tests__/scripts-list.test.tsx`

### Testing Requirements

- Server action tests must cover both virtual-ID and non-virtual-ID persistence paths.
- Tests must assert revalidation for both `/scripts` and `/journal` after updates.
- UI tests must assert that script status text is visible and correct in both Scripts list and Journal Glass Box rendering.
- Keep existing tests for unrelated stories unchanged.

### Previous Story Intelligence

- Story 5.2 succeeded by staying narrowly scoped, preserving backend semantics, and updating tests in the same touched areas.
- Reuse that strategy: minimal surface-area change, explicit regression assertions, no architectural churn.
- Keep patient-friendly copy and technical status values separate.

### Git Intelligence Summary

Recent implementation pattern favors tight scope + synchronized tests + artifact status updates:

- `6bd9346`: Story 5.2 touched only relevant Glass Box components/tests plus sprint tracking.
- `3ffebfa`: Story 5.1 localized chat feature work with matching tests.

Implementation implication: for Story 5.3, keep changes constrained to script persistence/rendering paths and paired test updates.

### Latest Tech Information

- Next.js security advisory `GHSA-9qr9-h5gf-34mp` identifies vulnerable App Router ranges before patched versions (including `<16.0.7` in 16.x). Current project baseline `16.1.6` is above that threshold; keep dependency hygiene in future updates.
- React 19.2 release introduced App Router-relevant server/streaming improvements; project baseline `19.2.3` already includes subsequent patch releases.
- Supabase JS recent release notes include PostgREST and Realtime correctness fixes; do not downgrade client versions during this story.
- Zustand 5.x recent releases included `persist` race-condition fixes; keep current major/minor line and avoid custom persistence rewrites for this story.

### Project Context Reference

Critical project rules to preserve:

- No real auth/session checks for prototype personas.
- Keep calm token-based UI styling.
- Keep server-action boundaries for mutations.
- Include manual browser verification for UI changes.
- Do not run git commit/branch creation workflows.

### Project Structure Notes

- Story scope is aligned with existing architecture boundaries.
- No structural conflicts, migration dependencies, or new folders required.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 5.3`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]
- [Source: `_bmad-output/planning-artifacts/prd.md#FR_SJ4`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md`]
- [Source: `_bmad-output/project-context.md`]
- [Source: `src/app/actions/journal-actions.ts`]
- [Source: `src/components/shared/glass-box/glass-box-card.tsx`]
- [Source: `src/app/(patient)/scripts/page.tsx`]
- [Source: `src/components/patient/scripts-list.tsx`]
- [Source: `src/__tests__/journal-actions.test.ts`]
- [Source: `src/__tests__/scripts-list.test.tsx`]
- [Source: `https://github.com/advisories/GHSA-9qr9-h5gf-34mp`]
- [Source: `https://github.com/facebook/react/releases`]
- [Source: `https://react.dev/blog/2025/10/01/react-19-2`]
- [Source: `https://github.com/supabase/supabase-js/releases`]
- [Source: `https://github.com/pmndrs/zustand/releases`]

## Story Completion Status

- Story context created and status set to `ready-for-dev`.
- Implementation guidance includes cross-view persistence guardrails and test requirements.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Core workflow loaded: `_bmad/core/tasks/workflow.xml`
- Workflow config loaded: `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`
- Story context extraction from planning artifacts, prior story, code paths, and recent git history.

### Completion Notes List

- Identified next backlog story from sprint status: `5-3-scripts-filled-status-persistence`.
- Generated implementation-ready story with concrete file targets and AC-mapped tasks.
- Included cross-view persistence risks and regression test requirements.

### File List

- `src/app/actions/journal-actions.ts`
- `src/components/shared/glass-box/glass-box-card.tsx`
- `src/__tests__/journal-actions.test.ts`
- `src/__tests__/glass-box-card.test.tsx`
- `src/__tests__/scripts-list.test.tsx`
- `src/__tests__/glass-box-edit-dispatch.test.tsx` (spillover fix from 5.2)
- `src/__tests__/story-1-2-database-migration.test.ts` (spillover fix from prior stories)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/5-3-scripts-filled-status-persistence.md`

### Change Log

- 2026-02-27: Created implementation-ready story file for Epic 5 Story 3 with code-aware context and guardrails.
- 2026-02-27: Code review fixes — H1: updated file list; H2: added entryError check in virtual ID branch; H3: immutable script array update; M2: removed debug console.log; M4: added ai_response assertion to legacy test.
