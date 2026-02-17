---
stepsCompleted:
  - step-01
  - step-02
  - step-03
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# mindmypain - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for mindmypain, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR_SJ1: Primary User can enter logs via Voice (audio recording) or Text.
FR_SJ2: System must analyze unstructured input and infer appropriate categories (e.g., "Took Panadol" -> Tags: Medication).
FR_SJ3: System must support multi-intent extraction from a single entry (e.g., Symptoms + Meds + Sleep).
FR_SJ4: Primary User can review and manually correct AI-inferred tags before saving (Glass Box Pattern).
FR_SJ5: Primary User can view a "Daily List" of entries, mirroring the physical journal structure.
FR_SC1: Primary User can initiate "Scribe Mode" to record long-form audio.
FR_SC2: System displays a visual "Processing" state to maintain immersion while the summary is generated.
FR_SC3: System displays the generated "Meeting Summary" (Action Items, Key Insights) only after Researcher approval.
FR_CS1: Primary User can view AI-generated drafts of their summaries.
FR_CS2: Primary User can manually edit the text of any AI-generated draft.
FR_CS3: Primary User can "Approve" a draft to save it to their permanent record.
FR_WD1: Researcher can view incoming text/audio inputs from active sessions in real-time.
FR_WD2: Researcher can overwrite AI-generated text responses before they are displayed to the user.
FR_WD3: Researcher can trigger "Insight Cards" (pre-defined pattern notifications) to appear on the user's dashboard.
FR_AP1: System provides a "Select Persona" screen (Sarah/Michael) instead of complex login.
FR_AP2: System loads pre-filled "seed data" (history, meds) based on the selected Persona.
FR_AP3: System operates Online Only (no offline persistence required for prototype).

### NonFunctional Requirements

NFR_PERF1: Real-time Latency: Data sync between User and Researcher must occur in < 500ms.
NFR_PERF2: Scribe Feedback: Visual feedback for "Processing" states must appear in < 100ms.
NFR_REL1: Session Continuity: Zero crashes during continuous 90-minute workshop sessions.
NFR_USE1: Wizard Speed: Dashboard interaction design must allow edits/pushes in < 10 seconds to avoid breaking immersion.
NFR_USE2: Attention Management: Visual indicators must clearly highlight which User requires attention.
NFR_ACC1: High contrast text and UI elements.
NFR_ACC2: Touch targets > 44px for users with motor impairments.
NFR_DATA1: Immediate state recovery if a user disconnects and reconnects.

### Additional Requirements

- **Starter Template:** `npx create-next-app@latest mindmypain --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`.
- **Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI, Supabase (Postgres + Realtime + Auth/RLS simulated).
- **Audio:** OpenAI Whisper API (`openai-node` v4.28+).
- **Hosting:** Vercel + Supabase.
- **State Management:** Zustand (v5.0.0+) for client state, `@supabase/ssr` for server state.
- **Data Model:** Single Table (`journal_entries`) with `status` Enum (`draft`, `pending_review`, `approved`).
- **Auth Strategy:** No Auth Flow (Simulated Profiles: Sarah, Michael, Guest) using `UserContext`.
- **Project Structure:** Restricted to specific directory layout (`app/(patient)`, `app/(wizard)`, etc.).
- **Design System:** Custom tokens for "Calm" aesthetic, Radix UI primitives.
- **Interaction:** Waveform visualization, "Looking for patterns" animations.
- **Mobile-First:** Patient view.
- **Desktop-First:** Researcher view.
- **Frictionless Dump:** Record action in <2 seconds.
- **Wizard-of-Oz Illusion:** Gracefully handle latency (<10s) with engaging "Thinking" states.

### FR Coverage Map

FR_SJ1: Epic 2 - Voice/Text Input
FR_SJ2: Epic 2 - Infer Tags/Categories
FR_SJ3: Epic 2 - Multi-Intent Extraction
FR_SJ4: Epic 2 - Glass Box Review
FR_SJ5: Epic 2 - Daily List View
FR_WD1: Epic 3 - Real-time View
FR_WD2: Epic 3 - Overwrite/Drafting
FR_WD3: Epic 3 - Trigger Insight Cards
FR_AP1: Epic 1 - Persona Selector
FR_AP2: Epic 1 - Seed Data
FR_AP3: Epic 1 - Online Only
FR_SC1: DESCOPED (Long-form Scribe)
FR_SC2: DESCOPED (Scribe Processing)
FR_SC3: DESCOPED (Meeting Summary - replaced by Short-form Scenario 2)
FR_CS1: DESCOPED (App replaced by simple Glass Box Card)
FR_CS2: DESCOPED (Edit replaced by simple Approve)
FR_CS3: DESCOPED (Approve)

