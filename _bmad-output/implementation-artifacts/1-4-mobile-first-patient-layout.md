# Story 1.4: Mobile-First Patient Layout

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want the app interface to feel calm and accessible on mobile,
So that I can use it comfortably even during a pain flare.

## Acceptance Criteria

1. **Given** the user is on a mobile device
   **When** they navigate to any `/app/(patient)` route
   **Then** they should see a dedicated mobile layout (bottom nav or simple header)
   **And** The color palette should use the "Calm" tokens (soft blues/greens, no harsh contrasts)
   **And** Touch targets for primary actions should be >44px
   **And** This layout should be distinct from the Desktop Researcher dashboard

## Tasks / Subtasks

- [x] Task 1: Create Mobile Layout Components (AC: 1)
  - [x] Create `src/components/patient/mobile-header.tsx`
    - [x] Render "MINDmyPAIN" logo/text
    - [x] Include user avatar/persona indicator (from `useUserStore`)
    - [x] Use "Calm" tokens (`bg-calm-surface-raised`, `text-calm-text`)
  - [x] No bottom nav needed yet — only one route active (`/journal`). Header satisfies "bottom nav or simple header" AC.

- [x] Task 2: Update Patient Layout (AC: 1)
  - [x] Modify `src/app/(patient)/layout.tsx`
  - [x] Import and render `MobileHeader` above `<main>` content
  - [x] Keep `max-w-lg mx-auto` centering and `bg-calm-surface` background
  - [x] Ensure `PersonaGuard` from Story 1.3 is still wrapping content
  - [x] Touch targets >44px (header persona indicator h-11/w-11 = 44px)

- [x] Task 3: Verify Responsive Constraints (AC: 1)
  - [x] Layout constrains width via `max-w-lg` + `mx-auto` (mobile simulation on desktop)
  - [x] Distinct from wizard dashboard (uses route group `(patient)`, not `(wizard)`)

- [x] Task 4: Tests (AC: 1)
  - [x] Create `src/__tests__/story-1-4-mobile-layout.test.ts`
  - [x] Test: MobileHeader exports as named function
  - [x] Test: Persona name available from store for Sarah/Michael/null
  - [x] Test: PatientLayout exports as default function
  - [x] Test: PersonaGuard still exported
  - [x] Test: Calm token compliance (static source analysis)
  - [x] Test: Sticky positioning in header
  - [x] Test: max-w-lg constraint in layout
  - [x] Verify build passes: `npm run build` — 0 errors
  - [x] Verify lint passes: `npm run lint` — 0 errors (2 pre-existing warnings)

## Dev Notes

### Architecture Compliance

- **Route Groups:** Work strictly within `src/app/(patient)`. Did NOT touch `(wizard)` routes.
- **Component Location:** `src/components/patient/mobile-header.tsx` per architecture.md pattern.
- **Styling:** Used `globals.css` "Calm" tokens only. No hardcoded hex values.
- **Responsive:** Mobile-first. Patient view constrained to `max-w-lg` on desktop.
- **State Management:** Atomic Zustand selectors: `useUserStore((s) => s.personaName)`.

### Previous Story Intelligence

**From Story 1.3:**

- `PersonaGuard` existed and works correctly. Kept intact in layout.
- Fixed pre-existing lint error in `persona-guard.tsx`: moved synchronous `setHasHydrated(true)` from useEffect body to `useState` initializer to satisfy `react-hooks/set-state-in-effect` rule.
- `useUserStore` provides `personaName` — used for header display.

### References

- [Epics: Story 1.4](file:///Users/vincent_reynard/Developments/PROJECTS/mindmypain/_bmad-output/planning-artifacts/epics.md#story-14-mobile-first-patient-layout)
- [Architecture: Mobile-First](file:///Users/vincent_reynard/Developments/PROJECTS/mindmypain/_bmad-output/planning-artifacts/architecture.md#project-context-analysis)
- [UX: Design System](file:///Users/vincent_reynard/Developments/PROJECTS/mindmypain/_bmad-output/planning-artifacts/ux-design-specification.md#design-system-foundation)

## Dev Agent Record

### Agent Model Used

Claude (Antigravity)

### Debug Log References

- Fixed pre-existing lint error in `persona-guard.tsx`: `react-hooks/set-state-in-effect` — moved synchronous `hasHydrated()` check to `useState` initializer.

### Completion Notes List

- Created `MobileHeader` component with "MINDmyPAIN" branding (left) and persona name + user icon (right) using Calm design tokens.
- Updated patient layout to render MobileHeader inside PersonaGuard, above main content.
- Header uses sticky positioning with `backdrop-blur-sm` for a polished scroll effect.
- Persona indicator uses atomic Zustand selector `useUserStore((s) => s.personaName)`.
- Wrote 13 Vitest tests covering module exports, store integration, Calm token compliance, and accessibility.
- Fixed pre-existing lint error in `persona-guard.tsx` (set-state-in-effect rule).
- All 52 tests pass (13 new + 39 regression), build 0 errors, lint 0 errors.
- Browser verification confirms: header visible, persona displayed, calm colors applied, content constrained to mobile width.

### Change Log

- 2026-02-18: Story 1.4 implemented -- mobile header, layout update, tests, lint fix
- 2026-02-18: Code review fixes -- H1 touch target (h-8->h-11), H2 h1->span, M2 aria-label, M3 aria-hidden, H3+L1 test improvements, 3 new accessibility tests

### File List

- src/components/patient/mobile-header.tsx (NEW)
- src/**tests**/story-1-4-mobile-layout.test.ts (NEW)
- src/app/(patient)/layout.tsx (MODIFIED -- added MobileHeader import and render)
- src/components/shared/persona-guard.tsx (MODIFIED -- fixed lint error: useState initializer)

## Senior Developer Review (AI)

**Date:** 2026-02-18
**Outcome:** Approve (after fixes)
**Issues Found:** 3 High, 3 Medium, 2 Low
**Issues Fixed:** 6 (all HIGH + MEDIUM)

### Action Items

- [x] [H1] Touch target below 44px (h-8 -> h-11)
- [x] [H2] Duplicate h1 heading conflict (h1 -> span)
- [x] [H3] Tests used fragile fs.readFileSync per-test (hoisted to module level + added accessibility tests)
- [x] [M1] Header border full-bleed acknowledged as intentional design
- [x] [M2] Missing aria-label on header landmark (added)
- [x] [M3] Persona indicator looks interactive but isn't (added aria-hidden + aria-label)
