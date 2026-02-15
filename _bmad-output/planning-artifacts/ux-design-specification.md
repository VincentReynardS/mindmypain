---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
  - 9
  - 10
  - 11
  - 12
  - 13
  - 14

inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-mindmypain-2026-02-14.md
  - _bmad-output/planning-artifacts/research/domain-mindmypain-thesis-research-2026-02-14.md
project_name: mindmypain
user_name: Vincent
---

# UX Design Specification mindmypain

**Author:** Vincent
**Date:** 2026-02-15

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

MINDmyPAIN is a "Smart Health Journal" designed to empower chronic pain patients by returning control of their narrative to them. Evolving from a proven physical journal, the digital platform introduces an "Active AI Partner" that listens, summarizes, and identifies patterns—shifting the patient's role from passive tracker to informed expert.

For this thesis prototype, the focus is on a high-fidelity **Wizard-of-Oz** validation. The experience must simulate a sophisticated, empathetic AI (mediated by a researcher) to test if this partnership truly increases patient confidence and agency in clinical settings.

### Target Users

- **Primary User: "The Veteran" (Sarah, 45)**
  - **Need:** Validation and efficiency. Wants to be heard by doctors without repeating her traumatic history. Values tools that make her an "expert reporter" of her own body.
- **Primary User: "The Overwhelmed" (Michael, 28)**
  - **Need:** Order and clarity. Drowning in new diagnoses and paperwork. Needs a "second brain" to organize the chaos and reduce anxiety.
- **Research Context:**
  - The immediate users are **12-16 validation workshop participants** who will interact with the tool in controlled scenarios to test specific empowerment hypotheses.

### Key Design Challenges

1.  **The "Glass Box" Interface**:
    - AI outputs must be framed as humble _drafts_ inviting user correction, not authoritative _diagnoses_. The UI must reinforce that the user is the final arbiter of truth to support the "empowerment" goal.

2.  **The Wizard-of-Oz Illusion**:
    - The interface must gracefully handle the latency of human-mediated responses (<10s) without breaking immersion. "Thinking" or "Processing" states must be engaging enough to prevent the user from realizing a human is typing behind the scenes.

3.  **Tone & Safety**:
    - Visuals and copy must balance _clinical credibility_ (suitable for a doctor's office) with _empathetic warmth_ (welcome in a patient's home). It must avoid the coldness of medical software and the superficiality of generic wellness apps.

### Design Opportunities

1.  **Visualizing Sense-Making**:
    - Move beyond standard charts to create "Insight Cards" that visually connect disparate data points (e.g., creating a visible link between a 'Sleep' log and a 'Pain' spike), reinforcing the AI's role as a pattern detective.

2.  **Tangible "Offloading"**:
    - Use interaction design to make the "Scribe" feature feel functionally relieving—perhaps using animations that visualize the weight of information being lifted from the user and organized into the system.

## Core User Experience

### Defining Experience

The core value of mindmypain is **Sense-Making**, not just data entry. The "Evidence" review is the primary interaction where the user feels control returning.

- **Primary Action**: Reviewing and refining the AI-generated "Evidence Brief" (The Glass Box).
- **Secondary Action**: Effortless capture (Voice/Text) that feeds the evidence engine.

### Platform Strategy

- **Platform**: Mobile-First Web Application (PWA-style).
- **Context**: Designed for **Calm Reflection** at home (seated posture), not just frantic on-the-go logging.
- **Input**: Optimized for voice dictation and large-touch targets to reduce physical strain.

### Effortless Interactions

1.  **Multi-Intent Capture**: Users speak _once_ ("I slept badly and my leg hurts"), and the system intelligently populates multiple sections (Sleep, Pain, Journal) automatically. No more navigating to separate tabs.
2.  **Instant Prep**: A single action—"Prepare for Appointment"—instantly aggregates relevant history, questions, and patterns into a cohesive agenda.

### Critical Success Moments

The "Aha!" moment occurs when the system **proactively identifies a hidden pattern** (e.g., "Your pain flare correlates with poor sleep 2 days ago"). This transforms the user's perception from "I am broken" to "I understand my body."

### Experience Principles

