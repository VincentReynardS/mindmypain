# Sprint Change Proposal: Epic 6 Refinements

**Date:** 2026-03-05
**Workflow:** Correct Course

## Section 1: Issue Summary

During the execution of Epic 6 (specifically user testing after Story 6.1 and 6.2), four distinct feedback points arose requiring immediate attention before completing the sprint:

1. **Login UX Friction**: The specific account login flow (Kim's Account) requires users to manually click into the text input to press 'Enter', which breaks auto-fill experiences via password managers since there is no native 'Login' submit button.
2. **Data Loss on Fallback**: The smart parser is failing to provide a fallback field for unrecognized inputs (resulting in empty `{}` JSON results), leading to data disappearing rather than landing in a "Notes" section.
3. **Voice UI Completeness**: The newer Proactive Recall/Chat feature does not support voice-to-text dictation natively like the core journaling feature, disrupting the frictionless experience.
4. **New Testing Persona**: The project requires an additional specific profile ("Hilary") identical in setup behavior to Kim's specific persona context.

## Section 2: Impact Analysis

- **Epic Impact**: Epic 6 ("Creator Feedback & Core Refinements") is currently designated for these exact types of adjustments.
- **Story Impact**: A heavy state-management refactor (originally Story 6.3) is too disruptive to run while functionally tweaking components if it can be deferred slightly. Thus, the refactor can be pushed to the end of the sprint, allowing these four issues to be addressed immediately.
- **Artifact Conflicts**: No major architecture or PRD conflicts; the new Hilary persona matches the Kim framework (extend FR_AP1), and Voice-in-Chat aligns perfectly with existing project principles of "Frictionless Dump".

## Section 3: Recommended Approach

**Direct Adjustment**. We will add these four pieces of feedback directly into Epic 6 as new user stories. The existing incomplete story (6.3: State Management Refactor) will be moved to the back of the queue (now 6.7) so that the UX and bugs can be handled without dealing with major subsystem churn.

- **Effort Estimate**: Low to Medium
- **Risk Level**: Low

## Section 4: Detailed Change Proposals

### Action 1: Add "Login UX Refinement"

- **Updates**: A visible submit/login button will be added to the login flow to handle password manager submissions gracefully. Appended to Epic 6 as Story 6.3.

### Action 2: Add "Smart Parser Fallback Bug Fix"

- **Updates**: Smart parsing logic will be adjusted to default unknown text extractions to the feeling/notes field for all journal entries instead of dropping them as an empty object. Appended to Epic 6 as Story 6.4.

### Action 3: Add "Voice-to-Text in Proactive Chat"

- **Updates**: Add a microphone interaction button explicitly for the chat area matching the behavior of the main journaling app. Appended to Epic 6 as Story 6.5.

### Action 4: Add "Hilary's Account"

- **Updates**: Stand up the additional specific persona. Appended to Epic 6 as Story 6.6.

### Action 5: Reorder "State Management & Optimistic UI Refactor"

- **Updates**: Shift this story down. Appended to Epic 6 as Story 6.7.

## Section 5: Implementation Handoff

- **Change Scope Classification**: Minor to Moderate
- **Routing**: This change is localized primarily to the developer tasks. The Scrum Master has already updated the backlog and epic documents. The Dev agent can simply pull the next story in the sequence from the backlog.
- **Success Criteria**: All four newly added stories are successfully executed before the final state-management refactor begins.
