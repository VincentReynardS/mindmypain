# Story 7.9: Mary-Lynne's Account

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a collaborator,
I want a specific account for "Mary-Lynne" that functions exactly like Kim and Hilary's protected accounts,
So that I can test the app with my true experience without interference.

## Acceptance Criteria

1. **Given** the login screen
   **When** I navigate to `/mary-lynne` or select Mary-Lynne
   **Then** I am prompted for a password
   **And** upon successful entry, I am logged into Mary-Lynne's specific persona environment

## Tasks / Subtasks

- [x] Task 1: Add "Mary-Lynne" account entry point
  - [x] Add a Mary-Lynne hidden route account.
  - [x] Set `personaId` to `mary-lynne` upon successful login.
- [x] Task 2: Implement password protection for Mary-Lynne
  - [x] Implement password prompt specifically for Mary-Lynne (following Kim and Hilary's pattern).
  - [x] Handle successful authentication routing to her environment.
- [x] Task 3: Ensure session persistence
  - [x] Verify that session persistence works for the newly added Mary-Lynne persona.

## Dev Notes

- **Technical Requirements:**
  - Standard simulated authentication applies: no real Supabase auth (`supabase.auth.getUser()`). Use the string `mary-lynne` for persona ID.
  - Re-use the existing password prompt component or logic developed for Kim's (`/kim`) and Hilary's (`/hilary`) accounts.
  - Ensure the password checking logic matches the existing implementation for protected accounts.

- **Architecture Compliance:**
  - **Prototype Auth:** DO NOT implement standard session-based user authentication. Use Zustand state for context switching.
  - **Styling:** Use `calm` tokens for styling. No `bg-calm-primary` or `text-calm-primary`. Primary actions should use `bg-calm-blue`. 
  - **Manual UI Testing:** Dev agent MUST use the browser subagent to verify the new persona card renders correctly on the login screen and the password prompt securely blocks unauthorized access.

- **Library Framework Requirements:**
  - Next.js (App Router), Zustand (Client state). Tailwind CSS.
  
- **File Structure Requirements:**
  - Update the main page/login screen UI (`src/app/page.tsx` or similar login component).
  - Check the global store in `src/store/user-store.ts` to see if personas require explicit enumeration.

- **Testing Standards:**
  - Pass the authentication logic unit tests.
  - Spin up the dev server and manually click through the persona login to verify `mary-lynne` allows access with the correct password but rejects incorrect ones.

### Project Structure Notes

- Align the visual style of the `mary-lynne` card with the existing `kim` and `hilary` cards.

### Previous Story Intelligence

- **Story 7.6 (Persistent Session):** Established session persistence logic for selected persona. Make sure Mary-Lynne benefits from this logic.
- **Story 6.1 & 6.6 (Kim's & Hilary's Accounts):** Created the pattern for password-protecting specific user accounts. Reuse the exact same pattern for Mary-Lynne.

### Git Intelligence

Recent commits reflect ongoing Epic 7 work, specifically session persistence. Testing session persistence with the new account is critical.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 7.9]
- [Source: `_bmad-output/project-context.md`#Rule 1 Prototype Authentication vs Real Auth]
- [Source: `_bmad-output/project-context.md`#Rule 2 Styling]
- [Source: `_bmad-output/project-context.md`#Rule 4 Manual UI Testing Requirement]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

### Completion Notes List

- Added hidden protected route `/mary-lynne` with password form and server action verification via `MARY_LYNNES_PASSWORD`.
- Added Mary-Lynne persona support in Zustand user store (`personaId`, display name, icon tokens), so existing persistence logic applies unchanged.
- Added dedicated unit tests for Mary-Lynne persona/store behavior and password action behavior.
- Added calm rose design tokens for Mary-Lynne visual treatment.
- Added `MARY_LYNNES_PASSWORD` to `.env.local.example`.
- Intentional scope decision: no public Persona Selector card for Mary-Lynne; access is via hidden route `/mary-lynne`.
- Intentional scope decision: account password checks remain simple env-based comparisons for invite-only prototype behavior.
### File List

- .env.local.example
- src/app/globals.css
- src/lib/stores/user-store.ts
- src/app/mary-lynne/page.tsx
- src/app/mary-lynne/actions.ts
- src/__tests__/story-7-9-mary-lynnes-account.test.ts
- src/app/hilary/actions.ts
- src/__tests__/story-6-6-hilarys-account.test.ts

## Senior Developer Review (AI)

Date: 2026-03-22
Reviewer: GPT-5 Codex
Outcome: Changes Requested items partially accepted by product decision; story approved with documented exceptions.

Accepted Decisions:
- AC interpretation: Mary-Lynne remains hidden-route access only (`/mary-lynne`); no public selector card required.
- Security posture: no password rate limiting required for this invite-only prototype.
- Test scope: no selector-path test required because selector exposure is intentionally out of scope.

Residual Risk (Accepted):
- Hidden-route discovery may allow repeated password attempts; considered acceptable for current prototype constraints.
