---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - "/Users/vincent_reynard/Developments/PROJECTS/mindmypain/_bmad-output/planning-artifacts/research/domain-mindmypain-thesis-research-2026-02-14.md"
  - "/Users/vincent_reynard/Developments/PROJECTS/mindmypain/docs/App Structure.pdf"
  - "/Users/vincent_reynard/Developments/PROJECTS/mindmypain/docs/Design Brief.pdf"
  - "/Users/vincent_reynard/Developments/PROJECTS/mindmypain/docs/Design Concept.pdf"
  - "/Users/vincent_reynard/Developments/PROJECTS/mindmypain/docs/Literature Review.pdf"
  - "/Users/vincent_reynard/Developments/PROJECTS/mindmypain/docs/MINDmyPAIN Health Management Journal (Physical).pdf"
  - "/Users/vincent_reynard/Developments/PROJECTS/mindmypain/docs/Vision Statement.pdf"
date: 2026-02-14
author: Vincent
---

# Product Brief: mindmypain

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

**MINDmyPAIN** is a patient-designed digital ecosystem that transforms the chaos of chronic pain management into organized empowerment. Born from a successful physical journal used in hospitals nationwide, this project digitizes that proven methodology and enhances it with **Generative AI** acting as a "Supportive Partner."

Unlike clinical tools designed for provider efficiency, MINDmyPAIN is built solely for the **patient's benefit**, helping them capture, organize, and communicate their health story. By leveraging ethical, transparent AI to transcribe appointments, summarize complex medical data, and identify symptom patterns, the platform bridges the communication gap between patients and providers—restoring dignity, improving outcomes, and putting patients back in control of their health journey.

---

## Core Vision

### Problem Statement

Healthcare systems are fundamentally designed for organizational efficiency, not patient empowerment. Patients with chronic conditions—particularly chronic pain—face a crisis of **disempowerment**:

*   **Information overload**: Critical health data is fragmented across portals and paper.
*   **Communication barriers**: Patients struggle to articulate complex histories in 15-minute appointments, often spending precious time correcting errors rather than receiving care.
*   **Credibility deficit**: Without organized evidence, patients typically feel unheard or stigmatized ("it's all in your head").

### Problem Impact

*   **Emotional**: Increased anxiety, feelings of helplessness, and loss of dignity.
*   **Clinical**: Misdiagnosis, dangerous medication interactions, and poor health outcomes.
*   **Systemic**: Wasted consultation time and increased strain on the healthcare system.

### Why Existing Solutions Fall Short

*   **Clinical-Centric Design**: Most apps prioritize data collection for clinicians or insurers, not utility for the patient.
*   **Passive Tracking**: They offer basic logging but lack the "intelligence" to help patients *make sense* of their data.
*   **Trust Deficit**: "Black box" AI tools often feel impersonal or exploitative, creating suspicion rather than support.
*   **Fragmentation**: Patients are forced to use multiple disconnected tools (calendar, notes, photos) to manage one cohesive health journey.

### Proposed Solution

A **comprehensive digital health management journal** that serves as a "living document" and intelligent companion for the patient.

*   **Smart Scribing**: AI that listens to appointments and generates structured summaries, removing the cognitive load of note-taking.
*   **Intelligent Organization**: Automatically categorizes blood results, scans, and referrals into a timeline that makes sense to the patient.
*   **Pattern Recognition**: AI that helps identify potential triggers (e.g., "Your pain flares often correlate with poor sleep two days prior") without being prescriptive.
*   **Preparation Support**: Generates pre-appointment summaries to help patients enter the consulting room prepared and confident.

### Key Differentiators

1.  **Lived Experience Foundation**: Created by a patient (Kim Sullivan), not a tech company, ensuring every feature solves a real, felt need.
2.  **Trustworthy AI**: A "Glass Box" approach where AI is a transparent *partner* that organizes and reflects, never diagnoses or overrides the patient.
3.  **Empowerment Focus**: Success is measured by the patient's feeling of control and agency, not just "medication adherence" or "data points logged."
4.  **Validated Methodology**: Built on the framework of a physical journal already endorsed by Pain Australia and adopted by hospitals.

