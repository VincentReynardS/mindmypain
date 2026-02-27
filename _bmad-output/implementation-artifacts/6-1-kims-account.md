# Story 6.1: Kim's Account

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the creator,
I want a specific account and login screen protected by a password,
so that I can test the app with my true experience without interference from simulated personas.

## Acceptance Criteria

1. **Given** the login screen
2. **When** I navigate to `/kim`
3. **Then** I am prompted for a password
4. **And** upon successful entry, I am logged in to Kim's specific persona environment

## Tasks / Subtasks

- [x] Task 1: Create the `/kim` route and login UI (AC: 1, 2, 3)
  - [x] Implement a simple password prompt component at `src/app/kim/page.tsx`
  - [x] Use a hardcoded environment variable (e.g., `KIMS_PASSWORD`) to verify the password locally
- [x] Task 2: Update the `useUserStore` to support the "kim" persona (AC: 4)
  - [x] Add `kim` to the `PersonaId` type union in `src/lib/stores/user-store.ts`
  - [x] Define the specific visual treatment (icon, colors) for Kim's persona in `selectPersona` logic
  - [x] Ensure `actualId` for Kim is deterministic (e.g., `kim`) so data is consistent, unlike the guest persona logic
- [x] Task 3: Handle login and redirection (AC: 4)
  - [x] On successful password entry, call `selectPersona('kim')`
  - [x] Redirect the user to `/journal` using `useRouter`
- [x] Task 4: Add Kim's starting data (optional seed data adjustments)
  - [x] Verify if there are any specific RLS policies or seed data queries needed for Kim, or if it acts as a fresh real account

## Dev Notes

- **Technical Stack**: Next.js App Router for the `/kim` route. Form submission should be handled as a Client Component with standard React state, or via a Server Action. Given the "Zero-Auth" architecture, this is just a gatekeeper to set the Zustand store.
- **Architecture Constraints**: The `userStore` simulates authentication. Do NOT pull in `@supabase/auth-helpers` or modify the standard authentication flow. Just verify a password input and set the persona to 'kim'.
- **Source Tree to Touch**:
  - `src/app/kim/page.tsx` (New route)
  - `src/lib/stores/user-store.ts`
- **Testing Standards**: Standard unit test verifying password rejection and acceptance mechanisms, and ensuring the `userStore` is updated.

### Project Structure Notes

- The `/kim` route belongs at the root level because it is an entry point similar to the main `page.tsx`.
- We do not modify the main `PersonaSelector` component in `src/components/patient/persona-selector.tsx` because this feature is hidden from the main UI.

### Deferred Enhancement

- **Proper DB-backed login for Kim**: The current implementation uses an env-var password gate. A future enhancement should replace this with a proper login flow: `accounts` table with hashed passwords (bcrypt), a change-password UI, and DB-based verification. Estimated ~3-4x the effort of this story. Revisit after all epics are cleared.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.1-Kims-Account]
- [Source: src/lib/stores/user-store.ts] - Reference for how `selectPersona` manages state.
- [Source: architecture.md#Authentication--Security] - Shows persona-based "No Auth Flow".

## Dev Agent Record

### Agent Model Used

Antigravity (auto-generated)

### Debug Log References

### Completion Notes List

- All 4 ACs implemented: `/kim` route with password prompt, server action for env-var verification, kim persona in Zustand store, redirect to `/journal`
- 8 unit tests added covering persona state, password verification, and module exports
- Code review fixed missing `calm-teal` / `calm-teal-soft` CSS tokens in `globals.css`

### File List

- `src/app/kim/page.tsx` (created) — Password login page
- `src/app/kim/actions.ts` (created) — Server action for password verification
- `src/lib/stores/user-store.ts` (modified) — Added kim persona to PersonaId and selectPersona
- `src/app/globals.css` (modified) — Added calm-teal and calm-teal-soft CSS tokens
- `.env.local.example` (modified) — Added KIMS_PASSWORD placeholder
- `src/__tests__/story-6-1-kims-account.test.ts` (created) — Unit tests
