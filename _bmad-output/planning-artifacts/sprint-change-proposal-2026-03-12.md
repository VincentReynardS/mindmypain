# Sprint Change Proposal: Core Refinements & Functional Expansion

Date: 2026-03-12
Trigger: Post-Epic 6 tester feedback (Kim & Hilary) identifying P0 and P1 UX/UI issues and missing static data handling.

## Section 1: Issue Summary

Following the rollout of Epic 6, testing feedback revealed critical gaps in the core journaling experience that need to be addressed before extending the application to the "Wizard" functionality (Researcher Dashboard). Specific issues identified included UI bugs on mobile (truncated inputs, lack of text wrapping), missing static health data inputs (Patient Demographics/My Details, Immunisation records), lack of journal filtering, and poor handling of parsed relative dates. Continuing to Epic 7 (Wizard Dashboard) without resolving these issues would result in a fragile user experience and confusing documentation.

## Section 2: Impact Analysis

- **Epic Impact:** Current Epic 7 ("The Wizard's Dashboard") is deferred and re-numbered to Epic 8. A new Epic 7 ("Core Refinements & Functional Expansion") is inserted immediately into the sprint.
- **Story Impact:** 5 new stories are created under Epic 7 to address the UX bugs, date formatting, profile page creation, immunization tracking, and journal filtering. The 5 deferred stories from the old Epic 7 are shifted to Epic 8.
- **Artifact Conflicts:**
  - **PRD:** Requires updates to Functional Requirements to include the "My Detail" profile form and a dedicated Journal view.
  - **Architecture:** Requires defining a new `profiles` table in the data model and adding an `IMMUNISATION` type to the entry Enums, updating the strict formatting logic for date resolution.
- **Technical Impact:** Database schema update required for the new `profiles` table. Smart Parser requires updates to calculate relative dates and categorize immunizations.

## Section 3: Recommended Approach

**Direct Adjustment & Delay:** Insert a new functional refinement Epic into the existing plan and push the subsequent Epic back. This allows us to handle the immediate technical debt and UX feedback discovered during the prototype testing, ensuring a solid foundation before adding the complexity of the researcher dashboard.

- **Effort Estimate:** Medium.
- **Risk Level:** Low.
- **Timeline Impact:** Delays the start of the Wizard Dashboard by approximately one epic cycle (1-2 sprints depending on velocity).

## Section 4: Detailed Change Proposals

### PRD Modifications

_Added to Functional Requirements (Smart Journaling)_

- **FR_SJ6:** Primary User can access and edit a structured "My Detail" profile summarizing their static demographics and medical history.
- **FR_SJ7:** Primary User can separate structured forms (Meds, Appointments) from raw Journal entries via a dedicated "Journal" page.

### Architecture Updates

_Added to Data Architecture (The "Glass Box" Data Model)_

- **Core Stream Simplicity:** A single `journal_entries` table with a `status` Enum (`draft`, `pending_review`, `approved`) handles the chronological data flow. The `entry_type` Enum explicitly handles types like `MEDICATION`, `APPOINTMENT`, `SCRIPT`, and `IMMUNISATION` alongside general `JOURNAL` entries.
- **Profile Data Table:** A dedicated `profiles` table will manage static demographics.
  - **Required Columns:** `id` (references simulated user), `full_name`, `dob`, `address_line_1`, `address_line_2`, `email`, `mobile_phone`, `home_phone`, `medicare_irn`, `medicare_valid_to`, `phi_name`, `phi_number`, `is_organ_donor`, `emergency_contact_name`, `emergency_contact_relationship`, `emergency_contact_mobile`, `languages_spoken`, `is_aboriginal`, `is_torres_strait_islander`, `allergies`.
- **Global Date Formatting:** All parsed relative time phrases (e.g., "Next Tuesday") must be computationally resolved by the AI or backend to a strict `dd-mm-yyyy` format relative to the current timestamp of the session before writing to the database.

### Epics Redefinition

_Inserted New Epic 7: Core Refinements & Functional Expansion_

- **7.1** Global Date Formatting & Relative Time Calculation
- **7.2** Chat UI Responsive Fixes & Auto-expanding Input
- **7.3** The "My Detail" Profile Page
- **7.4** Immunisation Record Component & Parser
- **7.5** Dedicated Journal Page & Clear Input Functionality

_Deferred Epic 8: The Wizard's Dashboard & Scenario Control_

- (Previously Epic 7, stories renumbered 8.1 - 8.5)

## Section 5: Implementation Handoff

- **Scope Classification:** Moderate
- **Routing:**
  - To **Scrum Master (SM)** or **Product Owner (PO)**: Update `sprint-status.yaml`, `epics.md`, `prd.md`, and `architecture.md` to reflect these approved changes structurally.
  - To **Developer (Dev)**: Implement the stories sequentially based on the new Epic 7 backlog.
- **Success Criteria:** Database is successfully migrated to include the `profiles` table. Testers confirm input bugs on mobile are resolved, and the parser successfully converts relative time into strict `dd-mm-yyyy` date strings.
