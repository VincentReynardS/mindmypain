---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
classification:
  projectType: web_app
  domain: healthcare
  complexity: medium
  projectContext: brownfield
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-mindmypain-2026-02-14.md
  - _bmad-output/planning-artifacts/research/domain-mindmypain-thesis-research-2026-02-14.md
  - docs/App Structure.pdf
  - docs/Design Brief.pdf
  - docs/Design Concept.pdf
  - docs/Literature Review.pdf
  - docs/MINDmyPAIN Health Management Journal (Physical).pdf
  - docs/Vision Statement.pdf
workflowType: prd
project_name: mindmypain
user_name: Vincent
date: "2026-02-15"
author: Vincent
documentCounts:
  briefCount: 1
  researchCount: 1
  brainstormingCount: 0
  projectDocsCount: 6
---

# Product Requirements Document - MINDmyPAIN

**Author:** Vincent  
**Date:** 2026-02-15  
**Version:** 1.0 (Thesis Prototype)

---

## Executive Summary

**Product Vision:**  
MINDmyPAIN is a "Smart Health Journal" that empowers chronic pain patients to reclaim control over their narrative. By transforming unstructured voice/text logs into structured clinical evidence, it bridges the communication gap between patients and healthcare providers.

**Core Differentiator:**  
Unlike passive tracking apps, MINDmyPAIN acts as an active partner. It uses AI (via a Wizard-of-Oz prototype) to _interpret_ patient data, offer insights, and draft summaries, while maintaining a "Glass Box" approach where the user always retains final edit rights.

**Primary Goal (Thesis):**  
To validate if an "Active AI Partner" increases patient empowerment and confidence during clinical interactions, compared to traditional passive journaling.

---

## Success Criteria

### User Success (Empowerment)

- **Perceived Empowerment:** >80% of participants agree "I feel more confident explaining my condition to a doctor using this tool" (Likert Scale).
- **Cognitive Load Reduction:** Qualitative feedback indicating reduced "mental effort" in preparing for appointments.
- **Trust:** Users identify the AI's pattern recognition as a "Trust Builder" (accurate reflection of their experience).

### Research Success (Validation)

- **Scenario Execution:** successful completion of 10 Wizard-of-Oz scenarios with 12-16 users.
- **Insight Generation:** Identification of 3 distinct "AI Empowerment Patterns" (e.g., The Scribe, The Translator).
- **Ethical Validity:** Documentation of user privacy boundaries in AI interactions.

### Technical Success (Prototype Stability)

- **Latency:** Data sync < 500ms between User and Researcher views to maintain immersion.
- **Stability:** Zero session crashes during 90-minute live workshops.
- **Illusion:** The "Wizard" intervention is imperceptible to the user (perceived as autonomous AI).

---

## User Journeys

### 1. Primary User Journey: "From Chaos to Clarity"

**Persona:** Sarah (45), Living with CRPS.  
**Context:** Post-appointment, high pain, feeling rushed.  
**Narrative:**
Sarah opens the app in her car, frustrated. She taps "Scribe Mode" and verbally vents about her physio appointment. The system processes her voice. Within seconds, a structured draft appears:

- **Action:** "Stretches 2x daily."
- **Concern:** "Pain during exercise."
- **Next Step:** "Book follow-up."
  The AI adds a prompt: _"I noticed you mentioned pain. Shall we track pain levels after stretching this week?"_ Sarah accepts, feeling heard and validated. She closes the app, her anxiety replaced by a sense of control.

### 2. Researcher Journey: "The Invisible Hand"

**Persona:** Researcher (Wizard).  
**Context:** Monitoring a live session.  
**Narrative:**
The Researcher sees an incoming log from Sarah: "New sharp pain." The AI draft suggests: _"Go to ER."_ Knowing this is a standard CRPS flare for Sarah, the Researcher intervenes. They edit the draft to: _"Sharp pain noted. Is this different from your usual flare?"_ and push the update. Sarah sees a calm, contextual response, maintaining her trust in the system.

### 3. Recipient Journey: "The Evidence Brief"

**Persona:** Dr. Lee (Pain Specialist).  
**Context:** Reviewing a patient summary.  
**Narrative:**
Instead of a messy handwritten diary, Dr. Lee receives a 1-page "Clinical Snapshot." It highlights: "Medication Side Effects" and "Pain Trend: +20% with new dosage." The consultation skips the basic discovery questions and moves straight to solving the side-effect issue.

---

## Functional Requirements (The "Contract")

### 1. Smart Journaling (AI-Inferenced Logging)

