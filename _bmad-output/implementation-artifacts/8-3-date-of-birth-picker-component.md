# Story 8.3: 8-3-date-of-birth-picker-component

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want a calendar or wheel picker for entering my Date of Birth,
So that I don't struggle to format it correctly as dd-mm-yyyy.

## Acceptance Criteria

1. **Given** the "My Detail" profile page
   **When** I click the Date of Birth field
   **Then** a native date picker (or Shadcn Calendar) is displayed
   **And** the chosen date is automatically formatted properly for the backend schema

## Tasks / Subtasks

- [ ] Implement Date Picker in Profile Form (AC: 1)
  - [ ] Update the Date of Birth field in the `My Detail` profile page (`src/app/(patient)/profile` or similar) to use a native date picker or Shadcn Calendar component.
  - [ ] Ensure the selected date is parsed and formatted correctly for the backend schema (`dd-mm-yyyy` as per Epic 7.1/Architecture constraints).
- [ ] Add Tests (AC: 1)
  - [ ] Add unit/integration tests to verify the Date of Birth picker works correctly and formats the date appropriately.

## Dev Notes

- **Architecture:** The application uses Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI, and Supabase. The profile form should use Shadcn UI components (e.g., `Popover`, `Calendar`, `Button`) combined with `date-fns` for date formatting.
- **Data Model:** The `profiles` table stores demographics. Date of Birth needs to be properly synced with the `dob` field in Supabase.
- **Previous Story Intelligence:** In Epic 7, the `dd-mm-yyyy` format was established globally. Ensure this Date Picker strictly adheres to `dd-mm-yyyy` format for both display and storage/submission to backend to avoid logic errors.

### Project Structure Notes

- **Components:** Use `components/ui/calendar.tsx` (Shadcn) if available, or native `<input type="date">` with specific formatting wrappers. Shadcn is preferred per architecture.
- **State Management:** Use atomic selectors if relying on Zustand, or standard React Hook Form with Zod for form state.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.3: Date of Birth Picker Component]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (Low)

### Debug Log References

### Completion Notes List
- Ultimate context engine analysis completed - comprehensive developer guide created

### File List

