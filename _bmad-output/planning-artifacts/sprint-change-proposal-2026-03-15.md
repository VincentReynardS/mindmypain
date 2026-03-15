# Sprint Change Proposal - 2026-03-15

## 1. Issue Summary

Feedback received from Kim during testing has identified several functional gaps that need to be addressed in the current sprint to ensure the prototype runs smoothly during scenarios.

1. **Session Volatility:** Kim (using her dedicated account) reported that she is forced to log in every time her phone goes into lock mode. This is due to a session persistence bug that makes the prototype unusable in a real-world testing flow.
2. **Missing Appointment Data:** The current Appointment entry form is missing critical clinical details. It lacks a specific "Time" field, "In-person/telehealth" indicator, and specific reason labels.
3. **Missing Repeat Prescriptions List:** In the Appointment entry, there is no way to explicitly track repeat prescriptions that result from the appointment.
4. **Medication Display Bug:** The Medication History page currently renders the raw unstructured note for entries, instead of displaying the structured parsing provided by the `MedicationGlassBox` component.

## 2. Impact Analysis

- **Epic Impact:** These issues directly impact the goals of the current active epic, Epic 7: Core Refinements & Functional Expansion. Addressing them now aligns with the objective of resolving immediate functional gaps before moving onto the Wizard Dashboard (Epic 8).
- **Story Impact:** We need three new stories to resolve these issues.
- **Artifact Conflicts:** No major conflicts with the PRD or Architecture. The Architecture explicitly calls for custom Persona state management which is what is causing the session bug. Data models are already dynamic enough to handle the new Appointment fields, and the `MedicationGlassBox` already exists but is just not being rendered on the list view.
- **Technical Impact:** Fixes are localized to frontend state management (persistence) and specific component updates.

## 3. Recommended Approach

**Path Forward: Direct Adjustment**

We recommend adding three new stories directly to Epic 7 to address these refinements. Given that Epic 7 is exactly intended for "Core Refinements & Functional Expansion", this is the correct place to handle this technical debt and UX feedback. 

**Rationale:** 
- The effort required is **Low/Medium** and does not jeopardize the delivery of Epic 8. 
- Technical risk is **Low**. 
- Adding these fixes now ensures the app is stable and accurately reflects the physical journal for users experiencing the prototype.

## 4. Detailed Change Proposals

### Stories Added to Epic 7:

**Story 7.6: Session Persistence Fix**
- Change: Ensure the active persona session persists across phone lock/backgrounding.
- Rationale: Essential for real-world usability during workshops.

**Story 7.7: Appointment Form Enhancements**
- Change: Add Time (HH:MM AM/PM), In-person/telehealth radio, Address (renamed from Location), update Reason chips, and add a Repeat Prescription dynamic list.
- Rationale: Matches the complexity required for true clinical logging based on creator feedback.

**Story 7.8: Medication History View Fix**
- Change: Render entries on the `/medications` page using `MedicationGlassBox` to show parsed data.
- Rationale: Users need to see the structured output (brand name, dosage) they took the time to generate, not just their garbled input.

## 5. Implementation Handoff

- **Scope Classification:** Minor
- **Route To:** Development team for direct implementation.
- **Deliverables:** The stories have been added to the backlog in `epics.md` and `sprint-status.yaml` under Epic 7. The Dev team can pick them up sequentially.
