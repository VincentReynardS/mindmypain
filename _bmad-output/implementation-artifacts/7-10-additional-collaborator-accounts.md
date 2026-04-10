# Story 7.10: Additional Collaborator Accounts

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a collaborator,
I want explicit, hidden accounts for Simone Ley, Peter Sykes, Lucille Cassar, and Kimberley Grima,
So that these stakeholders can test the app securely without interfering with existing user states.

## Acceptance Criteria

1. **Given** the login screen
   **When** I navigate to their precise hidden paths (e.g., `/simone`, `/peter`, `/lucille`, `/kimberley`)
   **Then** I am prompted for a password
   **And** upon successful entry, I am logged into their specific persona environment, isolated from other users
   **And** these personas are explicitly NOT visible on the public Persona selection cards

## Tasks / Subtasks

- [x] Task 1: Add account entry points for all new collaborators
  - [x] Add hidden routes: `/simone`, `/peter`, `/lucille`, `/kimberley`.
  - [x] Set `personaId` upon successful login.
- [x] Task 2: Implement password protection for each account
  - [x] Implement password prompt specifically for these users (following the established Mary-Lynne/Kim/Hilary pattern).
  - [x] Handle successful authentication routing to their environments.
- [x] Task 3: Ensure session persistence
  - [x] Verify that session persistence works for the newly added persona IDs.
- [x] Task 4: Ensure no public visibility
  - [x] Explicitly verify these personas DO NOT appear on the public Persona selection cards.

## Dev Notes

- **Technical Requirements:**
  - Standard simulated authentication applies: no real Supabase auth (`supabase.auth.getUser()`). Use the string `simone`, `peter`, `lucille`, and `kimberley` for persona IDs.
  - Re-use the existing password prompt component or server action logic developed for the other protected accounts.
  - Follow the exact same pattern for `.env.local.example` (e.g., `SIMONE_PASSWORD`, `PETER_PASSWORD`, `LUCILLE_PASSWORD`, `KIMBERLEY_PASSWORD`).

- **Architecture Compliance:**
  - **Prototype Auth:** DO NOT implement standard session-based user authentication. Use Zustand state for context switching.
  - **Manual UI Testing:** Dev agent MUST use the browser subagent to verify the new persona routes render correctly and the password prompt securely blocks unauthorized access. Ensure no cards leaked to `/`.

- **Library Framework Requirements:**
  - Next.js (App Router), Zustand (Client state). Tailwind CSS.
  
- **File Structure Requirements:**
  - Check the global store in `src/lib/stores/user-store.ts` to see if personas require explicit enumeration and add the new ones.
  - Duplicate/adapt existing action/page files for the hidden paths.

- **Testing Standards:**
  - Add or extend unit tests for the new persona auth and store logic.
  - Spin up the dev server and manually click through the hidden routes to verify access with the correct password but rejects incorrect ones.

### Previous Story Intelligence

