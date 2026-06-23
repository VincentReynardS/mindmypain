# Story 8.4: healthcare-team-tracking-feature

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want a dedicated "Team" tab to see my healthcare providers,
so that I can track their profession, name, address, email, and phone number.

## Acceptance Criteria

1. **Given** the bottom navigation
   **When** I tap the "Team" button
   **Then** I am taken to a list of my care team displayed as cards
   **And** I can add new team members via the voice/text input box on the home page

## Tasks / Subtasks

- [ ] Add "Team" Tab to Bottom Navigation
  - [ ] Update the bottom navigation component to include a "Team" tab routing to `/team` (or `/app/team`).
- [ ] Create Team Member List View
  - [ ] Implement `src/app/(patient)/team/page.tsx` displaying a list of healthcare providers with the header "Team" and subheader "Your active teams."
  - [ ] Create a `TeamMemberCard` (or `TeamMemberGlassBox`) component.
  - [ ] **UI Details for Card**:
    - Left-hand colored border (e.g., green for active).
    - Top row actions: Yellow pill buttons for "Book online", "Call", "Message", and a standard "Edit" button with an icon.
    - Fields to display (uppercase labels): PROFESSION, NAME, ADDRESS, EMAIL, PHONE.
- [ ] Smart Parser Integration
  - [ ] Update `smart-parser.ts` to recognize when a user adds a healthcare provider via voice/text input on the home page.
  - [ ] Map parsed fields (profession, name, address, email, phone) to the expected JSON schema.
- [ ] Data Model Updates
  - [ ] Ensure the new `entry_type` (e.g., `TEAM_MEMBER`) is supported in the `journal_entries` table (if using the established Glass Box pattern for structured data).

## Dev Notes

- **Data Model:** Team members should follow the established pattern for structured data (like Medications or Appointments) using the `journal_entries` table with a specific `entry_type` (e.g., `TEAM_MEMBER`), and a JSON payload for the specific fields (Profession, Name, Address, Email, Phone).
- **Architecture Compliance:** 
  - Ensure the new `/team` route is inside the `(patient)` layout.
  - Use Shadcn UI components for cards and layout to maintain the "Calm" design system tokens.
  - All data mutations must happen via Server Actions.
- **Previous Story Intelligence:** 
  - In Epic 8.3, we learned to be strict with data payloads and not add unrequested default behaviors (like defaulting DOB to today). Ensure the Smart Parser handles missing contact information gracefully (leave as null/empty string) rather than hallucinating details.
  - From Epic 7.1/8.3, ensure any dates (if added) use `dd-mm-yyyy`.

### Project Structure Notes

- **Route:** `src/app/(patient)/team/page.tsx`
- **Components:** `src/components/patient/team-member-glass-box.tsx` or similar.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.4: Healthcare Team Tracking Feature]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (Low)

### Debug Log References
- Ultimate context engine analysis completed - comprehensive developer guide created

### Completion Notes List

### File List
