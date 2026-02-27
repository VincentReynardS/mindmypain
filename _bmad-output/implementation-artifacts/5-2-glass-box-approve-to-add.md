# Story 5.2: Replace "Approve" with "Add"

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want the Glass Box action labeled "Add" instead of "Approve",
so that the action feels less clinical and more welcoming.

## Acceptance Criteria

1. **Given** any Glass Box card in the patient UI **When** the primary action is displayed **Then** it reads "Add" instead of "Approve".
2. **Given** any Glass Box card in the patient UI **When** the draft is committed **Then** no underlying behavior changes (persisted status still transitions to `approved`).
3. **Given** an entry is in persisted status `approved` **When** rendered in patient UI **Then** the displayed status label is `Added`.
4. **Given** the primary `Add` button in Glass Box cards **When** rendered **Then** it uses the compact height variant (`40px`) requested by product feedback.

## Tasks / Subtasks

- [x] Task 1: Update Glass Box CTA labels in shared card component (AC: #1, #2)
  - [x] 1.1 In `src/components/shared/glass-box/glass-box-card.tsx`, replace visible button text `Approve` with `Add` for draft entries.
  - [x] 1.2 Replace loading label `Approving...` with user-facing `Adding...` while preserving `handleApprove` callback and mutation path.
  - [x] 1.3 Show `Added` as the patient-facing status text when persisted status is `approved`.

- [x] Task 2: Update specialized Glass Box components for consistency (AC: #1, #2)
  - [x] 2.1 In `src/components/patient/appointment-glass-box.tsx`, change CTA text to `Add` and loading text to `Adding...`.
  - [x] 2.2 In `src/components/patient/medication-glass-box.tsx`, change CTA text to `Add` and loading text to `Adding...`.
  - [x] 2.3 Confirm no updates required in script-specific card paths if they already use shared card labels.

- [x] Task 3: Preserve behavior and data contract (AC: #2)
  - [x] 3.1 Keep `onApprove` prop and `handleApprove` function names intact to avoid unnecessary API and store churn.
  - [x] 3.2 Keep server action and store transitions unchanged: status must continue moving to `approved`.
  - [x] 3.3 Confirm no DB migration or enum changes are introduced.

- [x] Task 4: Update and expand tests (AC: #1, #2)
  - [x] 4.1 Update `src/__tests__/glass-box-card.test.tsx` assertions to expect `Add`/`Adding...` in rendered source checks where applicable.
  - [x] 4.2 Add or update tests for `appointment-glass-box` and `medication-glass-box` to assert button labels show `Add` for draft entries.
  - [x] 4.3 Add regression assertions that approval callback still fires and status transition behavior remains tied to `approved` semantics.

- [x] Task 5: Manual UX verification (mobile-first) (AC: #1, #2)
  - [x] 5.1 In patient views (`/journal`, `/appointments`, `/medications`, `/scripts` as applicable), verify every draft Glass Box primary CTA reads `Add`.
  - [x] 5.2 Trigger action and verify card transitions to persisted status `approved` exactly as before while displayed badge/status reads `Added`.
  - [x] 5.3 Verify compact `Add` button height (`40px`) and calm token styling are applied consistently across Glass Box variants.

## Dev Notes

### Developer Context Section

- Story 5.1 just shipped chat follow-up chips; this story is intentionally narrow and should avoid touching chat, parsing, or data model logic.
- Existing card behavior is already wired through `onApprove` callbacks to approved-state transitions. This story is a UI copy change with strict behavior parity.
- The same approval pattern appears in multiple components (`glass-box-card`, `appointment-glass-box`, `medication-glass-box`), so coverage must ensure consistency across all patient-facing cards.

### Technical Requirements

- User-facing CTA copy changes from `Approve` to `Add` in all relevant patient Glass Box components.
- Do not change backend status values (`approved`) or workflow logic.
- Do not change API contracts, server action names, or store method names unless strictly necessary.
- Keep loading-state UX semantically aligned (`Adding...`) without changing asynchronous behavior.

### Architecture Compliance

- Keep all changes within existing component boundaries under `src/components/shared/glass-box` and `src/components/patient`.
- Continue using existing server actions (`approveJournalEntry`) and store transitions (`status: approved`).
- Maintain calm design tokens; keep the compact `Add` button sizing variant (`40px`) introduced from product feedback.
- Preserve prototype persona-auth approach; do not introduce `supabase.auth.getUser()` checks.

### Library and Framework Requirements

- `next@16.1.6` and `react@19.2.3` are current project baselines; this story should not introduce framework upgrades.
- Use existing test stack (`vitest@3.2.4`, RTL) and extend current component tests.
- No additional dependencies needed.

### File Structure Requirements

- Primary files to modify:
  - `src/components/shared/glass-box/glass-box-card.tsx`
  - `src/components/patient/appointment-glass-box.tsx`
  - `src/components/patient/medication-glass-box.tsx`
- Test files to update/add assertions:
  - `src/__tests__/glass-box-card.test.tsx`
  - `src/__tests__/appointment-glass-box.test.tsx`
  - `src/__tests__/medication-glass-box.test.tsx`
  - optionally `src/__tests__/journal-actions.test.ts` for status transition guardrails

### Testing Requirements

- Unit/component tests must assert CTA text is `Add` for non-approved entries.
- Tests must assert approved-state semantics remain unchanged while status text displayed to patients is `Added` and draft CTA is hidden when approved.
- Tests must assert explicit compact sizing contract for the `Add` button.
- Behavior tests should confirm callback path still invokes approval handlers.
- Include manual verification across affected routes and card variants.

### Previous Story Intelligence

- Story 5.1 maintained narrow scope and added tests near touched components; follow same approach here.
- Existing implementation style favors targeted updates with regression-safe behavior checks and explicit calm-token UI constraints.
- Keep pre-existing error handling and optimistic UI patterns intact.

### Git Intelligence Summary

Recent commits show stable pattern: isolated feature scope + synchronized test updates + sprint status updates.
- `3ffebfa` changed chat route/page/store/components and tests together.
- `64c4ab8` finalized story artifact separately.
Implementation implication: perform localized UI copy changes with matching test updates, avoid unrelated refactors.

### Latest Tech Information

- Next.js App Router route and component patterns used by current codebase remain stable for this story scope.
- React 19.2.4 includes a recently disclosed RSC vulnerability fix; repository is on 19.2.3, so no change in this story, but keep this in backlog for dependency hygiene.
- This story requires no external API or schema updates; primary risk is inconsistent copy across card variants.

### Project Context Reference

Critical project rules to preserve:
- Prototype persona model (no real auth/session checks)
- Tailwind calm-token styling
- Manual browser verification for UI changes
- No git commit/branch actions by agent workflows

### Project Structure Notes

- Fully aligned with existing architecture and folder boundaries.
- No structural conflicts or migration dependencies detected.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 5.2`]
- [Source: `_bmad-output/project-context.md`]
- [Source: `src/components/shared/glass-box/glass-box-card.tsx`]
- [Source: `src/components/patient/appointment-glass-box.tsx`]
- [Source: `src/components/patient/medication-glass-box.tsx`]
- [Source: `src/components/patient/journal-entry-list.tsx`]
- [Source: `src/__tests__/glass-box-card.test.tsx`]
- [Source: `https://nextjs.org/docs/app`]
- [Source: `https://react.dev/blog/2025/10/01/react-19-2`]
- [Source: `https://github.com/facebook/react/security/advisories/GHSA-4r64-pv7j-x8cj`]

## Story Completion Status

- Story implementation completed for label update scope (`Approve` → `Add`) across target patient Glass Box components.
- Story status set to `done`.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- src/__tests__/glass-box-card.test.tsx src/__tests__/appointment-glass-box.test.tsx src/__tests__/medication-glass-box.test.tsx` (red phase, expected fail before implementation)
- `npm test -- src/__tests__/glass-box-card.test.tsx src/__tests__/appointment-glass-box.test.tsx src/__tests__/medication-glass-box.test.tsx src/__tests__/journal-actions.test.ts` (pass)
- `npm test` (fails due pre-existing unrelated failures in `src/__tests__/story-1-2-database-migration.test.ts`)
- `npm run lint` (fails due pre-existing repository-wide lint issues unrelated to this story)

### Completion Notes List

- Updated primary CTA labels from `Approve`/`Approving...` to `Add`/`Adding...` in shared and specialized Glass Box components.
- Preserved all approval behavior and status transitions (`approved`) by keeping `onApprove`/`handleApprove` paths unchanged.
- Updated patient-facing approved label from `Approved` to `Added` while preserving persisted/backend status value `approved`.
- Applied compact `Add` button height (`40px`) across shared, appointment, and medication Glass Box cards.
- Added test assertions for `Add` labels, `Added` status display, and explicit button sizing contract.
- Verified targeted regression coverage with passing story-focused test suite.
- Full-suite and lint failures are pre-existing and outside this story scope.

### File List

- `_bmad-output/implementation-artifacts/5-2-glass-box-approve-to-add.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/project-context.md`
- `src/components/shared/glass-box/glass-box-card.tsx`
- `src/components/patient/appointment-glass-box.tsx`
- `src/components/patient/medication-glass-box.tsx`
- `src/__tests__/glass-box-card.test.tsx`
- `src/__tests__/appointment-glass-box.test.tsx`
- `src/__tests__/medication-glass-box.test.tsx`

### Change Log

- 2026-02-27: Created implementation-ready story file for Epic 5 Story 2 with full context and test guardrails.
- 2026-02-27: Implemented Story 5.2 label update (`Approve` → `Add`) with component and test changes; moved story to review.
- 2026-02-27: Code review follow-up applied - aligned stale story wording with product-directed behavior (`Added` UI label; compact `Add` button); moved story to done.

## Senior Developer Review (AI)

### Outcome

- **Decision:** Approve
- **Review Date:** 2026-02-27
- **Summary:** Implementation behavior is correct after product feedback. Story/test documentation was stale and has now been synchronized.

### Findings Resolved

- [x] [HIGH] Story tasks conflicted with implemented `Added` status label.
- [x] [HIGH] Story manual verification conflicted with compact `Add` button sizing.
- [x] [MEDIUM] Testing requirements still referenced `Approved` UI text.
- [x] [MEDIUM] Story File List omitted `_bmad-output/project-context.md`.
- [x] [MEDIUM] Guardrail coverage strengthened for explicit `Added` label and compact action sizing.
