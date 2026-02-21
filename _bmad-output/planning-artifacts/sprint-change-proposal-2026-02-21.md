# Sprint Change Proposal

## Section 1: Issue Summary
**Trigger:** 
The team discovered during the Epic 3 Retrospective a need to reprioritize functionality to better align with the primary workshop goals.
**Problem Statement:**
The current plan for Epic 4 focuses on "The Wizard's Dashboard & Scenario Control". However, the immediate priority for the project is actually the "Proactive Recall / Chat" interface (Scenario 1, Part B) to allow the patient to interrogate their history, combined with technical debt fixes to improve the journal's structural accuracy to map to the physical *MINDmyPAIN* journal.

## Section 2: Impact Analysis
*   **Epic Impact:** Epic 4 ("The Wizard's Dashboard") must be deferred or descoped, and a new Epic 4 ("AI Retrieval & Chat") must be defined.
*   **Story Impact:** Existing stories 4.1 through 4.5 will be shelved. New stories need to be created for the Chat interface, `GlassBoxCard` fixes, "Guest" persona addition, and parser terminology updates.
*   **Artifact Conflicts:** 
    *   `epics.md`: Needs full rewriting of Epic 4.
    *   `prd.md` / `architecture.md`: May slightly shift priority, but the core "Wizard" approach remains valid, just delayed for the "Recall" feature.
    *   `sprint-status.yaml`: Needs to be updated to match the new epics.

## Section 3: Recommended Approach
**Direct Adjustment / Replan:** 
We will replace the current Epic 4 in `epics.md` with the newly defined scope. The Wizard's Dashboard can be moved to an Epic 5 backlog if need be, but for the immediate sprint, we will focus entirely on completing the new Epic 4.
**Justification:** This aligns delivery with the most critical workshop scenario (Scenario 1, Part B) and ensures the prototype's data structure flawlessly reflects the physical journal before more complex "Wizard" interventions are built.

## Section 4: Detailed Change Proposals

### Artifact 1: `_bmad-output/planning-artifacts/epics.md`

**Section: Epic 4 Overview**
*OLD:*
# Epic 4: The Wizard's Dashboard & Scenario Control
**Goal**: Enable the Researcher to monitor live sessions and trigger specific "Scenario Responses" or edit text in real-time. (Delayed from Epic 3 due to pivot).
... (Stories 4.1 - 4.5)

*NEW:*
# Epic 4: AI Retrieval & Chat & Journal Accuracy
**Goal**: Implement the "Proactive Recall / Chat" interface to support Scenario 1 (Part B), fix the structural accuracy of the journal data model to match the physical MINDmyPAIN journal, and add a Guest persona.
**User Outcome**: Users can query their past health records through a conversational interface, and all entered data maps correctly to the physical journal's structure.

### Story 4.1: Guest Persona & Safe Mode
As a workshop participant,
I want to select a "Guest" persona,
So that I can enter the app with a clean slate without prior history.

### Story 4.2: Journal Data Model Accuracy
As a patient user,
I want the app to use the exact structure of my physical MINDmyPAIN journal,
So that I am familiar with the required fields (Day, Sleep, Pain, Feeling, Action, Gratitude, Meds, Mood).

### Story 4.3: Smart Parser Fallback & Terminology
As a patient user,
I want the AI parser to never lose my data, and to use the term "Journal" instead of "Agenda",
So that unrecognized inputs are safely filed under general notes.

### Story 4.4: GlassBoxCard Edit State Fix
As a patient user,
I want to edit structured data in a user-friendly form within the Glass Box,
So that I don't have to look at or edit raw JSON.

### Story 4.5: Proactive Recall Chat Interface
As a patient user,
I want to chat with an AI assistant about my past records,
So that I can easily recall information like "When was my last pain flare?".


## Section 5: Implementation Handoff
*   **Scope:** Moderate (Requires backlog reorganization)
*   **Route to:** Scrum Master (for planning) and Developer (for implementation)
### Artifact 2: `_bmad-output/planning-artifacts/prd.md`

**Section: Functional Requirements**
*Modify:*
- **FR_WD1:** Epic 5 (Deferred) - Researcher Dashboard Overview
- **FR_WD2:** Epic 5 (Deferred) - Wizard Intervention Actions
- **FR_WD3:** Epic 5 (Deferred) - Pre-Canned Response Library
*Add:*
- **FR_PR1:** **Primary User** can recall specific past entries through a natural language chat interface.
- **FR_PR2:** **System** preserves exact match capability for required journal fields (Day, Sleep, Pain, Meds, etc.) when parsing user output.

**Section: Roadmap**
*Modify:*
### Phase 1: Thesis Prototype (Current Scope)
- "Proactive Recall" Chat Interface
- Robust Fallback Parsing & Strict Journal Structures
- (Deferred to Phase 1B: Wizard-of-Oz Researcher Dashboard)
### Artifact 3: `_bmad-output/implementation-artifacts/sprint-status.yaml`

**Changes Required:** 
Run Sprint Planning workflow `[SP]` to regenerate the file and catch the new stories (4.1 through 4.5).

## Postponement Addendum
**Update**: The Wizard's Dashboard is postponed, not cancelled. Epic 5 has been added to `epics.md` containing the original Epic 4 stories (5.1 - 5.5).
