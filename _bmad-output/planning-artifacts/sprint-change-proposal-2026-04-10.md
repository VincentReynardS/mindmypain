# Sprint Change Proposal: Additional Collaborator Accounts
Date: 2026-04-10

## Section 1: Issue Summary
- **Problem Statement**: An explicit request was received from stakeholders to create four new dedicated, hidden accounts for Simone Ley, Peter Sykes, Lucille Cassar, and Kimberley Grima. 
- **Context**: These accounts must be accessible to stakeholders for private testing but must not appear on the public persona selection screen (identical to the pattern built for Kim, Hilary, and Mary-Lynne).
- **Evidence**: Direct stakeholder request.

## Section 2: Impact Analysis
- **Epic Impact**: Epic 7 ("Core Refinements & Functional Expansion") is active and acts as the logical umbrella for these specialized stakeholder modifications.
- **Story Impact**: A new story (Story 7.10) needs to be appended to Epic 7.
- **Technical Impact**: Requires four new isolated routes (e.g., `/simone`, `/peter`, `/lucille`, `/kimberley`), minor UI routing configurations to hide them, and potential backend updates to accept these simulated personas.
- **Artifact Conflicts**: No changes required to PRD or UX design. `epics.md` and `sprint-status.yaml` will be updated tracking the added story.

## Section 3: Recommended Approach
- **Direct Adjustment**: We will address this by generating a single, new story inside Epic 7. Since the authentication and routing patterns exist for the previous collaborators, this can be executed rapidly.
- **Risk & Effort**: Low risk, low effort.

## Section 4: Detailed Change Proposals

**File: `_bmad-output/planning-artifacts/epics.md`**
Appending the following to Epic 7:

```markdown
### Story 7.10: Additional Collaborator Accounts

As a collaborator,
I want explicit, hidden accounts for Simone Ley, Peter Sykes, Lucille Cassar, and Kimberley Grima,
So that these stakeholders can test the app securely without interfering with existing user states.

**Acceptance Criteria:**

- **Given** the login screen
- **When** I navigate to their precise hidden paths (e.g., `/simone`, `/peter`, `/lucille`, `/kimberley`)
- **Then** I am prompted for a password
- **And** upon successful entry, I am logged into their specific persona environment, isolated from other users
- **And** these personas are explicitly NOT visible on the public Persona selection cards
```

## Section 5: Implementation Handoff
- **Scope**: Minor (Can be implemented directly by the development team).
- **Handoff**: The development team (Dev Agent) is responsible for taking Story 7.10 and executing the frontend routes, backend persona registrations, and routing security.
- **Success Criteria**: All four specified users can sign in reliably through their unique URL fragments without appearing on the homepage.
