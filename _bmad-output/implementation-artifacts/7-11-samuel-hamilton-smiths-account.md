# Story 7.11: Samuel Hamilton-Smith's Account

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a collaborator,
I want an explicit, hidden account for Samuel Hamilton-Smith,
So that he can test the app securely without interfering with existing user states or simulated personas.

## Acceptance Criteria

1. **Given** the login screen
   **When** I navigate to the precise hidden path for his account (e.g., `/samuel`)
   **Then** I am prompted for a password
   **And** upon successful entry, I am logged into Samuel Hamilton-Smith's specific persona environment, isolated from other users
   **And** this persona is explicitly NOT visible on the public Persona selection cards

## Tasks / Subtasks

- [x] Task 1: Add account entry point for Samuel
  - [x] Add hidden route: `/samuel`.
  - [x] Set `personaId` upon successful login.
- [x] Task 2: Implement password protection for the account
  - [x] Implement password prompt specifically for this user (following the established Mary-Lynne/Kim/Hilary/Simone/Peter/Lucille/Kimberley pattern).
  - [x] Handle successful authentication routing to his environment.
- [x] Task 3: Ensure session persistence
  - [x] Verify that session persistence works for the newly added persona ID.
- [x] Task 4: Ensure no public visibility
  - [x] Explicitly verify this persona DOES NOT appear on the public Persona selection cards.

## Dev Notes

- **Technical Requirements:**
  - Standard simulated authentication applies: no real Supabase auth (`supabase.auth.getUser()`). Use the string `samuel` for persona ID.
  - Re-use the existing password prompt component or server action logic developed for the other protected accounts.
  - Follow the exact same pattern for `.env.local.example` (e.g., `SAMUEL_PASSWORD`).

- **Architecture Compliance:**
  - **Prototype Auth:** DO NOT implement standard session-based user authentication. Use Zustand state for context switching.
  - **Manual UI Testing:** Dev agent MUST use the browser subagent to verify the new persona route renders correctly and the password prompt securely blocks unauthorized access. Ensure no cards leaked to `/`.

- **Library Framework Requirements:**
  - Next.js (App Router), Zustand (Client state), Tailwind CSS.
  
- **File Structure Requirements:**
  - Check the global store in `src/lib/stores/user-store.ts` to see if personas require explicit enumeration and add the new one.
  - Duplicate/adapt existing action/page files for the hidden paths.

- **Testing Standards:**
  - Add or extend unit tests for the new persona auth and store logic.
  - Spin up the dev server and manually click through the hidden routes to verify access with the correct password but rejects incorrect ones.

### Previous Story Intelligence

- **Story 7.10 (Additional Collaborator Accounts):** Established the exact pattern recently utilized for isolated collaborator accounts via hidden routes. The same approach should be rigorously applied here.
- **Story 7.6 (Persistent Session):** Established session persistence logic for selected persona. It handles arbitrary persona IDs seamlessly but ensure they are represented properly in the store.

### Git Intelligence

Recent commits reflect ongoing Epic 7 work, specifically adding targeted accounts in 7.10 (Completes Epic 7 Story 10: Dedicated account for 4 new participants). Extending the same stable pattern to this account should be a straightforward duplication of effort.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 7.11]
- [Source: `_bmad-output/project-context.md`#Rule 1 Prototype Authentication vs Real Auth]
- [Source: `_bmad-output/project-context.md`#Rule 4 Manual UI Testing Requirement]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

- `npm run test -- story-7-11` → 8/8 tests pass.
- Manual browser verification via Playwright MCP: `/samuel` renders password prompt; wrong password shows "Incorrect password" inline error; correct password (`SAMUEL_PASSWORD`) redirects to `/home`; landing `/` shows only Guest/Sarah/Michael cards (Samuel hidden as required).

### Completion Notes List

- Duplicated the `/kimberley` pattern verbatim for `/samuel` with env var `SAMUEL_PASSWORD`.
- Icon styling: `bg-calm-green-soft` / `text-calm-green` (reuses existing palette slot, consistent with precedent in `user-store.ts`).
- Session persistence requires no extra wiring — Zustand `persist` middleware serialises any persona ID.
- Pre-existing lint error in `src/components/shared/persona-guard.tsx` (unrelated to this story) was not touched.

### File List

- `src/app/samuel/page.tsx` (new)
- `src/app/samuel/actions.ts` (new)
- `src/__tests__/story-7-11-samuels-account.test.ts` (new)
- `src/lib/stores/user-store.ts` (modified: added `samuel` to `PersonaId`, icon branch, and `personaName` mapping)
- `.env.local.example` (modified: added `SAMUEL_PASSWORD` entry)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified: story 7.11 status synced)

### Review Follow-ups (AI)

- [ ] [AI-Review][MEDIUM] Extract the 8 near-identical hidden-persona login pages (`/kim`, `/hilary`, `/mary-lynne`, `/simone`, `/peter`, `/lucille`, `/kimberley`, `/samuel`) into a generic `<HiddenPersonaLogin personaId envVar />` component + single `verifyPersonaPassword(envVar)` server action. Duplication debt is now load-bearing — every new persona means another copy-paste. Track as separate story in Epic 7 or a dedicated refactor story. [src/app/{persona}/page.tsx, src/app/{persona}/actions.ts]
- [ ] [AI-Review][LOW] Update stale header docstring in `src/lib/stores/user-store.ts:1-2` — still lists only 6 of the 11 current personas.
- [ ] [AI-Review][LOW] Rename `src/__tests__/story-7-11-samuels-account.test.ts` → `story-7-11-samuel-account.test.ts` (plural is inconsistent with route and story filename).
- [ ] [AI-Review][LOW] Consider a unique color slot for Samuel — currently shares `calm-green` with Michael. Every calm-* slot is now doubled; if two colliding personas render in the same researcher view they'll be indistinguishable.
- [ ] [AI-Review][LOW] Password comparison in all `/{persona}/actions.ts` uses `===` (non-constant-time). Negligible for prototype but worth hardening if ever re-used outside the research context.
- [ ] [AI-Review][LOW] `PersonaId` type has `| string` escape hatch (`user-store.ts:29`) defeating the discriminated union — pre-existing, but cleanup candidate.
