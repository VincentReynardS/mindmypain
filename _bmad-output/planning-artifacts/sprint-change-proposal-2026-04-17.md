# Sprint Change Proposal

## Section 1: Issue Summary
- **Problem Statement:** Stakeholders have requested three new dedicated collaborator accounts (Ross Mieglich, Joanna Parlapiano, Joanne Tynan) so they can test the application securely.
- **Context:** These accounts must follow the established pattern for hidden contributor access (like the existing accounts for Kim, Hilary, Mary-Lynne, Samuel).
- **Evidence:** Direct request from stakeholders.

## Section 2: Impact Analysis
- **Epic Impact:** Epic 7 ("Core Refinements & Functional Expansion") is currently in progress and will natively absorb this change.
- **Story Impact:** A new story (Story 7.12: Wave 2 Collaborator Accounts) will be appended to Epic 7. 
- **Artifact Conflicts:** No adjustments required for the PRD, Architecture, or UX Design specifications.
- **Technical Impact:** Requires the addition of three new route folders (`/ross`, `/joanna`, `/joanne`), protected by basic passwords, similar to the existing implementation for other specific stakeholders.

## Section 3: Recommended Approach
- **Approach:** Direct Adjustment.
- **Rationale:** The application already possesses an established, predictable pattern for handling hidden access paths. The effort is minimal to replicate this configuration without interfering with broader sprint objectives or the larger timeline.
- **Effort Estimate:** Low
- **Risk Assessment:** Low

## Section 4: Detailed Change Proposals
**Updates exactly to `_bmad-output/planning-artifacts/epics.md`**

**Story: [Epic 7] Core Refinements & Functional Expansion**
**Section: Following Story 7.11**

**ADDITION:**
```markdown
### Story 7.12: Wave 2 Collaborator Accounts

As a collaborator,
I want explicit, hidden accounts for Ross Mieglich, Joanna Parlapiano, and Joanne Tynan,
So that these stakeholders can test the app securely without interfering with existing user states.

**Acceptance Criteria:**

- **Given** the login screen
- **When** I navigate to their precise hidden paths (e.g., `/ross`, `/joanna`, `/joanne`)
- **Then** I am prompted for a password
- **And** upon successful entry, I am logged into their specific persona environment, isolated from other users
- **And** these personas are explicitly NOT visible on the public Persona selection cards
```

## Section 5: Implementation Handoff
- **Scope Categorization:** Minor
- **Handoff Recipients:** 
  - **PO / SM:** To update the tracking metrics in `sprint-status.yaml` and `epics.md`. 
  - **Development Team:** Directly implement the accounts as specified above. 
- **Success Criteria:** The three accounts are live, accessible via their direct URLs, correctly password protected, and do not appear as links or cards on the main frontend screen.
