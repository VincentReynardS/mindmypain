# Sprint Change Proposal

## 1. Issue Summary
- **Trigger**: Feedback from the tester regarding the "Save as Doctor Summary" feature in Epic 6.
- **Problem**: The feature is not perceived as useful and causes confusion because the chat feature already covers the use case.
- **Impact**: Removing this feature will simplify the application, avoid user confusion, reduce future tech debt, and improve database schema purity.

## 2. Impact Analysis
- **Epic Impact**: Epic 6 (Add new stories to remove and refactor)
- **Story Impact**: 
  - Need a new Story (6.8) to remove the UI elements.
  - Need a new Story (6.9) to refactor the data model and fix seed data.
  - Story 2.5 ("Integration: Clinical Summary") is now explicitly descoped as it's superseded by Proactive Chat.
- **Artifact Conflicts**: PRD (Functional Requirements), Epics list, and Database Schema/Seed all need adjustments.

## 3. Recommended Approach
- **Direct Adjustment**: Implement the removal of the specific feature and carefully prune out the corresponding unused data models and seed data.
- **Rationale**: Minimal effort with an immediate positive impact on user experience, plus preventing technical debt by fully removing unused data schema items. This handles both the UI and database cleaning.

## 4. Detailed Change Proposals

### Story: [6.8] Remove "Save as Doctor Summary" Feature 
**Section: Description and Acceptance Criteria**

**NEW**: 
As a patient user,
I do not want to see a specific "Save as Doctor Summary" feature, 
So that I am not confused about how it differs from the proactive chat interface.

**Acceptance Criteria**:
- Remove any UI elements (buttons, forms, cards) related to generating or approving a "Doctor Summary" or "Clinical Summary".
- Ensure the primary way to recall data for doctor visits is explicitly directed through the Proactive Chat interface. 

---

### Story: [6.9] Refactor Data Model to Remove `clinical_summary` Type
**Section: Description and Acceptance Criteria**

**NEW**:
As a developer, 
I want to remove the redundant `clinical_summary` data types and seed data,
So that the database schema correctly reflects the active features of the application. 

**Acceptance Criteria**: 
- Create a migration to remove `clinical_summary` from the `journal_entry_type` enum (or deprecate it safely).
- Update `supabase/seed.sql` to change "Sarah's Entry 4" from a `clinical_summary` to a standard `journal` entry, or rewrite the seed entry entirely.
- Ensure the `smart-parser.ts` logic no longer attempts to classify inputs as `CLINICAL_SUMMARY`.

---

### Artifact: PRD Impact 
**Section**: Functional Requirements (The "Contract")

**OLD:** 
- **FR_CS1:** **Primary User** can view AI-generated drafts of their summaries.
- **FR_CS2:** **Primary User** can manually edit the text of any AI-generated draft.
- **FR_CS3:** **Primary User** can "Approve" a draft to save it to their permanent record.

**NEW:**
- **FR_CS1:** DESCOPED (App replaced by simple Glass Box Card and Chat)
- **FR_CS2:** DESCOPED (Edit replaced by simple Add/Approve)
- **FR_CS3:** DESCOPED (Approve)

---

### Artifact: Epics Impact
**Section**: Epic 2: Smart Journaling & "Glass Box" Interface

**OLD:** 
### Story 2.5: Integration: Clinical Summary (Scenario 2)
As a patient user,
I want the app to generate a professional summary for my doctor, (Scenario 2)
So that I can communicate my history effectively without anxiety.

**Acceptance Criteria:**
- Given the user inputs specific medical details (e.g., "Lyrica side effects")
- When they request a summary (via prompt)
- Then the backend should classify this as `type: CLINICAL_SUMMARY`
- And The AI should return a JSON structure with sections: Chief Complaint, Med Review, Patient Goal
- And The frontend should render this as a "Doctor Letter Card" (Glass Box) ready for approval

**NEW:** 
### Story 2.5: Integration: Clinical Summary (Scenario 2)
**Status:** DESCOPED. Replaced by Proactive Recall / Chat implementation.

## 5. Implementation Handoff
- **Scope**: Minor to Moderate (Requires UI update and Database Migration strategy)
- **Route to**: Development team for direct implementation. Developer and QA must ensure no regressions occur with existing seed data during the migration changes.