## Epic List

### Epic 1: Project Foundation & Persona Access

**Goal**: Establish the technical skeleton, Real-Time DB connection, and the "Simulated Persona" access mechanism (Sarah/Michael) to allow immediate workshop entry without onboarding barriers.
**User Outcome**: Users can launch the app, select a persona, and enter a state with pre-populated seed data.
**FRs covered**: FR_AP1, FR_AP2, FR_AP3, NFR_REL1, NFR_ACC1

### Story 1.1: Project Initialization & Infrastructure

As a developer,
I want to initialize the Next.js project with Supabase, Shadcn, and OpenAI,
So that the team has a standard foundation for building features.

**Acceptance Criteria:**

**Given** a clean development environment
**When** the `npx create-next-app` command is run with TypeScript, Tailwind, and App Router
**Then** the project structure should match the "Architecture Decision Document"
**And** Shadcn UI should be initialized
**And** `@supabase/ssr` and `openai` packages should be installed
**And** `README.md` should be updated with setup instructions

### Story 1.2: Database Migration & Seed Data

As a workshop participant,
I want the database to be pre-populated with realistic history for "Sarah" and "Michael",
So that scenarios feel lived-in and I don't start with a blank screen.

**Acceptance Criteria:**

**Given** the database is empty
**When** the seed script is run
**Then** the `journal_entries` table should be created with valid schema
**And** At least 5 approved entries should exist for "Sarah" (showing chronic history)
**And** At least 5 approved entries should exist for "Michael" (showing anxiety)
**And** The status of these entries should be `approved`

### Story 1.3: Persona Selector & Context

As a workshop participant,
I want to select "Sarah" or "Michael" from a simple landing page,
So that I can enter the correct scenario without creating an account.

**Acceptance Criteria:**

**Given** the user lands on the root url `/`
**When** the page loads
**Then** they should see two distinct cards: "Start as Sarah" and "Start as Michael"
**And** Clicking "Sarah" should set the global `UserContext` to Sarah's ID
**And** The user should be redirected to `/app/journal`
**And** No password or email should be required

### Story 1.4: Mobile-First Patient Layout

As a patient user,
I want the app interface to feel calm and accessible on mobile,
So that I can use it comfortably even during a pain flare.

**Acceptance Criteria:**

**Given** the user is on a mobile device
**When** they navigate to any `/app/(patient)` route
**Then** they should see a dedicated mobile layout (bottom nav or simple header)
**And** The color palette should use the "Calm" tokens (soft blues/greens, no harsh contrasts)
**And** Touch targets for primary actions should be >44px
**And** This layout should be distinct from the Desktop Researcher dashboard

### Epic 2: Smart Journaling & "Glass Box" Interface

**Goal**: Enable users to capture short-form voice/text notes and view AI-generated "Glass Box" cards (Tags, Agendas, Summaries) that organize their chaos. This epic now encompasses the UI for all three Workshop Scenarios.
**User Outcome**: Users can clear their head (brain dump) and immediately see a structured, editable reflection of their input, validating the "Active Partner" thesis.
**FRs covered**: FR_SJ1, FR_SJ2, FR_SJ3, FR_SJ4, FR_SJ5

### Story 2.1: Journal Entry Input (Voice/Text)

As a patient user,
I want to log a thought or symptom by speaking or typing,
So that I can capture my data quickly without friction.

**Acceptance Criteria:**

**Given** the user is on the main journal view `/app/journal`
**When** they tap the "Microphone" button
**Then** the app should start recording audio (showing a waveform)
**And** Tapping "Stop" should send the audio to the backend (`/api/scribe`)
**And** The audio should be transcribed via Whisper and returned as text in the input box
**And** The user can also type text directly into the input box

### Story 2.2: Daily List View

As a patient user,
I want to see my journal entries grouped by date,
So that I can review my health history chronologically.

**Acceptance Criteria:**

**Given** the user has existing journal entries
**When** they scroll the main journal view
**Then** entries should be grouped under Date Headers (e.g., "Today", "Yesterday")
**And** Each entry should show its timestamp and a snippet of content
**And** The entries should support different types (Raw Text vs. Glass Box Cards)

### Story 2.3: The "Glass Box" Card Component

As a patient user,
I want AI-generated content to appear in a clear, structured "Card" that I can edit,
So that I feel in control of what is saved to my record.