## Target Users

### Primary Users

#### Persona 1: "The Veteran" - Sarah (45)
*   **Role**: Long-term chronic pain manager (10+ years).
*   **Context**: Lives with complex regional pain syndrome. Has seen dozens of specialists, tried countless medications, and feels "stuck" in the system.
*   **Motivation**: Wants to be heard and respected as an expert on her own body. Tired of explaining her history from scratch.
*   **Pain Points**:
    *   **Repetition**: "I spend the first 10 minutes of every appointment recurring my history."
    *   **Dismissal**: "Doctors often assume I'm drug-seeking or exaggerating."
    *   **Memory Fog**: "I forget what happened 3 weeks ago during a flare-up."
*   **Success**: Walking into a new specialist's office, handing over a clear 1-page AI summary, and starting the conversation at "advanced strategy" instead of "basic history."

#### Persona 2: "The Overwhelmed" - Michael (28)
*   **Role**: Recently diagnosed with a chronic autoimmune condition.
*   **Context**: Tech-savvy but health-illiterate. Suddenly flooded with appointments, scripts, and conflicting advice.
*   **Motivation**: Wants to regain a sense of control and "normalcy." Needs to understand what is happening to him.
*   **Pain Points**:
    *   **Chaos**: "I have papers everywhere, scripts in random bags, and I missed a blood test."
    *   **Anxiety**: "I don't know what's relevant to tell the doctor, so I tell them everything or nothing."
    *   **Isolation**: "I feel like I'm doing this alone."
*   **Success**: A "second brain" that tells him "Here's your summary for Dr. Lee tomorrow," reducing his pre-appointment anxiety to zero.

### Secondary Users

#### Healthcare Providers (Recipients)
*   **GPs, Pain Specialists, Physiotherapists**.
*   **Needs**: Concise, evidence-based summaries. They don't want "raw data"—they want insights (e.g., "Pain spiked 3x this month, correlated with X").
*   **Interaction**: They receive the AI-generated PDF/summary from the patient. They do not log into the app themselves.

#### Carers & Family
*   **Partners, Parents, Adult Children**.
*   **Needs**: Visibility into the patient's wellbeing without needing to nag ("Did you take your meds?").
*   **Interaction**: View "Shared Summaries" or status updates permitted by the patient.

### Validation Scenarios (Workshop Design)

These 10 scenarios are designed for 20-25 minute validation workshops (Wizard-of-Oz method), each targeting a specific empowerment hypothesis. **Note: Due to time constraints, only 2-3 scenarios will be selected per workshop session from this available pool.**

#### Scenario A: "The Pre-Appointment Summary"
*   **Target**: Sarah's Need for Credibility
*   **Goal**: Validate if an AI-generated summary makes the user feel more prepared and less anxious.
*   **Scenario Intro (2 mins)**: "Imagine you have an appointment with a new pain specialist tomorrow. You're worried about explaining your complex history in 15 minutes. You open MINDmyPAIN to help you prepare."
*   **Wizard-of-Oz Flow (7 mins)**:
    1.  **User**: Speaks to app: "I've had a rough month. Flare-ups every Tuesday, sleep is garbage."
    2.  **AI (Wizard)**: "I hear you. Looking at your logs, your pain spiked on Tuesdays, correlating with missed sleep on Mondays. Shall I add that to the summary?"
    3.  **User**: "Yes, and mention I'm worried about the new meds."
    4.  **AI (Wizard)**: Generates a 1-page PDF summary. "Here's a draft for Dr. Lee. It highlights the Tuesday pattern and your medication concern. Does this look right?"
*   **Discussion (10 mins)**: "Did seeing that summary make you feel more ready? Did you trust the AI's connection between sleep and pain?"

