# Story 7.12: Wave 2 Collaborator Accounts

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a collaborator,
I want explicit, hidden accounts for Ross Mieglich, Joanna Parlapiano, and Joanne Tynan,
So that these stakeholders can test the app securely without interfering with existing user states.

## Acceptance Criteria

1. **Given** the login screen
   **When** I navigate to their precise hidden paths (e.g., `/ross`, `/joanna`, `/joanne`)
   **Then** I am prompted for a password
   **And** upon successful entry, I am logged into their specific persona environment, isolated from other users
   **And** these personas are explicitly NOT visible on the public Persona selection cards

## Tasks / Subtasks

- [x] Task 1: Create a reusable component for hidden persona logins [AI-Review Follow-up from 7.11]
  - [x] Extract the near-identical hidden-persona login logic into a generic `<HiddenPersonaLogin personaId envVar />` component.
  - [x] Implement a single `verifyPersonaPassword(envVar)` server action.
  - [x] Refactor existing hidden personas if applicable (optional but recommended to reduce duplication debt).
- [x] Task 2: Add account entry points for Ross, Joanna, and Joanne
  - [x] Add hidden routes: `/ross`, `/joanna`, `/joanne`.
  - [x] Set `personaId` upon successful login.
- [x] Task 3: Implement password protection for the accounts
  - [x] Implement password prompt specifically for these users utilizing the newly created generic component or the established pattern.
  - [x] Handle successful authentication routing to their environments.
- [x] Task 4: Ensure session persistence
  - [x] Verify that session persistence works for the newly added persona IDs.
- [x] Task 5: Ensure no public visibility
  - [x] Explicitly verify these personas DO NOT appear on the public Persona selection cards.

## Dev Notes

### Technical Requirements
- Standard simulated authentication applies: no real Supabase auth (`supabase.auth.getUser()`). Use the strings `ross`, `joanna`, `joanne` for persona IDs.
- Follow the exact same pattern for `.env.local.example` (add `ROSS_PASSWORD`, `JOANNA_PASSWORD`, `JOANNE_PASSWORD`).

### Architecture Compliance
- **Prototype Auth:** DO NOT implement standard session-based user authentication. Use Zustand state for context switching (`src/lib/stores/user-store.ts`).
- **Manual UI Testing:** Dev agent MUST use the browser subagent to verify the new persona routes render correctly and the password prompt securely blocks unauthorized access. Ensure no cards leaked to `/`.

### Library Framework Requirements
- Next.js (App Router), Zustand (Client state), Tailwind CSS.

### File Structure Requirements
- Check the global store in `src/lib/stores/user-store.ts` to see if personas require explicit enumeration and add the new ones, ensuring they each have a distinctive color slot/icon if required by UI components to prevent collisions. Be mindful of color slots duplicating.
- Consider refactoring duplicate page/action files as noted in previous story intelligence.

