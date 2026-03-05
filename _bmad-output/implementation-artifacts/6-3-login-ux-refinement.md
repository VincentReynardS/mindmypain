# Story 6.3: Login UX Refinement

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a visible "Login" button on the login screen,
so that I don't have to manually press 'enter' inside the text box when a password manager auto-fills the field.

## Acceptance Criteria

1. **Given** the `/kim` login screen
   **When** I view the form
   **Then** there is a clearly labeled "Login" button (not "Enter")

2. **Given** a password manager auto-fills the password field
   **When** I click the "Login" button
   **Then** it authenticates without requiring a manual 'enter' keystroke inside the input field

3. **Given** the password input
   **When** the form is rendered
   **Then** proper `<label>` elements exist for accessibility and password manager compatibility

4. **Given** the login form
   **When** I submit via keyboard (pressing Enter in the input)
   **Then** it still works exactly as before (no regression)

## Tasks / Subtasks

- [x] Task 1: Update button label and form semantics on `/kim` page (AC: 1, 2, 3, 4)
  - [x] Change the submit button text from `"Enter"` to `"Login"` (and loading state from `"Verifying..."` to `"Logging in..."`)
  - [x] Add a `<label htmlFor="password">` element associated with the password input for screen reader and password manager compatibility
  - [x] Add `id="password"` and `name="password"` attributes to the password input
  - [x] Add `autoComplete="current-password"` to the password input to help password managers identify the field
  - [x] Verify `type="submit"` is on the button (already present)
  - [x] Keep `autoFocus` on the input (already present)

- [x] Task 2: Visual polish — ensure button is prominent and tappable (AC: 1)
  - [x] Button must maintain `min-h-[44px]` touch target (already present)
  - [x] Consider adding a lock or login icon from `lucide-react` to reinforce the action visually
  - [x] Maintain `calm-*` token styling (already present)

- [x] Task 3: Manual browser testing (AC: 1, 2, 3, 4)
  - [x] Navigate to `/kim`, verify "Login" button is visible and styled correctly
  - [x] Test keyboard submit (type password, press Enter) — should work
  - [x] Test button click submit — should work
  - [x] Test empty password — button should be disabled
  - [x] Test incorrect password — error message should display
  - [x] Verify calm design aesthetic is preserved

## Dev Notes

### Current Implementation

The login page lives at `src/app/kim/page.tsx` (71 lines). It's a `"use client"` component with a simple form:

```
<form onSubmit={handleSubmit}>
  <input type="password" placeholder="Enter password" autoFocus ... />
  <button type="submit">{loading ? "Verifying..." : "Enter"}</button>
</form>
```

**What needs to change:**
- Button text: `"Enter"` → `"Login"` (and `"Verifying..."` → `"Logging in..."`)
- Add `<label>` for the password input
- Add `id`, `name`, and `autoComplete` attributes to the input

The server action at `src/app/kim/actions.ts` does NOT change — it's a simple env-var comparison (`verifyKimPassword`).

### Password Manager Compatibility

Modern password managers (1Password, Bitwarden, LastPass) rely on:
1. `<label>` tags associated with password inputs
2. `autoComplete="current-password"` attribute on the input
3. Submit button text like "Login", "Sign In" (not generic "Enter")
4. `name="password"` attribute on the input

Adding these semantic HTML attributes fixes the auto-fill trigger issue without changing any logic.

### Scope Boundary

This story is ONLY about the `/kim` login page. Story 6.6 (Hilary's Account) will create a similar page — the dev agent for 6.6 should copy the improved pattern from this story.

Do NOT:
- Modify the main `PersonaSelector` component
- Add Kim to the main persona selector
- Change the `user-store.ts` or any Zustand store
- Modify server actions or authentication logic
- Touch any other route or page

### Files to Modify

| File | Change |
|------|--------|
| `src/app/kim/page.tsx` | Update button text, add label, add input attributes |

This is a single-file change.

### Styling

- Use existing `calm-*` tokens (already in place)
- Touch targets >= 44px (already in place)
- Optional: Add `LogIn` icon from `lucide-react` to the button for visual reinforcement
- Transitions: 300ms (already in place via `transition-colors duration-300`)

### Testing

- No unit test changes required (existing tests cover password verification logic)
- Manual browser testing per project-context rule #4

### Project Structure Notes

- No new files or routes created
- No layout changes
- Single component modification in existing route

### Previous Story Intelligence (6.1 & 6.2)

From Story 6.1 (Kim's Account — created this page):
- `/kim` route is at root level (not inside `(patient)` group) — intentional, it's an entry point
- Server action uses env-var `KIMS_PASSWORD` — no change needed
- Kim persona uses `calm-teal` / `calm-teal-soft` CSS tokens
- 8 unit tests exist for this feature in `src/__tests__/story-6-1-kims-account.test.ts`

From Story 6.2 (Archive Feature):
- Added archive link to `mobile-header.tsx` dropdown — not relevant to this story
- No interaction with login flow

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.3-Login-UX-Refinement]
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-03-05.md#Action-1] — Origin of this story
- [Source: src/app/kim/page.tsx] — Current login page (modify target)
- [Source: src/app/kim/actions.ts] — Server action (no change)
- [Source: _bmad-output/implementation-artifacts/6-1-kims-account.md] — Previous story that created this page
- [Source: _bmad-output/project-context.md#Rule-4] — Manual UI testing requirement
- [Source: _bmad-output/project-context.md#Rule-5] — No git commits by AI

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

N/A

### Completion Notes List

- Button text changed from "Enter" → "Login", loading state from "Verifying..." → "Logging in..."
- Added `<label htmlFor="password">` (sr-only) for accessibility and password manager compatibility
- Added `id="password"`, `name="password"`, `autoComplete="current-password"` to input
- Added `LogIn` icon from lucide-react to the submit button
- All 306 existing tests pass, no lint errors
- **Code review fix (H1):** Pre-existing bug from Story 6.1 — `bg-calm-primary`, `focus:ring-calm-primary`, and `border-calm-border` referenced non-existent CSS tokens. `calm-primary` made the button invisible; fixed to `calm-teal`. `calm-border` fixed to `border` (the standard token).
- **Manual UI testing** performed during code review via browser — Login button visible, teal styling correct, disabled state renders at 50% opacity

### File List

- `src/app/kim/page.tsx` — Updated button text, added label, input attributes, login icon, and fixed non-existent CSS tokens
