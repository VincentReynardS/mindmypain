# Story 3.4: Scripts and Referrals Table

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want to see a clear checklist of my pending prescriptions and referrals,
So that I can manage my pharmacy visits and admin tasks efficiently.

## Acceptance Criteria

1. **Given** the user navigates to the Scripts & Referrals tab (`/app/scripts`)
2. **When** the view loads
3. **Then** it should display a data table or checklist view
4. **And** the table should have columns/states for: Medication/Referral Name, To Be Filled, Filled (checkbox/toggle).
5. **And** toggling the "Filled" state updates the entry's completion status in the database.

## Tasks / Subtasks

- [x] Task 1: Create Scripts and Referrals Route & Layout (AC: 1, 2)
  - [x] Subtask 1.1: Create `src/app/(patient)/scripts/page.tsx`. Use the same padded container layout mechanism found in `appointments` and `medications` pages.
  - [x] Subtask 1.2: Fetch data from the `journal_entries` table specifically filtering by relevant `entry_type` (e.g., `script` or `referral`).
- [x] Task 2: Implement Scripts Data Table / Checklist UI (AC: 3, 4)
  - [x] Subtask 2.1: Create `src/components/patient/scripts-list.tsx` styling with `bg-calm-surface-raised` and `calm` tokens.
  - [x] Subtask 2.2: Parse JSON `content` fields to extract list item details: Name, Dates, Formatted Completion Status.
- [x] Task 3: Implement Update Actions (AC: 5)
  - [x] Subtask 3.1: Add/Evaluate Server Action in `src/app/actions/journal-actions.ts` to handle toggling the `Filled` state of specific script/referral items. Ensure cache path revalidation.
- [x] Task 4: Testing & Polish
  - [x] Subtask 4.1: Write component tests in `src/__tests__/scripts-list.test.tsx` ensuring interactions invoke server actions accurately.

## Dev Notes

### Technical Requirements

- **Architecture:** Client/Server separation. Page fetching should be Server Component. Interactivity (checkbox toggling) should be Client Component.
- **State Management:** Leverage Server Actions for updates rather than Zustand, passing action gracefully to the UI component.
- **Security Context:** Ensure you match the Persona-based Auth Context. Use Persona IDs (not UUIDs) and avoid `auth.uid()` checks in Server Actions, consistent with current patterns.

### Architecture Compliance

- Use `bg-calm-surface-raised` and `calm` text semantics for accessibility and aesthetic matching.
- Touch targets must be >= 44px (e.g., checkbox size/padding).
- Build strictly using Tailwind CSS and Radix UI/Shadcn UI primitives as defined by existing project UI standards.

### File Structure Requirements

- **Components:** `src/components/patient/scripts-list.tsx`
- **Pages:** `src/app/(patient)/scripts/page.tsx`
- **Actions:** Check `src/app/actions/journal-actions.ts`.

### Testing Requirements

- **Vitest:** Provide a component test file: `src/__tests__/scripts-list.test.tsx`.
- Cover reading state, toggling checklist item, and verifying the server action is triggered.

### Previous Story Intelligence

- **Code Pattern Established:** Look at `src/app/(patient)/medications/page.tsx` and `src/components/patient/medication-glass-box.tsx` for referencing how JSON payload is updated & validated.
- **Cache Revalidation:** Ensure `revalidatePath('/app/(patient)/scripts')` or accurate relative route path (`/scripts`) is strictly used after the server action mutation.
- **URL Routing issues:** In previous stories, testing struggled with mismatched Next.js paths. Ensure URL testing matches Next routing strictly.
- **Vulnerabilities Avoided:** Follow explicit instruction to skip `supabase.auth.getUser()` session checks as per `project-context.md`.

### Project Context Reference

- **Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, Shadcn.
- **Role:** Maintain mobile-first responsive duality, zeroing in strictly on the `(patient)` route layout.
- **Design:** Use clear distinction between pending ("To Be Filled") and complete ("Filled") visual states using the `calm` token set.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4: Scripts and Referrals Table]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/project-context.md]
- [Source: _bmad-output/implementation-artifacts/3-3-medication-record-glass-box.md]

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

### Completion Notes List

- Created `ScriptsList` component reproducing checklist patterns and adhering to `calm` design tokens with togglable features.
- Implemented Vitest component testing for `ScriptsList` covering state toggles and read-only views.
- Added `updateScriptOrReferralEntry` server action referencing existing `journal-actions.ts` securely without IDOR checks.
- Architected `src/app/(patient)/scripts/page.tsx` to handle parsing and displaying script/referral agendas.
- [AI Review Fix] Removed `script-actions.ts` zombie file, corrected 44px touch targets on checkbox, fixed `/scripts` cache revalidation path, and added optimistic error fallback + optimal JSON fetching.

### File List

- `src/components/patient/scripts-list.tsx`
- `src/__tests__/scripts-list.test.tsx`
- `src/app/actions/journal-actions.ts`
- `src/app/(patient)/scripts/page.tsx`