1.  **Evidence over Entry**: Minimize the effort of logging; maximize the clarity of the output. The system does the heavy lifting of organization.
2.  **Contextual Recall**: The system shoulders the burden of memory, surfacing relevant history (e.g., "You haven't discussed sleep in 3 months") so the user doesn't have to carry it all.
3.  **Calm Confidence**: The interface uses white space, clear typography, and a "slow tech" pacing to induce a state of reflective control, countering the anxiety of chronic pain.
4.  **Celebration of Insight**: AI discoveries are presented as major "wins" for the user, visually highlighting the connection to reinforce their expertise.

## Desired Emotional Response

### Primary Emotional Goals

**Relief** is the north star. The user should feel a tangible lifting of the cognitive and emotional burden associated with managing their condition.

1.  **Immediate Relief**: "I've dumped it out of my head, and I know it's safe."
2.  **Collaborative Partnership**: "We are working on this together. I am the expert; the AI is the scribe."

### Emotional Journey Mapping

1.  **Start (The Burden)**: User enters feeling anxious, overwhelmed, or in pain.
2.  **Action (The Release)**: During the "Scribe" recording, the user feels catharsis—venting without worrying about structure.
3.  **Result (The Support)**: Seeing the AI draft creates a feeling of being _supported_ and _understood_.
4.  **End (The Empowerment)**: Approving the final evidence transforms the anxiety into confident agency.

### Micro-Emotions

- **Trust**: The user trusts the system to handle the "filing" without needing to double-check every detail.
- **Validation**: The user feels "heard" when the AI accurately reflects their experience using their own terminology.

### Design Implications

- **Trust vs. Skepticism**: To build trust, AI pattern recognition must be framed as a _question_ ("Could this be related?") rather than a definitive statement. This invites the user to validate the insight, respecting their agency.
- **Validation vs. Dismissal**: The AI's summaries should prioritize the user's _key phrases_ and _emotional tone_ to demonstrate active listening, rather than sterilizing the input into pure clinical jargon immediately.

### Emotional Design Principles

1.  **Subtract, Don't Add**: Every interaction should remove weight from the user. If a feature feels like "work," it's wrong.
2.  **Safe Harbor**: The interface is a judgment-free zone.
3.  **The "We" Dynamic**: The AI acts as a junior partner—eager, helpful, but always deferring to the senior partner (the patient).

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

Since **mindmypain** is a unique intervention without direct competitors, we are adopting a "Best-in-Class" component strategy—borrowing effective interaction patterns from disparate domains to build a novel experience.

1.  **Voice Memos / Otter.ai (The "Scribe")**:
    - **Core Value**: Immediate, frictionless capture.
    - **Key Pattern**: Visual feedback (waveforms) that _proves_ listening, followed by a clear "Processing" state that signals the handoff of responsibility.

2.  **Google Docs / Grammarly (The "Glass Box")**:
    - **Core Value**: Collaborative editing where the user retains final authority.
    - **Key Pattern**: "Suggestion Mode." AI contributions appear as distinct, provisional blocks that must be "Accepted" or "Rejected," reinforcing the user's agency.

3.  **Headspace / Oura Ring (The "Calm Data")**:
    - **Core Value**: Presenting complex, potentially stressful physiological data without inducing panic.
    - **Key Pattern**: Soft visualizations (rounded curves, pastel gradients) and conversational summaries ("You rested well") rather than raw, jagged data dumps.

### Transferable UX Patterns

- **The "Draft" Pattern**: AI outputs are never presented as "Final." They are always in a state of "Draft" until the user explicitly "Commits" them to the record.
- **Progressive Disclosure**: Don't show the full medical history at once. Show the _summary_ first, with the ability to drill down into raw logs if needed.
- **The "Nudge"**: proactive but gentle prompts ("I noticed X...") rather than interruptive alerts.

### Anti-Patterns to Avoid

- **The "Black Box" Diagnosis**: Interfaces that deliver a conclusion ("You have X condition") without showing the working or asking for verification.
- **The "Dashboard Fatigue"**: Excessive widgets and numbers on the home screen. A patient in pain doesn't want a Bloomberg Terminal for their body.
- **The "Clinical Coldness"**: Stark white backgrounds with standard blue system fonts. This feels like a hospital, not a home.

### Design Inspiration Strategy

**Strategy: "Soft Tech, Hard Evidence"**

