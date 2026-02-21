# Retrospective - Epic 3: Structured Health Records & Navigation

Date: 2026-02-21
Facilitator: Bob (Scrum Master)
Participants: Vincent (Project Lead), Alice (PO), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

## 1. Epic Overview

**Goal**: Transform the application from a chronological feed into a section-based health record matching the physical journal's mental model, including specific input forms and tables for Appointments, Medications, and Scripts.

**Delivery Metrics:**

- **Status:** Complete (5/5 Stories Done)

## 2. What Went Well (Successes)

- **Manual UI Testing by Devs:** Having developers conduct manual UI testing to identify and fix issues prior to handoff went very well and significantly improved the polish of the final product.
- **Component Reusability:** The `GlassBox` component pattern established in Epic 2 made spinning up the `AppointmentGlassBox` and `MedicationGlassBox` much faster.
- **AI Schema Enforcement:** Implementing strict Zod schemas in `smart-parser.ts` (Story 3.5) successfully prevented empty or malformed JSON from crashing the frontend views.
- **Alignment with Vision:** The new tabbed navigation (Appointments, Medications, Scripts) aligns perfectly with the physical MINDmyPAIN journal structure.

## 3. What Didn't Go Well (Challenges)

- **Next.js Cache Revalidation:** The team struggled with cache path invalidation due to the new routing structure (`/app/(patient)/medications`, `/scripts`, etc.). When executing server actions, stale data was sometimes shown because `revalidatePath` was pointing to the wrong routes.
- **Zombie Files:** Leftover/redundant files (e.g., `script-actions.ts`) slipped in during development and had to be caught and removed during code review.
- **IDOR False Positives:** The team had to continually override and annotate "Critical IDOR vulnerabilities" in security reviews because the project intentionally uses simulated Persona IDs instead of standard `supabase.auth.getUser()`.

## 4. Key Insights & Process Improvements

- **Retain Dev UI Testing:** The process of having developers do a manual UI clicking pass before calling a story "done" should be standard practice moving forward, as it saves QA time and catches glaring padding/accessibility bugs early.
- **Path Revalidation Checklist:** Server actions must have their `revalidatePath` targets double-checked against the actual active route groups to prevent caching bugs.

## 5. Preparation for Epic 4 (The Wizard's Dashboard)

_Note: Vincent has specific thoughts on next steps that need to be addressed before committing to the Epic 4 plan._

**Technical Prerequisites discussed:**

- Ensure the real-time syncing mechanism (Supabase subscriptions) is fully understood to support the <500ms latency requirement for the Researcher overview.

## 6. Action Items & Next Steps (Pivoting from Epic 4 to "AI Retrieval & Chat" & "Journal Accuracy")

1. **Reprioritize**: The "Wizard's Dashboard" (originally Epic 4) is paused. The immediate priority is the **"Proactive Recall / Chat"** interface to support Scenario 1, Part B.
2. **Technical Debt Fix (GlassBoxCard)**: Fix the `GlassBoxCard` edit state so it renders editable form fields for structured data instead of raw JSON.
3. **Terminology & Structure Update**: Rename "Agenda" to **"Journal"** throughout the application UI and parsing logic. Update the data model and `smart-parser.ts` to strictly adhere to the physical MINDmyPAIN daily journal structure:
   - Day / Date
   - Hours of restful sleep / How did you sleep?
   - Pain out of 10
   - Right now I am feeling (Free text)
   - What can I do to feel better today?
   - I am grateful for...
   - Medication (Morning, Midday, Evening)
   - Mood (Scale of 22 specific moods from Excellent to Sick)
4. **Persona Expansion**: Add the **"Guest"** persona to the login screen, allowing users to start with a blank slate.
5. **AI Prompt Safety Net**: Ensure `smart-parser.ts` is explicitly instructed to put any unstructured or unrecognized input into the "Right now I am feeling" or a general "Notes" field so no data is lost during parsing.