#### Scenario B: "The Post-Appointment Action Plan"
*   **Target**: Michael's Need for Order
*   **Goal**: Validate if AI scribing reduces cognitive load and creates a sense of control.
*   **Scenario Intro (2 mins)**: "You just finished a session with your physio. You're tired and in pain. You recorded the session with the app. Now you need to know what to actually *do* next week."
*   **Wizard-of-Oz Flow (7 mins)**:
    1.  **User**: Opens app. "Process the physio recording."
    2.  **AI (Wizard)**: "Done. The physio emphasized two exercises: 'Cat-Cow' stretches (morning) and 'Wall Angels' (evening). She also suggested booking a follow-up in 2 weeks. Shall I add these to your daily list?"
    3.  **User**: "Yes. And remind me about the stretches."
    4.  **AI (Wizard)**: "Added. I've also noted that she said your range of motion has improved by 10%. That's great progress!"
*   **Discussion (10 mins)**: "Did the AI capturing the tasks make you feel less overwhelmed? How did the 'progress' note make you feel?"

#### Scenario C: "The Pattern Detective"
*   **Target**: Sense-Making & Privacy Control
*   **Goal**: Validate if users value AI-driven insights into their own patterns and test their comfort with sensitive data analysis.
*   **Scenario Intro (2 mins)**: "You've been tracking your mood, pain, and medication sporadically for a month. You feel terrible but can't pinpoint why. You decide to ask the app to help you make sense of it."
*   **Wizard-of-Oz Flow (7 mins)**:
    1.  **User**: "Why is my pain worse this week?"
    2.  **AI (Wizard)**: "Let me check. It looks like your pain scores (avg 8/10) started climbing on Wednesday. That aligns with when you missed your nightly stretching routine. Also, did you notice your sleep quality dropped to 'Poor' on Monday night?"
    3.  **User**: "Oh, right. I was stressed about work."
    4.  **AI (Wizard)**: "Stress is a big factor. Would you like to note that down so we can track it next time? Also, as a reminder, this data stays on your device—I don't share it with your doctor unless you tell me to."
*   **Discussion (10 mins)**: "Did the connection between stress/sleep and pain feel helpful or invasive? Did the explicit privacy reminder change how you felt about sharing?"

#### Scenario D: "The Crisis Companion"
*   **Target**: Emotional Validation
*   **Goal**: Validate if an AI 'companion' can provide emotional validation during a flare-up without overstepping into medical advice.
*   **Scenario Intro (2 mins)**: "It's 3 AM. You're in a severe pain flare (8/10). You feel isolated and panicked. You open the app not for medical advice, but just to record what's happening and feel less alone."
*   **Wizard-of-Oz Flow (7 mins)**:
    1.  **User**: "It hurts so much. Nothing is working. I'm scared."
    2.  **AI (Wizard)**: "I'm sorry you're going through this right now. It sounds incredibly tough. You've gotten through flares like this before—remember last month? You are strong."
    3.  **User**: "I just need to breathe."
    4.  **AI (Wizard)**: "Breathing is good. Do you want me to guide you through a 2-minute box breathing exercise, or just listen?"
*   **Discussion (10 mins)**: "Did the AI's response feel supportive or patronizing? Did remind you of past resilience help?"

#### Scenario E: "The Medication Audit"
*   **Target**: Safety & Compliance
*   **Goal**: Validate if AI can simplify complex medication schedules without causing alarm or confusion.
*   **Scenario Intro (2 mins)**: "You just saw a new specialist who added two new pills to your regimen. You're worried about interactions and timing. You ask the app to organize it."
*   **Wizard-of-Oz Flow (7 mins)**:
    1.  **User**: Scanning pill bottles. "Add Lyrica 75mg twice daily and Targin 10mg morning."
    2.  **AI (Wizard)**: "Got it. Just a heads up—Lyrica can cause drowsiness, especially with your existing meds. Maybe take the evening dose *before* driving? I've updated your schedule."
    3.  **User**: "Oh, good to know. Thanks."
    4.  **AI (Wizard)**: "I've also set a reminder for 8 AM and 8 PM. Does that work for you?"

