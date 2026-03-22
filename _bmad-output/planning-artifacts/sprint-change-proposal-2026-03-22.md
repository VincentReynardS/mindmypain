# Sprint Change Proposal: Dedicated Account for Mary-Lynne

## Section 1: Issue Summary
- **Problem Statement**: An urgent request was received from a collaborator to create a dedicated account for Mary-Lynne, functioning exactly like the accounts previously created for Kim and Hilary.
- **Context**: This account is needed for testing and usage without interference from the simulated personas (Sarah, Michael) or guest limits.
- **Evidence**: Direct collaborator request during the current sprint.

## Section 2: Impact Analysis
- **Epic Impact**: Epic 7 (Core Refinements & Functional Expansion) will be expanded to include one additional story. No other epics are affected.
- **Story Impact**: A new story (Story 7.9) will be added to Epic 7.
- **Artifact Conflicts**: No conflicts with the PRD, Architecture, or UI/UX specifications. This is a replication of an existing pattern (personas with password protection).
- **Technical Impact**: Requires an update to the authentication routing, login UI (if selectable), and potentially database seed/persona state to support the "Mary-Lynne" identifier.

## Section 3: Recommended Approach
- **Selected Approach**: Direct Adjustment. Modify Epic 7 to include the new story.
- **Rationale**: The change is small, replicates an existing and proven technical pattern, and can easily be absorbed into the current epic without derailing the sprint goals.
- **Effort Estimate**: Low
- **Risk Assessment**: Low
- **Timeline Impact**: Negligible

## Section 4: Detailed Change Proposals

### Stories (`epics.md`)
**Story: [7.9] Mary-Lynne's Account**
**Section: Epic 7 List**

**NEW**:
```markdown
### Story 7.9: Mary-Lynne's Account

As a collaborator,
I want a specific account for "Mary-Lynne" that functions exactly like Kim and Hilary's protected accounts,
So that I can test the app with my true experience without interference.

**Acceptance Criteria:**

- **Given** the login screen
- **When** I navigate to `/mary-lynne` or select Mary-Lynne
- **Then** I am prompted for a password
- **And** upon successful entry, I am logged into Mary-Lynne's specific persona environment
```
**Rationale**: Explicitly capture the requirement for the new collaborator account.

## Section 5: Implementation Handoff
- **Change Scope**: Minor 
- **Handoff Recipients**: Development Team
- **Responsibilities**: Implement the routing, authentication gating, state management, and basic UI for the Mary-Lynne persona.
- **Success Criteria**: User can navigate to `/mary-lynne`, enter a password, and access an isolated journal feed.