- **FR_SJ1:** **Primary User** can enter logs via **Voice** (audio recording) or **Text**.
- **FR_SJ2:** **System** must analyze unstructured input and _infer_ appropriate categories (e.g., "Took Panadol" -> Tags: Medication).
- **FR_SJ3:** **System** must support **multi-intent extraction** from a single entry (e.g., Symptoms + Meds + Sleep).
- **FR_SJ4:** **Primary User** can review and manually correct AI-inferred tags before saving (Glass Box Pattern).
- **FR_SJ5:** **Primary User** can view a "Daily List" of entries, mirroring the physical journal structure.

### 2. Scribe Mode (Appointment Synthesis)

- **FR_SC1:** **Primary User** can initiate "Scribe Mode" to record long-form audio.
- **FR_SC2:** **System** displays a visual "Processing" state to maintain immersion while the summary is generated.
- **FR_SC3:** **System** displays the generated "Meeting Summary" (Action Items, Key Insights) only after Researcher approval.

### 3. Collaborative Summary (Glass Box)

- **FR_CS1:** **Primary User** can view AI-generated drafts of their summaries.
- **FR_CS2:** **Primary User** can manually edit the text of any AI-generated draft.
- **FR_CS3:** **Primary User** can "Approve" a draft to save it to their permanent record.

### 4. Researcher Dashboard (Wizard Control)

- **FR_WD1:** **Researcher** can view incoming text/audio inputs from active sessions in real-time.
- **FR_WD2:** **Researcher** can overwrite AI-generated text responses before they are displayed to the user.
- **FR_WD3:** **Researcher** can trigger "Insight Cards" (pre-defined pattern notifications) to appear on the user's dashboard.

### 5. Authentication & Profile (Thesis Model)

- **FR_AP1:** **System** provides a "Select Persona" screen (Sarah/Michael) instead of complex login.
- **FR_AP2:** **System** loads pre-filled "seed data" (history, meds) based on the selected Persona.
- **FR_AP3:** **System** operates **Online Only** (no offline persistence required for prototype).

---

## Non-Functional Requirements

### Performance (Immersion)

- **NFR_PERF1:** **Real-time Latency:** Data sync between User and Researcher must occur in **< 500ms**.
- **NFR_PERF2:** **Scribe Feedback:** Visual feedback for "Processing" states must appear in **< 100ms**.

### Reliability (Stability)

- **NFR_REL1:** **Session Continuity:** Zero crashes during continuous 90-minute workshop sessions.

### Usability (Researcher Efficiency)

- **NFR_USE1:** **Wizard Speed:** Dashboard interaction design must allow edits/pushes in **< 10 seconds** to avoid breaking immersion.
- **NFR_USE2:** **Attention Management:** Visual indicators must clearly highlight which User requires attention.

### Accessibility (WCAG 2.1 AA)

- **NFR_ACC1:** High contrast text and UI elements.
- **NFR_ACC2:** Touch targets > 44px for users with motor impairments.

### Data Integrity

- **NFR_DATA1:** Immediate state recovery if a user disconnects and reconnects.

---

## Technical Architecture

**Platform:** Single Page Application (SPA).  
**Framework:** React / Next.js.  
**Backend:** Real-time Database (Supabase / Firebase) for WebSocket sync.

**Browser Support:**

- **Mobile:** iOS Safari (Latest 2), Android Chrome (Latest 2).
- **Desktop:** Chrome, Safari, Edge, Firefox (Latest 2).
- _Legacy browsers explicitly unsupported._

**Responsiveness:**

- **Mobile-First:** Patient view optimized for smartphone portrait.
- **Desktop:** Researcher Dashboard optimized for laptop/monitor.

---

## Innovation & Novel Patterns

**1. Patient-AI Partnership (Interaction):**

- **Concept:** "Glass Box" AI.
- **Novelty:** Unlike clinical "Black Box" AI, MINDmyPAIN shows the draft and asks for approval. This shifts agency back to the patient.

**2. Pattern Discovery (Insight):**

- **Concept:** "Active Sense-Making."
- **Novelty:** Proactively identifying hidden correlations (e.g., Pain vs. Sleep) rather than just logging data.

---

## Roadmap (Post-Thesis Vision)

### Phase 1: Thesis Prototype (Current Scope)

- Wizard-of-Oz AI (Researcher mediated).
- Web-based only.
- Simulated Accounts.

### Phase 2: Pilot & Growth

- **Automated AI:** Replacing the Wizard with tuned LLMs.
- **Native Apps:** iOS/Android for sensor access.
- **Basic Compliance:** Privacy Policy, GDPR/APP controls.

### Phase 3: Expansion

- **EMR Integration:** FHIR sync with medical directors.
- **Wearables:** Auto-import of sleep/heart rate.
- **Community:** Anonymized peer support.
