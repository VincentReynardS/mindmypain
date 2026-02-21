# Story 4.1: Guest Persona & Safe Mode

Status: done

## Story

As a workshop participant,
I want to select a "Guest" persona from the login screen,
so that I can enter the app with a clean slate without prior history.

## Acceptance Criteria

1. **Given** the user lands on the root url `/`
2. **When** the page loads
3. **Then** they should see a third card for "Guest" alongside Sarah and Michael
4. **And** Clicking it sets the active `personaId` to `guest` and creates a fresh state for logging
5. **And** No seed data should be pre-loaded for the Guest persona.

## Tasks / Subtasks

- [x] Task 1: Update Persona Selector UI (AC: 1-3)
  - [x] Add a third "Start as Guest" card to the persona selector page (`/app/page.tsx` or related component).
  - [x] Use `calm` tokens for styling.
  - [x] Ensure the card matches the design pattern of Sarah and Michael cards.

- [x] Task 2: Implement Guest Persona Logic (AC: 4)
  - [x] Update `useUserStore` or context to support a `guest` persona ID.
  - [x] Clicking the new card should set `personaId` to `guest`.

- [x] Task 3: Ensure Empty State (AC: 5)
  - [x] Verify that when `personaId` is `guest`, the `journal_entries` queries or server actions return an empty array or no seeded data is presented.
  - [x] Include Dev UI testing to confirm the empty slate before navigating through tabs.

## Dev Notes

- **Authentication Check Warning**: MINDmyPAIN intentionally skips standard session-based user auth using `supabase.auth.getUser()`. Do not add session checks; rely on the string-based Persona ID (`guest`) passed from the client store.
- **Styling Details**: Use Tailwind CSS with the predefined `calm` tokens. Ensure touch target accessibility (>44px).
- **Architecture Notes**: Rely on `useUserStore` (Zustand) with atomic selectors. No data migration needed, just UI changes and ensuring that a non-existing persona (`guest`) yields 0 entries from Supabase.
- **Learnings from Previous Epics**: Ensure developers explicitly conduct a manual UI clicking pass before calling this done. Watch out for caching issues with `revalidatePath` if applicable, although this story might only touch client state and read queries.

### Project Structure Notes

- Patient view routing applies: The persona selector is likely at `/app/page.tsx` or `components/patient/persona-selector.tsx`.
- The new condition for "guest" should be treated on par with "sarah" and "michael" in `useUserStore` and related data fetching hooks/actions.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1]
- [Source: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used

Antigravity (Gemini)

### Debug Log References

- Addressed Adversarial Code Review finding for `useUserStore` shared state collision.
- Implemented temporary, transient UUID isolation to the guest persona in `user-store.ts`.

### Completion Notes List

- Updated `PersonaSelector` to add `Guest` cleanly.
- Implemented dynamic avatar styling for `MobileHeader` in `user-store.ts`.
- Manually tested UI flow for Guest isolation and empty states on `/` and `/journal`.

### File List

- `src/components/patient/persona-selector.tsx`
- `src/lib/stores/user-store.ts`
- `src/components/patient/mobile-header.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/4-1-guest-persona-safe-mode.md`
