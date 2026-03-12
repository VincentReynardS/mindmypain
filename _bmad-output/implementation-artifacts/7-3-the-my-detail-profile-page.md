# Story 7.3: the-my-detail-profile-page

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want a dedicated form to manage my static medical and personal demographics,
so that I don't have to repeatedly enter standard context (like allergies or name changes).

## Acceptance Criteria

1. **Given** the Profile avatar menu
2. **When** I click "My Detail"
3. **Then** I am taken to a form mapping to the `profiles` table schema
4. **And** I can edit fields like Name, DOB, Address, Medicare No, Languages spoken, Allergies, etc.

## Tasks / Subtasks

- [ ] Task 1: Create "My Detail" Page Route and UI
  - [ ] Create route `/app/profile/my-detail` (or similar).
  - [ ] Add navigation link to the Profile avatar menu to point to this new detail page.
  - [ ] Build a form UI covering the `profiles` table fields (`full_name`, `dob`, `address_line_1`, `address_line_2`, `email`, `mobile_phone`, `home_phone`, `medicare_irn`, `medicare_valid_to`, `phi_name`, `phi_number`, `is_organ_donor`, `emergency_contact_name`, `emergency_contact_relationship`, `emergency_contact_mobile`, `languages_spoken`, `is_aboriginal`, `is_torres_strait_islander`, `allergies`).
- [ ] Task 2: Implement Data Fetching
  - [ ] Create a Supabase server action or query to fetch the current user's profile from the `profiles` table based on `UserContext` persona.
- [ ] Task 3: Implement Form Submission and Update
  - [ ] Create a Supabase server action to update the `profiles` table.
  - [ ] Wire up the form to submit and display success/error states.
  - [ ] Ensure optimistic UI updates or revalidation upon success.

## Dev Notes

### Technical Requirements
- Form must include all columns from the `profiles` schema: `id` (references simulated user), `full_name`, `dob`, `address_line_1`, `address_line_2`, `email`, `mobile_phone`, `home_phone`, `medicare_irn`, `medicare_valid_to`, `phi_name`, `phi_number`, `is_organ_donor`, `emergency_contact_name`, `emergency_contact_relationship`, `emergency_contact_mobile`, `languages_spoken`, `is_aboriginal`, `is_torres_strait_islander`, `allergies`.
- Follow the existing "Simulated Profiles" pattern where the app uses `UserContext` instead of standard Auth. Fetch the profile matching the current persona (`Sarah`, `Michael`, or `Guest` etc). 
- Use the design system tokens for a "Calm" aesthetic, avoiding complex or intimidating medical forms.

### Architecture Compliance
- Use Shadcn UI components for the form elements (Inputs, DatePicker, Checkboxes for booleans like `is_organ_donor`).
- State management for the form should use React Hook Form + Zod for validation, which is standard with Shadcn forms.
- Data fetching should align with the `@supabase/ssr` server actions pattern established in the project.

### Library / Framework Requirements
- Next.js 14 App Router
- Tailwind CSS & Shadcn UI
- `@supabase/ssr`

### File Structure Requirements
- `src/app/(patient)/profile/my-detail/page.tsx` (or equivalent structure for the page)
- `src/components/patient/my-detail-form.tsx` (the form component)
- `src/lib/actions/profile.ts` (for server actions related to profiles)

### Testing Requirements
- Form validation should prevent submitting invalid data (e.g., malformed email).
- Mock the Supabase client to test data fetching and updating.
- Verify that navigating from the Avatar menu correctly routes to the new page.

### Previous Story Intelligence
- Story 7.1 recently updated date formatting to be `dd-mm-yyyy`. Ensure any date fields (like `dob`, `medicare_valid_to`) strictly adhere to this format for consistency.
- Story 7.2 improved mobile UI responsiveness for inputs; ensure the long demographic form is fully usable and responsive on mobile devices (e.g., proper padding, input heights, and no horizontal scroll).

### Project Structure Notes
- Alignment with unified project structure: The new routes and components should follow the existing `app/(patient)` pattern since this is a patient-facing feature.
- Follow the existing `UserContext` for fetching the current user identity instead of a real Supabase Auth session.

### References
- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 7.3]
- [Source: `_bmad-output/planning-artifacts/prd.md`#FR_SJ6]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Database Schemas]

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

### Completion Notes List

### File List
