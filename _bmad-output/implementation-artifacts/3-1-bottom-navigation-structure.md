# Story 3.1: Bottom Navigation Structure

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want to navigate between different sections of my journal (Home, Appointment, Medication, Scripts & Referrals),
So that I can organize and find my health records logically.

## Acceptance Criteria

1. **Given** the user is viewing the `/app/(patient)` layout
2. **When** they look at the bottom of the screen
3. **Then** they should see a fixed tab bar with icons for: Home, Appointment, Medication, Scripts
4. **And** Tap interactions should route to respective views (`/app/journal`, `/app/appointments`, `/app/medications`, `/app/scripts`)

## Tasks / Subtasks

- [x] Task 1: Create Bottom Navigation Component (AC: 1, 2, 3)
  - [x] Subtask 1.1: Create `PatientBottomNav` component in `src/components/patient/bottom-nav.tsx`
  - [x] Subtask 1.2: Select appropriate icons from `lucide-react` (e.g., Home, CalendarHeart/Calendar, Pill, FileBox/FileText)
  - [x] Subtask 1.3: Apply "Calm" semantic tokens and ensure touch targets are strictly >44px (NFR_ACC2).
- [x] Task 2: Implement Routing Definitions (AC: 4)
  - [x] Subtask 2.1: Add `app/(patient)/appointments/page.tsx`, `app/(patient)/medications/page.tsx`, `app/(patient)/scripts/page.tsx` as basic stubs.
  - [x] Subtask 2.2: Ensure `Link` tags prefetch paths but visually display active state based on Next.js `usePathname()`.
- [x] Task 3: Integrate Navigation into Patient Layout (AC: 1, 2, 3, 4)
  - [x] Subtask 3.1: Mount `PatientBottomNav` into `src/app/(patient)/layout.tsx` so it appears consistently.
  - [x] Subtask 3.2: Ensure Mobile-First Responsive display (sticky to bottom, adequate padding for scrolling content).

## Dev Notes

- **Architecture:** Must respect strictly `app/(patient)` route grouping boundary.
- **Accessibility:** Touch targets MUST be >44px for users with motor impairments (WCAG 2.1 AA requirement).
- **Styling:** Adhere to Tailwind custom tokens. The layout is mobile-first vertical alignment.
- **Tools:** Use `next/navigation` (`usePathname`) for active state detection. Use `lucide-react` for visually calming icon representations.

### Project Structure Notes

- Alignment with unified project structure: The `bottom-nav.tsx` belongs in `src/components/patient/`.
- The new routes go into `src/app/(patient)/`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1: Bottom Navigation Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/prd.md#Accessibility (WCAG 2.1 AA)]

## Dev Agent Record

### Agent Model Used

Gemini

### Debug Log References

- Addressed vitest failing for `usePathname` matching in `src/__tests__/patient-bottom-nav.test.tsx`.

### Completion Notes List

- Successfully implemented `PatientBottomNav` with Home, Appointments, Medications, and Scripts links, using `usePathname` to figure out the active link dynamically.
- Applied Calm aesthetic tokens (`bg-calm-surface-raised`, `text-calm-text`, `text-calm-blue` for active) and ensure touch targets are at least 44px (`min-h-[44px] min-w-[44px]`).
- Set up route stubs for Appointments, Medications, and Scripts pages inside `src/app/(patient)/*`.
- Tested the routing and active links using `vitest` for all pages.
- Tested and successfully mounted the bottom nav inside `src/app/(patient)/layout.tsx`. All tests passing.
- [AI-Review] Fixed HIGH severity iOS safe area insect layout padding bug.
- [AI-Review] Improved ARIA label accessibility and touch targets (48px strict).
- [AI-Review] Improved unit tests to explicitly check imported React components.

### File List

- `src/components/patient/bottom-nav.tsx`
- `src/app/(patient)/appointments/page.tsx`
- `src/app/(patient)/medications/page.tsx`
- `src/app/(patient)/scripts/page.tsx`
- `src/app/(patient)/layout.tsx`
- `src/__tests__/patient-bottom-nav.test.tsx`
- `src/__tests__/patient-routing-stubs.test.tsx`
- `src/__tests__/patient-layout-integration.test.tsx`