- **Adapt**: The "Suggestion Mode" from document editors needs to be simplified for mobile touch. Instead of complex comments, use simple "Approve/Edit" cards.
- **Adopt**: The "Waveform" visual for voice input. It is the universal signifier of "I am listening."
- **Avoid**: Any design language that mimics an Electronic Medical Record (EMR). We are building a _patient_ tool, not a _doctor_ tool.

## Design System Foundation

### 1.1 Design System Choice

**Custom Design System** built on **Headless Primitives** (e.g., Radix UI) and **Tailwind CSS**. We will adopt a **Hybrid Scope** strategy.

### Rationale for Selection

1.  **Interaction Specificity**: Our core features (Scribe, Glass Box) require novel interaction patterns that standard frameworks (Material, Ant) do not support. A custom system prevents "fighting the framework."
2.  **Emotional Resonance**: To achieve the "Safe Harbor" and "Calm" aesthetic, we need granular control over tokens, avoiding the generic feel of pre-styled libraries.
3.  **Hybrid Efficiency**: We will invest heavily in custom components for the **Core Experience** (Journal, Summary) but use simpler, standard patterns for peripheral features (Settings, Login) to balance development effort.

### Implementation Approach

- **Logic Layer**: Use **Radix UI** (or similar) for unstyled, accessible interactive primitives (Modals, Popovers, Accordions).
- **Style Layer**: Use **Tailwind CSS** with a strictly defined `tailwind.config.js` acting as the source of truth for our **Design Tokens**.
- **Component Strategy**: Build a "Micro-Library" of only the ~15 essential components needed for the prototype (Button, Card, Input, Waveform, Sheet, Modal).

### Customization Strategy

- **Tokens First**: define semantic tokens (e.g., `color-surface-calm`, `color-text-empathetic`) rather than raw values before building components.
- **Motion**: Define a custom motion scale (e.g., `transition-slow-calm`) to enforce the "slow tech" feel.

## 2. Core User Experience

### 2.1 Defining Experience

The core magical interaction is **Active Sense-Making** via the **Voice-to-Insight Loop**.

- **User Action**: "I just talk to it about my pain..."
- **System Value**: "...and it tells me why I'm hurting and organizes my messy brain."

If users are forced to type into form fields, the product has failed. The primary success metric is the seamless transformation of unstructured speech into structured insight.

### 2.2 User Mental Model

- **Current State**: Users carry a mental load of scattered symptoms, appointments, and anxieties. They fear forgetting details or being dismissed.
- **Desired Mental Model**: The app is a "Digital Scribe" or "Partner" that listens without judgment and organizes the chaos. "I dump it here, and it makes sense of it."

### 2.3 Success Criteria

1.  **Frictionless Dump**: The "Record" action must be accessible in <2 seconds from opening the app.
2.  **Immediate Transformation**: The feedback loop from "Stop Recording" to "Seeing the Draft" must feel like magic—a visible reorganization of chaos into order.
3.  **Insight Revelation**: The system must highlight _at least one_ connection or summary point that the user hadn't explicitly articulated themselves (e.g., "It sounds like your pain spiked after the poor sleep").

### 2.4 Novel UX Patterns

- **The "Living Draft"**: Instead of a static transcript, the output is a structured set of "Cards" (Symptom Card, Insight Card, Action Card) that the user can approve or edit. This is a novel application of generative UI patterns to health logging.
- **Visual Unburdening**: We need a visual metaphor for the "dump." Perhaps the waveform "settles" into structured text blocks, visually representing the calming of chaos.

### 2.5 Experience Mechanics

1.  **Initiation**:
    - **Trigger**: Giant, pulsing "Listen" button on the home screen. No navigation required.
    - **Context**: "What's on your mind?" (Open-ended prompt).

2.  **Interaction (Unburdening)**:
    - **Input**: Natural language speech.
    - **Feedback**: Lively waveform that reacts to volume/pitch, proving active listening.
    - **Control**: Simple "Pause" and "Stop."

3.  **Transformation (The Turn)**:
    - **State**: "Thinking..." with a calm, breathing animation (masking the Wizard-of-Oz latency).
    - **Output**: The "Glass Box" view appears. "Here's what I heard. Is this right?"

4.  **Completion (Empowerment)**:
    - **Action**: User taps "Approve" or makes a micro-edit.
    - **Reward**: The cards fly into their respective "folders" (Journal, Profile), symbolizing organization. "Filed. You're all set."
