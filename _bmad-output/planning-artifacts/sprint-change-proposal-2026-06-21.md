# Sprint Change Proposal: Pivot from Wizard-of-Oz to Core UX Refinements
Date: 2026-06-21

## Section 1: Issue Summary
**Trigger:** Strategic pivot based on new user testing feedback.
**Problem Statement:** The previously planned Epic 8 ("The Wizard's Dashboard & Scenario Control") does not address immediate, high-priority user friction points discovered during testing. The focus must shift to core application refinements.
**Evidence/Context:**
- **Medications:** Users report the AI re-enters existing medications, causing duplicates. Need an Active Medication Summary checklist and detail screens.
- **AI Temporal Awareness:** The Ask AI feature struggles with relative time (e.g., answering about a past test when asked for "upcoming tests").
- **My Details (DoB):** Older users have difficulty manually typing dates (dd-mm-yyyy); a date picker is required.
- **New Team Feature:** Users need a place to track their healthcare team (Profession, Name, Address, Email, Phone), including deduplication of spelling variations (e.g., "Dr Chew" vs "Dr Chewy").

## Section 2: Impact Analysis
- **Epic Impact:** Epic 8 (Wizard-of-Oz) is obsolete and will be completely scrapped. A new Epic 8 will be created for these refinements.
- **Story Impact:** All planned 8-X stories will be removed. New stories will be generated for the four primary concerns.
- **Artifact Conflicts:** 
  - `epics.md` needs to be updated to replace Epic 8.
  - `sprint-status.yaml` must be updated to remove old Epic 8 backlog stories and add the new ones.
  - `prd.md` might need an update to reflect the "Team" feature as part of the core requirements.
- **Technical Impact:** 
  - Enhancing the AI parsing logic to support deduplication and temporal awareness (injecting `Date.now()` into system prompts).
  - Schema updates to support the "Team" entity.

## Section 3: Recommended Approach
**Option Selected:** Direct Adjustment (Complete replacement of Epic 8).
**Rationale:** The Wizard-of-Oz dashboard is not critical for the immediate user experience, whereas data integrity (medications, spelling deduplication) and core UX (date picker) directly impact usability.
**Effort Estimate:** Medium. Most of the changes are refinements to existing patterns, though the AI temporal and deduplication logic will require careful testing.
**Risk Level:** Low-to-Medium. 

## Section 4: Detailed Change Proposals

### Epic Changes (epics.md & sprint-status.yaml)
**OLD Epic 8:**
- 8-1-researcher-dashboard-overview
- 8-2-live-stream-real-time-updates
- 8-3-wizard-intervention-actions-edit-scenario-trigger
- 8-4-pre-canned-response-library
- 8-5-thinking-state-indication

**NEW Epic 8:** User-Centric Core Refinements
- 8-1-medication-structure-and-active-summary
- 8-2-ai-temporal-awareness-prompt-injection
- 8-3-date-of-birth-picker-component
- 8-4-healthcare-team-tracking-feature
- 8-5-ai-spelling-deduplication-entity-resolution

## Section 5: Implementation Handoff
- **Scope:** Major (Strategic replan).
- **Handoff Recipients:** 
  - **Product Manager / Scrum Master:** Update `epics.md` and `sprint-status.yaml`.
  - **Developer Team:** Implement the new 8-X stories.
- **Success Criteria:** 
  1. Medications do not duplicate and support active/inactive states.
  2. AI correctly differentiates past vs future dates based on the current timestamp.
  3. Date of birth uses a native/Shadcn calendar picker.
  4. Team feature renders correctly and merges misspelled doctors automatically.