### Previous Story Intelligence
- **Story 7.11 (Samuel Hamilton-Smith's Account):** Identified significant duplication debt in hidden personas (`/kim`, `/hilary`, `/mary-lynne`, `/simone`, `/peter`, `/lucille`, `/kimberley`, `/samuel`). The reviewer strongly advised extracting these into a generic `<HiddenPersonaLogin>` component to avoid copying and pasting the form and server actions 3 more times for wave 2. It is highly recommended to address this duplication debt in Task 1.
- **Story 7.6 (Persistent Session):** Established session persistence logic for selected persona. It handles arbitrary persona IDs seamlessly but ensure they are represented properly in the Zustand store.

### Git Intelligence
- Recent commits reflect ongoing Epic 7 work regarding targeted accounts in 7.10 and 7.11.

### Project Structure Notes
- Alignment with unified project structure (paths, modules, naming): Ensure new routes go directly under `src/app/{persona}/page.tsx`.

### References
- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 7.12]
- [Source: `_bmad-output/project-context.md`#Rule 1 Prototype Authentication vs Real Auth]
- [Source: `_bmad-output/project-context.md`#Rule 4 Manual UI Testing Requirement]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation with no blocking issues.

### Completion Notes List

- **Task 1 (Reusable Component):** Extracted `HiddenPersonaLogin` component and `verifyPersonaPassword` generic server action. Created `persona-config.ts` as single source of truth for all 11 hidden persona configs. Refactored all 8 existing persona routes (kim, hilary, mary-lynne, simone, peter, lucille, kimberley, samuel) from ~79-line duplicated pages to ~13-line thin wrappers. Deleted 8 per-route `actions.ts` files. Updated 5 existing test files and 1 UI test file to use the generic server action. Net code reduction: ~400+ lines eliminated.
- **Task 2 (Route Entry Points):** Created `/ross`, `/joanna`, `/joanne` route pages as thin wrappers using the new shared component.
- **Task 3 (Password Protection):** All 3 routes use the `HiddenPersonaLogin` component which prompts for a password, calls `verifyPersonaPassword`, and redirects to `/home` on success. Added `ROSS_PASSWORD`, `JOANNA_PASSWORD`, `JOANNE_PASSWORD` to `.env.local.example`.
- **Task 4 (Session Persistence):** Added `"ross" | "joanna" | "joanne"` to `PersonaId` type union in user-store.ts. Added color assignments (ross=teal, joanna=purple, joanne=rose) and display names to the `selectPersona` function. Zustand persistence middleware handles these IDs via localStorage.
- **Task 5 (No Public Visibility):** Verified via browser test and automated test that the landing page persona selector only shows Guest, Sarah, and Michael — no hidden personas are exposed.

### Change Log

- 2026-04-17: Implemented Story 7.12 — extracted reusable HiddenPersonaLogin component, refactored 8 existing persona routes, added 3 new wave 2 collaborator accounts (Ross, Joanna, Joanne). Addressed duplication debt flagged in Story 7.11 review.
- 2026-04-18: Code review fixes applied (AI review). H1: Removed the two `if/else` ladders in `user-store.ts`; it now derives `displayName`/`iconBg`/`iconText` from `HIDDEN_PERSONAS` + `PUBLIC_PERSONAS` + `ACCENT_ICON_CLASSES` in `persona-config.ts`. M2: Added `.playwright-mcp/` to `.gitignore` so future browser-subagent artifacts don't leak. M3 + L3: Rewrote `story-7-12-…test` (renamed to `.tsx`) to use static imports (removes the Vite dynamic-import warning) and mount-based regression check against `PersonaSelector`. L1: Typed `HIDDEN_PERSONAS` with `as const satisfies` + added an `isHiddenPersonaId` guard in `verify-persona-password.ts` so arbitrary string IDs can't silently return `undefined`. Color-slot collisions (M1) acknowledged and intentionally left as-is; password rate-limiting (M4) deferred. Acknowledged follow-ups: `PersonaId` literal union is still `| (string & {})` to accommodate transient guest IDs — precise typing (e.g. `` `guest_${string}` ``) would require tightening all call sites (out of scope).

### File List

**New files:**
- `src/lib/persona-config.ts` — Persona configuration registry (single source of truth); includes `HIDDEN_PERSONAS`, `PUBLIC_PERSONAS`, `KNOWN_PERSONAS`, `ACCENT_ICON_CLASSES`
- `src/app/actions/verify-persona-password.ts` — Generic server action for password verification (typed via `isHiddenPersonaId` guard)
- `src/components/shared/hidden-persona-login.tsx` — Reusable hidden persona login component
- `src/app/ross/page.tsx` — Ross login route
- `src/app/joanna/page.tsx` — Joanna login route
- `src/app/joanne/page.tsx` — Joanne login route
- `src/__tests__/story-7-12-wave-2-collaborator-accounts.test.tsx` — Test file (34 tests, mount-based regression check)

**Modified files:**
- `src/lib/stores/user-store.ts` — Refactored to derive `displayName`/`iconBg`/`iconText` from `persona-config.ts`; removed duplicated `if/else` ladders for ids and colors
- `.gitignore` — Added `.playwright-mcp/` so browser-subagent console/page artifacts don't leak into the repo
- `src/app/kim/page.tsx` — Refactored to thin wrapper using HiddenPersonaLogin
- `src/app/hilary/page.tsx` — Refactored to thin wrapper using HiddenPersonaLogin
- `src/app/mary-lynne/page.tsx` — Refactored to thin wrapper using HiddenPersonaLogin
- `src/app/simone/page.tsx` — Refactored to thin wrapper using HiddenPersonaLogin
- `src/app/peter/page.tsx` — Refactored to thin wrapper using HiddenPersonaLogin
- `src/app/lucille/page.tsx` — Refactored to thin wrapper using HiddenPersonaLogin
- `src/app/kimberley/page.tsx` — Refactored to thin wrapper using HiddenPersonaLogin
- `src/app/samuel/page.tsx` — Refactored to thin wrapper using HiddenPersonaLogin
- `.env.local.example` — Added ROSS_PASSWORD, JOANNA_PASSWORD, JOANNE_PASSWORD
- `src/__tests__/story-6-1-kims-account.test.ts` — Updated server action import to generic
- `src/__tests__/story-6-6-hilarys-account.test.ts` — Updated server action import to generic
- `src/__tests__/story-6-6-hilarys-login-ui.test.tsx` — Updated mock to generic verifyPersonaPassword
- `src/__tests__/story-7-9-mary-lynnes-account.test.ts` — Updated server action import to generic
- `src/__tests__/story-7-10-additional-collaborator-accounts.test.ts` — Updated server action imports to generic
- `src/__tests__/story-7-11-samuels-account.test.ts` — Updated server action import to generic
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Story status updated to review
- `_bmad-output/implementation-artifacts/7-12-wave-2-collaborator-accounts.md` — Story file updated

**Deleted files:**
- `src/app/kim/actions.ts`
- `src/app/hilary/actions.ts`
- `src/app/mary-lynne/actions.ts`
- `src/app/simone/actions.ts`
- `src/app/peter/actions.ts`
- `src/app/lucille/actions.ts`
- `src/app/kimberley/actions.ts`
- `src/app/samuel/actions.ts`