- **Story 7.9 (Mary-Lynne's Account):** Established the exact pattern recently utilized for isolated collaborator accounts via hidden routes. The same approach should be rigorously applied here.
- **Story 7.6 (Persistent Session):** Established session persistence logic for selected persona. It handles arbitrary persona IDs seamlessly but ensure they are represented properly in the store.

### Git Intelligence

Recent commits reflect ongoing Epic 7 work, specifically adding targeted accounts (Mary-Lynne's). Extending the same stable pattern to these 4 accounts should be a straight-forward duplication of effort.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 7.10]
- [Source: `_bmad-output/project-context.md`#Rule 1 Prototype Authentication vs Real Auth]
- [Source: `_bmad-output/project-context.md`#Rule 4 Manual UI Testing Requirement]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

- `npm run test -- --run src/__tests__/story-7-10-additional-collaborator-accounts.test.ts` → 33/33 pass
- `npm run build` → success; all 4 new routes (`/simone`, `/peter`, `/lucille`, `/kimberley`) prerender as static
- Manual verification via playwright MCP against `npm run dev`:
  - `/` shows only Guest/Sarah/Michael cards (confirmed snapshot)
  - `/simone` → wrong password rejected, correct password sets `personaId="simone"` and routes to `/home`
  - `/peter` → correct password sets `personaId="peter"`, `personaIconBg="bg-calm-purple-soft"`
  - `/lucille` → correct password sets `personaId="lucille"`, `personaIconBg="bg-calm-rose-soft"`
  - `/kimberley` → correct password sets `personaId="kimberley"`, `personaIconBg="bg-calm-blue-soft"`
  - Navigating back to `/home` after refresh preserved the Kimberley persona (session persistence via zustand `persist` middleware works out of the box)

### Completion Notes List

- Added 4 hidden password-protected routes (Simone, Peter, Lucille, Kimberley) that mirror the established Mary-Lynne/Kim/Hilary pattern exactly: one `page.tsx` client component + one `actions.ts` server action per route.
- Extended `useUserStore` with the 4 new persona IDs, display names, and icon styling branches. Existing `calm-*` color tokens were reused (Simone→teal, Peter→purple, Lucille→rose, Kimberley→blue) because visual collisions only ever surface on the hidden login screen and the profile avatar, never side-by-side with the reused-color personas.
- Added 4 `*_PASSWORD` env vars to `.env.local.example` following the exact same documentation style as the existing Mary-Lynne entry.
- Public `PersonaSelector` component was left untouched — the `personas[]` array already only contained Guest/Sarah/Michael, and a regression test now asserts that none of the 4 new IDs or display names leak into that file.
- Added `src/__tests__/story-7-10-additional-collaborator-accounts.test.ts` with 33 tests covering: store transitions for each new persona, icon styling, `clearPersona` reset, persona switching, the 4 server actions (accept/reject/env-unset), module default exports for each page, and the regression test against the persona selector source.
- Session persistence: verified that the existing zustand `persist` middleware (wired in Story 7.6) handles the new persona IDs seamlessly with no store-config changes needed.
- Review fix (2026-04-10): synchronized story File List with all currently changed workspace artifacts to remove git/story mismatch.

**Pre-existing failures (not introduced by this story; unrelated files):**
- `src/__tests__/story-7-1-date-formatting.test.ts:240` expects Michael's seeded medication to contain `"Date Started":"05-03-2026"` but the current `supabase/seed.sql` contains `"01-07-2026"`. Out of scope for 7.10; the seed was revised in commit 798452e ("Revise workshop scenario 3 to utilise the other app features").
- `npm run lint` reports an `react-hooks/set-state-in-effect` error in `src/components/shared/persona-guard.tsx:29` (introduced in commit fb7476c for Story 7.6). Out of scope for 7.10.

### File List

- `src/lib/stores/user-store.ts` (modified)
- `src/app/simone/page.tsx` (new)
- `src/app/simone/actions.ts` (new)
- `src/app/peter/page.tsx` (new)
- `src/app/peter/actions.ts` (new)
- `src/app/lucille/page.tsx` (new)
- `src/app/lucille/actions.ts` (new)
- `src/app/kimberley/page.tsx` (new)
- `src/app/kimberley/actions.ts` (new)
- `.env.local.example` (modified)
- `src/__tests__/story-7-10-additional-collaborator-accounts.test.ts` (new)
- `_bmad-output/implementation-artifacts/7-10-additional-collaborator-accounts.md` (updated: tasks, status, dev record)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (updated: 7-10 → in-progress)
- `_bmad-output/planning-artifacts/epics.md` (modified in workspace; not part of 7.10 source implementation)
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-10.md` (workspace artifact)
- `.playwright-mcp/` (local MCP run artifacts)

## Change Log

| Date       | Version | Description                                                       | Author |
| ---------- | ------- | ----------------------------------------------------------------- | ------ |
| 2026-04-10 | 1.0     | Initial implementation of 4 hidden collaborator accounts (7.10).  | Dev    |
| 2026-04-10 | 1.1     | Applied code review fixes: password hardening + file list sync.   | Reviewer |
| 2026-04-10 | 1.2     | Rolled back password hardening; kept direct-check parity with existing protected accounts. | Reviewer |

## Senior Developer Review (AI)

Date: 2026-04-10
Reviewer: Codex (GPT-5)
Outcome: Changes Requested (partially fixed)

### Findings Summary

- Fixed (MEDIUM): story/git discrepancy on File List completeness.
- Open (MEDIUM): unthrottled direct password equality checks on collaborator routes (intentionally kept for parity with existing protected accounts).
- Open by decision (MEDIUM): missing interactive route-flow test coverage for password pages.

### Notes

- Per user direction, medium issue #3 remains open and was not fixed in this pass.
