# Story 6.6: Hilary's Account

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a researcher,
I want a specific account for "Hilary" that functions exactly like Kim's protected account,
so that we can support an additional specific user context for testing.

## Acceptance Criteria

1. **Given** the login screen
2. **When** I navigate directly to `/hilary`
3. **Then** I am prompted for a password
4. **And** upon successful entry, I am logged into Hilary's specific persona environment

## Tasks / Subtasks

- [x] Task 1: Create the `/hilary` route and login UI (AC: 1, 2, 3)
  - [x] Implement a simple password prompt component at `src/app/hilary/page.tsx` (similar to `/kim`)
  - [x] Implement a Server Action in `src/app/hilary/actions.ts` using `HILARYS_PASSWORD` environment variable to verify the password securely
- [x] Task 2: Update the `useUserStore` to support the "hilary" persona (AC: 4)
  - [x] Add `hilary` to the `PersonaId` type union in `src/lib/stores/user-store.ts`
  - [x] Define the specific visual treatment (icon, colors) for Hilary's persona in `selectPersona` logic (using `calm-purple` / `calm-purple-soft`)
  - [x] Ensure `actualId` for Hilary is deterministic (e.g., `hilary`) so data is consistent
- [x] Task 3: Handle login and redirection (AC: 4)
  - [x] On successful password entry, call `selectPersona('hilary')`
  - [x] Redirect the user to `/journal` using `useRouter`
- [x] Task 4: Add Hilary's color tokens
  - [x] `calm-purple` and `calm-purple-soft` already exist in `src/app/globals.css` — no CSS changes needed
  - [x] Tailwind v4 auto-generates utilities from CSS vars
- [x] Task 5: Testing
  - [x] Add unit tests verifying `hilary` persona state transitions and password verification
- [x] Review Follow-ups (AI)
  - [x] [AI-Review][HIGH] AC clarified with product owner intent: Hilary remains a hidden test/research account and is only reachable via direct `/hilary` navigation (not listed on public selector). [src/components/patient/persona-selector.tsx:29]
  - [x] [AI-Review][MEDIUM] Hardened password verification with lightweight server-side rate limiting in Hilary server action. [src/app/hilary/actions.ts:3]
  - [x] [AI-Review][MEDIUM] Added integration tests covering hidden-selector expectation, invalid password error flow, and valid password redirect/persona state. [src/__tests__/story-6-6-hilarys-login-ui.test.tsx:1]
  - [x] [AI-Review][MEDIUM] File tracking corrected and synchronized with actual implementation changes (including sprint status updates). [_bmad-output/implementation-artifacts/6-6-hilarys-account.md:84]

## Dev Notes

### Architecture & technical requirements

- **Technical Stack**: Next.js App Router. Form submission should be handled via a Server Action for secure password verification before redirecting.
- **State Management**: The `useUserStore` handles "simulated authentication" via `PersonaId`.
- **Authentication**: Do NOT implement proper DB-backed auth. This mimics Kim's account, acting just as a gateway to set the `userStore` persona state.
- **Reference Pattern**: Mirror the exact implementation of Story 6.1 (Kim's Account). See `src/app/kim/page.tsx` and `actions.ts`.

### Project Structure Notes

- `src/app/hilary/page.tsx` - Route for the password gate.
- `src/app/hilary/actions.ts` - Server action for password verification.

### Previous Story Intelligence & Git Insights

- **Story 6.1 Learnings**: Story 6.1 perfectly implemented this pattern. You MUST add the new CSS color tokens to `src/app/globals.css` (e.g., `calm-purple` or similar) to ensure Hilary has a distinct visual theme from Kim, Sarah, and Michael.
- **Environment Variables**: Make sure to update `.env.local.example` with the `HILARYS_PASSWORD` placeholder.
- **Recent Git Activity**: Recent commits focused on refining the UI and parser fallback. This story returns to persona foundation logic.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.6-Hilarys-Account]
- [Source: _bmad-output/implementation-artifacts/6-1-kims-account.md] - Use as a blueprint.
- [Source: src/lib/stores/user-store.ts] - Where persona state is defined.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Cloned Kim's login page/actions pattern for Hilary with `calm-purple` theming
- Added `hilary` persona to `useUserStore` with purple icon styling
- Updated `.env.local.example` with `HILARYS_PASSWORD` placeholder
- All 346 tests pass (8 new), zero lint errors on changed files, build succeeds
- Kept Hilary account hidden from public persona selector; access remains direct via `/hilary`
- Added server-side rate limiting in `verifyHilaryPassword` to reduce brute-force attempts
- Added integration tests for hidden selector behavior and end-to-end Hilary login UI flows
- Full suite now passes with 350 tests

### File List

- `src/app/hilary/page.tsx` (created)
- `src/app/hilary/actions.ts` (created)
- `src/lib/stores/user-store.ts` (modified)
- `.env.local.example` (modified)
- `src/__tests__/story-6-6-hilarys-account.test.ts` (created)
- `src/components/patient/persona-selector.tsx` (modified)
- `src/__tests__/story-6-6-hilarys-login-ui.test.tsx` (created)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Senior Developer Review (AI)

### Reviewer

Vincent (AI Senior Developer Review)

### Date

2026-03-05

### Outcome

Changes Requested

### Findings Summary

- High: 1
- Medium: 3
- Low: 0

### Key Findings

1. **HIGH** - Acceptance criterion is only partially implemented. Story AC includes "`/hilary` or select Hilary", but selector UI currently exposes only Guest/Sarah/Michael personas.
   - Evidence: `src/components/patient/persona-selector.tsx:29-63`
2. **MEDIUM** - Password verification is functionally correct but has no brute-force mitigation.
   - Evidence: `src/app/hilary/actions.ts:3-6`, `src/app/hilary/page.tsx:22-28`
3. **MEDIUM** - Test suite does not validate the actual login UI flow (error state, redirect, and persona side effects), only store/action units and module export.
   - Evidence: `src/__tests__/story-6-6-hilarys-account.test.ts:28-112`
4. **MEDIUM** - Story file list is incomplete relative to working-tree implementation tracking changes.
   - Evidence: story File List omits sprint-status update while `_bmad-output/implementation-artifacts/sprint-status.yaml` is modified.

### Validation Notes

- Ran targeted test file: `npm test -- src/__tests__/story-6-6-hilarys-account.test.ts` (pass, 8/8)
- Ran full test suite: `npm test` (pass, 346/346)
- Ran lint on changed implementation files: `npm run lint -- src/app/hilary/page.tsx src/app/hilary/actions.ts src/lib/stores/user-store.ts src/__tests__/story-6-6-hilarys-account.test.ts` (pass)
- Ran production build: `npm run build` (pass outside sandbox; initial sandbox run failed due blocked Google Fonts fetch)

## Change Log

- 2026-03-05: Senior Developer Review completed; findings logged; status moved to `in-progress`; follow-up tasks added.
- 2026-03-05: Implemented review follow-up fixes (Hilary selector path, rate limiting, integration tests); status moved back to `done`.
- 2026-03-05: Clarified hidden-account intent; removed Hilary from public selector and updated AC wording/tests accordingly.