**Acceptance Criteria:**

**Given** the AI has processed an input
**When** the result is returned
**Then** it should render as a "Glass Box" Card (Visually distinct from user text)
**And** The card should have an "Edit" button that makes fields editable
**And** The card should have an "Approve" button that saves the content to the DB with status `approved`
**And** It should support different schemas: Simple Text, Agenda List, or Clinical Summary

### Story 2.4: Integration: Smart Parsing (Scenario 1 & 3)

As a patient user,
I want the app to sort my "messy dump" into an organized Agenda or Task List, (Scenario 1 & 3)
So that I don't forget important items.

**Acceptance Criteria:**

**Given** the user inputs a messy string like "Knee hurts, need physio referral, refill meds"
**When** they submit the entry
**Then** the backend should classify this as `type: AGENDAS`
**And** The AI should return a JSON structure parsing: Clinical Symptoms, Admin Tasks, Questions
**And** The frontend should render this as a categorized "Agenda Card" (Glass Box)

### Story 2.5: Integration: Clinical Summary (Scenario 2)

As a patient user,
I want the app to generate a professional summary for my doctor, (Scenario 2)
So that I can communicate my history effectively without anxiety.

**Acceptance Criteria:**

**Given** the user inputs specific medical details (e.g., "Lyrica side effects")
**When** they request a summary (via prompt)
**Then** the backend should classify this as `type: CLINICAL_SUMMARY`
**And** The AI should return a JSON structure with sections: Chief Complaint, Med Review, Patient Goal
**And** The frontend should render this as a "Doctor Letter Card" (Glass Box) ready for approval

### Epic 3: The Wizard's Dashboard & Scenario Control

**Goal**: Enable the Researcher to monitor live sessions and trigger specific "Scenario Responses" (e.g., Clinical Summary, Agenda, Pacing Alert) or edit text in real-time.
**User Outcome**: (Researcher) Can invisibly drive the workshop scenarios. (Patient) Receives intelligent, context-aware responses that feel like a "Magic" AI.
**FRs covered**: FR_WD1, FR_WD2, FR_WD3

### Story 3.1: Researcher Dashboard Overview

As a researcher,
I want a dashboard where I can see the active session for "Sarah" or "Michael",
So that I can monitor their inputs in real-time.

**Acceptance Criteria:**

**Given** the user is on `/app/dashboard`
**When** the page loads
**Then** they should see two panels: "Active Patient: Sarah" and "History Log"
**And** The interface should clearly distinguish between 'User Input' (Left) and 'AI Response' (Right)
**And** It should show the current connection status (Online/Offline)

### Story 3.2: Live Stream & Real-time Updates

As a researcher,
I want incoming patient logs to appear instantly (<500ms),
So that I can respond quickly and maintain the illusion of a fast AI.

**Acceptance Criteria:**

**Given** the dashboard is open
**When** a patient submits a new log via Epic 2
**Then** the new entry should appear at the top of the feed immediately (Supabase Realtime)
**And** A visual indicator should flash to grab my attention (NFR_USE2)

### Story 3.3: Wizard Intervention Actions (Edit/Scenario Trigger)

As a researcher,
I want to edit the AI-generated draft before the patient sees it,
So that I can correct hallucinations or improve the tone.

**Acceptance Criteria:**

**Given** a new drafted response appears in the dashboard
**When** I click "Edit"
**Then** the text area should become editable
**And** I can type new content
**And** Clicking "Push to Patient" should update the `journal_entries` status to `pending_review` (visible to patient)

### Story 3.4: Pre-Canned Response Library

As a researcher,
I want a library of pre-written responses for the specific workshop scenarios,
So that I don't have to type long medical summaries in 7 minutes.

**Acceptance Criteria:**

**Given** I am responding to an input
**When** I click the "Scenario Library" button
**Then** a modal should open with options: `[Scenario 1: Pacing Alert]`, `[Scenario 2: Clinical Summary]`, `[Scenario 3: Agenda]`
**And** Selecting one should auto-fill the response text area with the scripted text
**And** I can still make minor edits before pushing

### Story 3.5: "Thinking State" Indication

As a patient user,
I want to see a "AI is thinking..." animation while the researcher is preparing a response,
So that I know the system hasn't crashed.

**Acceptance Criteria:**

**Given** the researcher is editing/typing a response (dashboard active)
**When** the entry status is `draft` (backend state)
**Then** the patient UI should show a "pulsing brain" or "Thinking..." skeleton loader
**And** It should persist until the status changes to `pending_review`