#### Scenario F: "The Evidence Collector"
*   **Target**: Practical Utility (Insurance/NDIS)
*   **Goal**: Validate if the app can help users build a credible case for external support.
*   **Scenario Intro (2 mins)**: "You're applying for disability support. They need 'evidence of functional impact.' You use the app to generate a report showing your bad days vs. good days."
*   **Wizard-of-Oz Flow (7 mins)**:
    1.  **User**: "I need a report for my NDIS claim. Show them how my pain affects my walking."
    2.  **AI (Wizard)**: "Okay. Over the last 3 months, you logged 'Severe impact on mobility' 12 times. Here's a chart showing pain levels vs. daily step count. Steps drop by 60% on high-pain days."
    3.  **User**: "Perfect. Can you add my journal entry from March 3rd about the fall?"
    4.  **AI (Wizard)**: "Added. 'March 3rd: Leg gave out due to spasm.' Report is ready to export."

#### Scenario G: "The Goal Setter"
*   **Target**: Positive Reframing
*   **Goal**: Validate if AI can shift focus from "pain management" to "life enablement."
*   **Scenario Intro (2 mins)**: "You're tired of just 'surviving.' You want to start gardening again. You ask the app to help you pace yourself."
*   **Wizard-of-Oz Flow (7 mins)**:
    1.  **User**: "I want to garden for 30 minutes this weekend."
    2.  **AI (Wizard)**: "That's a great goal! Based on your patterns, Saturday morning usually has lower pain scores. Maybe start with 15 minutes and take a break? I can remind you."
    3.  **User**: "Sounds sensible."
    4.  **AI (Wizard)**: "I'll check in with you on Saturday at 10 AM. Good luck!"

#### Scenario H: "The Flare Predictor"
*   **Target**: Proactive Management
*   **Goal**: Validate user comfort with predictive insights ("The Weather Forecast for Pain").
*   **Scenario Intro (2 mins)**: "The app proactively nudges you. It noticed a pattern you missed."
*   **Wizard-of-Oz Flow (7 mins)**:
    1.  **AI (Wizard)**: *Notification*: "Hi Sarah, just a heads up. A storm front is coming in tomorrow (barometric pressure drop). In the past, this triggered a migraine for you. Maybe prep your dark room toolkit tonight?"
    2.  **User**: "Wow, I didn't check the weather. Thanks."
    3.  **User**: "I'll make sure to have my meds ready."

#### Scenario I: "The Family Bridge"
*   **Target**: Communication with Carers
*   **Goal**: Validate how users share data with loved ones without losing autonomy.
*   **Scenario Intro (2 mins)**: "Your partner worries constantly. You want to give them peace of mind without answering 'How are you?' 50 times a day."
*   **Wizard-of-Oz Flow (7 mins)**:
    1.  **User**: "Share my 'Good Day' status with Mark."
    2.  **AI (Wizard)**: "Sharing: 'Feeling okay, pain manageable (4/10). Going for a walk.' Sent to Mark."
    3.  **User**: "Wait, don't show the pain score. Just say I'm okay."
    4.  **AI (Wizard)**: "Updated. Sending: 'Feeling okay. Going for a walk.' Better?"

#### Scenario J: "The Reflection Mirror"
*   **Target**: Long-term Insight
*   **Goal**: Validate if AI can help users see their own strength and resilience over time.
*   **Scenario Intro (2 mins)**: "It's New Year's Eve. You feel like you made no progress this year. You ask the app for a review."
*   **Wizard-of-Oz Flow (7 mins)**:
    1.  **User**: "Show me my year in review."
    2.  **AI (Wizard)**: "It was a tough year, but look at this: You managed 45 days of 'Low Pain' compared to 30 last year. And you stuck to your physio routine 80% of the time. You've built a lot of resilience."
    3.  **User**: "I guess I did."
    4.  **AI (Wizard)**: "Here's a word clould of your journal entries: 'Hope', 'Struggle', 'Garden', 'Family'. You focused a lot on what matters."

## Success Metrics (Thesis Scope)

### Primary Research Objective

To explore and validate the *perceived role* of Generative AI in empowering patients to manage chronic pain, moving beyond simple data tracking to active sense-making.

### User Success Metrics (Qualitative & Quantitative)

