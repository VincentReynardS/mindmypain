# Story 7.6: session-persistence-fix

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an end user (and creator Kim),
I want my selected persona login to persist even when my phone screen locks or goes into the background,
So that I don't have to keep logging back in every time I pull my phone out.

## Acceptance Criteria

1. **Given** I am logged into a specific persona (e.g. Kim, Sarah, Michael)
2. **When** I lock my phone screen or leave the browser tab open for an extended period
3. **Then** my session should not reset
4. **And** upon returning, I should remain on the authenticated view without needing to re-enter credentials or select a persona again.

## Tasks / Subtasks

- [x] Task 1: Investigate Session Persistence Mechanism
  - [x] Root cause: `useUserStore` used `sessionStorage` which mobile browsers clear on background/lock
  - [x] Fix: Changed `sessionStorage` → `localStorage` in `src/lib/stores/user-store.ts`
- [x] Task 2: Refactor Persona Hydration
  - [x] Updated `PersonaGuard` hydration initialization so already-hydrated sessions render immediately without a spinner flash.
  - [x] Confirmed guarded routes still redirect to `/` only after hydration when no persona is selected.
- [x] Task 3: Handle Security / Timeouts (Optional but good practice)
  - [x] Indefinite persistence is appropriate for workshop prototype. `clearPersona()` exists for explicit logout.
  - [x] Verified `src/middleware.ts` does not add persona-specific redirects or conflict with localStorage-backed session persistence.

## Dev Notes

Ultimate context engine analysis completed - comprehensive developer guide created

### Technical Requirements
- The application uses simulated auth with hardcoded profiles (Sarah, Michael, Guest, Kim, Hilary).
- UUIDs are not used for auth. Instead, string-based Persona IDs (e.g., 'sarah', 'kim') are passed.
- The `useUserStore` (if it's a Zustand store) needs to persist the active `personaId` across browser sessions. Since it's a web application, `localStorage` is acceptable for a PWA-style prototype without real auth constraints.
- Make sure to review `middleware.ts` if route protection is checking cookies. Simulated auth means `middleware.ts` might be relying on cookies to know if someone is logged in. If hydration relies on `localStorage` but `middleware.ts` redirects to login because of missing cookies, there will be a conflict. 
- If `middleware.ts` is involved, ensure cookies are set alongside `localStorage` when a persona is selected (e.g., set a `personaId` cookie).

### Architecture Compliance
- **Auth Strategy**: "No Auth Flow (Simulated Profiles)". The fix must stick to this pattern. Do not implement Supabase Auth.
- **State Layer**: Zustand is the standard for client state.
- **Data Boundaries**: Wait until Zustand is hydrated or check `personaId` cookie before rejecting the user.

### Library / Framework Requirements
- Zustand (use `persist` middleware from `zustand/middleware` if using Zustand for persona state)
- Next.js 14 App Router (Cookies API from `next/headers` or `js-cookie` for client-side cookie management if needed for middleware bypass).

### File Structure Requirements
- `src/lib/stores/user-store.ts` (or where the persona state is managed)
- `src/middleware.ts` (verify if route protection is causing the redirect on reload)
- `src/components/patient/persona-selector.tsx` (verify login actions)
- `src/app/kim/page.tsx` and `src/app/hilary/page.tsx` (verify custom login actions)

### Testing Requirements
- Automatically test that after selecting a persona, refreshing the page keeps the user logged in.
- Verify `middleware.ts` correctly handles the persisted state.

### Previous Story Intelligence
- Story 7.5 adjusted all login redirects to `/home`. Ensure the session persistence respects this route or the user's current route when hydrated.
- Story 6.7 refactored state management. Be careful when adding `persist` middleware to ensure it does not break optimistic UI logic.

### Project Structure Notes
- Maintain alignment with unified project structure. State stores belong in `src/lib/stores/`.

### References
- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 7.6]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Authentication & Security]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Store persistence swap plus hydration regression coverage added.

### Completion Notes List

- Changed `sessionStorage` → `localStorage` in Zustand persist config
- Updated `PersonaGuard` to read hydration state synchronously on first render, avoiding a spinner flash on already-hydrated sessions
- Added regression tests for store persistence, `PersonaGuard` hydration flow, and middleware pass-through behavior
- Targeted Story 7.6 and Story 1.3 tests pass locally

### File List

- `src/lib/stores/user-store.ts` — switched storage backend from `sessionStorage` to `localStorage`
- `src/components/shared/persona-guard.tsx` — initialized hydration state from Zustand persist to prevent flicker on already-hydrated loads
- `src/__tests__/story-7-6-session-persistence.test.ts` — new store persistence test file (7 tests)
- `src/__tests__/story-7-6-persona-guard-and-middleware.test.tsx` — new regression tests for guard hydration and middleware pass-through
- `src/__tests__/story-1-3-persona-selector.test.ts` — updated comment (sessionStorage → localStorage)
- `_bmad-output/implementation-artifacts/7-6-session-persistence-fix.md` — updated status and tasks
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — updated status to done