*   **Perceived Empowerment (The North Star)**:
    *   **Metric**: Post-scenario survey score (Likert scale) on: "I feel more confident explaining my condition to a new doctor using this tool."
    *   **Target**: >80% agreement from workshop participants.
*   **Perceived Utility**:
    *   **Metric**: "Would you trust this summary to represent you?"
    *   **Target**: Identification of specific "Trust Breakers" (e.g., "It missed my tone") vs. "Trust Builders" (e.g., "It caught the pattern").
*   **Cognitive Load Reduction**:
    *   **Metric**: Participant feedback on "Mental Effort" required to prepare for an appointment using AI vs. their current method.
    *   **Target**: Qualitative themes indicating "Relief" or "Offloading."

### Research & Project Milestones (KPIs)

1.  **Workshop Execution**:
    *   Conduct 3-4 validation workshops with 3-4 participants each (Total ~12-16 users).
    *   Successful execution of 10 Wizard-of-Oz scenarios without technical failure.
2.  **Insight Generation**:
    *   Identification of at least **3 distinct AI Empowerment Patterns** (e.g., "The Scribe," "The Translator," "The Mirror").
    *   Documentation of **Privacy Boundaries** (e.g., "Users will share X but never Y").
3.  **Academic Deliverables**:
    *   Master's Thesis submission by July 2026.
    *   Co-authored academic publication with Kim Sullivan.

### Business/Product Considerations (Future Phase Context)

*While not the primary measure for the thesis, we track these as indicators of viability:*

*   **Adoption Willingness**: "If this app existed today, would you download it?" (Target: >70% Yes).
*   **Feature Prioritization**: Clear ranking of features (e.g., AI Scribe > Symptom Logging) to inform the MVP build.

## MVP Scope

### Core Features (High-Fidelity Real-Time Prototype)

*   **Platform**: Responsive Web Application (Mobile-First Design).
*   **Architecture**:
    *   **Frontend**: React/Next.js for reactive UI updates.
    *   **Backend**: Real-time Database (e.g., Supabase/Firebase) enabling instant sync between User and Researcher views.
*   **AI Core (The "Brain")**:
    *   **Primary Intelligence**: Real LLM integration (e.g., Gemini Pro / GPT-4) generating initial drafts.
    *   **Researcher Override (Wizard Mode)**: A simple admin interface connected to the same database. Researchers can edit AI-generated text in real-time. Changes propagate instantly to the user's screen, maintaining immersion (e.g., "AI is refining its draft...").
*   **Key Modules**:
    1.  **Smart Journal**: Text/Voice input for daily logging.
    2.  **Scribe Mode**: Audio recording simulation -> Structured Summary generation.
    3.  **Collaborative Summary View**: The core artifact. Users see the AI draft, and Researchers can subtly correct hallucinations via the backend if needed.
    4.  **My Health Profile**: Static view of patient history (pre-filled for scenarios).

### Out of Scope for MVP

*   **Native Mobile Apps**: No iOS/Android store release; web-only distribution.
*   **Real Medical Record Integration**: No FHIR/HL7 integration with hospital systems.
*   **Complex Data Visualization**: No interactive charts; static images will be used for "trends" unless simple to implement.
*   **Long-term Storage/Backend**: Data will be session-based or stored locally per workshop; no robust cloud database user profiles beyond the workshop session.
*   **Payment/Subscription Features**: Purely functional prototype; no monetization logic.

### MVP Success Criteria

*   **Technical Stability**: Real-time sync updates <500ms latency.
*   **Research Validity**: The "Wizard" intervention (database edit) is imperceptible to the user (perceived as "AI processing").
*   **Safety**: The system refuses to provide medical diagnosis (via system prompt guardrails), redirecting to "consult your doctor."

### Future Vision (Post-Thesis)

*   **Full "App Store" Product**: Native implementation with persistent user accounts.
*   **Clinical Integration**: Secure sharing with leading EMRs (Medical Director, Best Practice).
*   **Wearable Sync**: Auto-import of sleep/activity data from Apple Health/Garmin.
*   **Community Module**: Anonymized peer support clusters ("Find others like me").
