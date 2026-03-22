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
FR_CS1: DESCOPED (App replaced by simple Glass Box Card and Chat)
FR_CS2: DESCOPED (Edit replaced by simple Add/Approve)
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

# Epic 3: Structured Health Records & Navigation

**Goal**: Transform the application from a chronological feed into a section-based health record matching the physical journal's mental model. Provide specific input forms and tables for Appointments, Medications, and Scripts.
**User Outcome**: Users can organize their health data logically, finding specific records quickly instead of scrolling through a continuous timeline.
**FRs covered**: FR_SJ2 (Categorization refinement), plus implied new requirements for structured forms.

### Story 3.1: Bottom Navigation Structure

As a patient user,
I want to navigate between different sections of my journal (Home, Appointment, Medication, Scripts & Referrals),
So that I can organize and find my health records logically.

**Acceptance Criteria:**

- **Given** the user is viewing the `/app/(patient)` layout
- **When** they look at the bottom of the screen
- **Then** they should see a fixed tab bar with icons for: Home, Appointment, Medication, Scripts
- **And** Tap interactions should route to respective views (`/app/journal`, `/app/appointments`, `/app/medications`, `/app/scripts`)

### Story 3.2: Appointment Record Glass Box

As a patient user,
I want a specific form to log my doctor appointments,
So that I can capture the exact details prescribed in my physical journal.

**Acceptance Criteria:**

- **Given** the user navigates to the Appointment tab OR the AI classifies an input as an Appointment
- **When** the entry is displayed
- **Then** it should render an `AppointmentGlassBox` component
- **And** Edit mode should provide explicit form fields for: Date, Profession, Practitioner Name, Visit Type, Location, Reason, Admin Needs (checkboxes), Questions, Outcomes, Follow-up Questions, Notes.
- **And** Saving updates the structured data in Supabase.

### Story 3.3: Medication Record Glass Box

As a patient user,
I want a specific form to log my medications,
So that I can track dosages, side effects, and adherence over time.

**Acceptance Criteria:**

- **Given** the user navigates to the Medication tab OR the AI classifies an input as a Medication log
- **When** the entry is displayed
- **Then** it should render a `MedicationGlassBox` component
- **And** Edit mode should provide explicit fields for: Brand Name, Generic Name, Dosage, Date Started, Reason, Side Effects, Feelings, Date Stopped, Stop Reason, Notes.
- **And** Saving updates the structured data in Supabase.

### Story 3.4: Scripts and Referrals Table

As a patient user,
I want to see a clear checklist of my pending prescriptions and referrals,
So that I can manage my pharmacy visits and admin tasks efficiently.

**Acceptance Criteria:**

- **Given** the user navigates to the Scripts & Referrals tab
- **When** the view loads
- **Then** it should display a data table or checklist view
- **And** The table should have columns/states for: Medication/Referral Name, To Be Filled, Filled (checkbox/toggle).

### Story 3.5: Intelligent Routing Parser Upgrade

As a patient user,
I want the AI to automatically file my "messy dumps" into the correct journal tabs,
So that I don't have to manually fill out the complex forms.

**Acceptance Criteria:**

- **Given** the user submits a voice/text entry
- **When** the system parses the input
- **Then** the `smart-parser.ts` logic should identify if the input represents an Appointment, Medication change, Script task, or general Agenda
- **And** The AI should attempt to populate the corresponding JSON schema for that specific category
- **And** The backend should set the `entry_type` correctly so it appears in the right tab's list view.

# Epic 4: AI Retrieval & Chat & Journal Accuracy

**Goal**: Implement the "Proactive Recall / Chat" interface to support Scenario 1 (Part B), fix the structural accuracy of the journal data model to match the physical MINDmyPAIN journal, and add a Guest persona.
**User Outcome**: Users can query their past health records through a conversational interface, and all entered data maps correctly to the physical journal's structure.

### Story 4.1: Guest Persona & Safe Mode

As a workshop participant,
I want to select a "Guest" persona from the login screen,
So that I can enter the app with a clean slate without prior history.

**Acceptance Criteria:**

- **Given** the user lands on the root url `/`
- **When** the page loads
- **Then** they should see a third card for "Guest" alongside Sarah and Michael
- **And** Clicking it sets the active `personaId` to `guest` and creates a fresh state for logging
- **And** No seed data should be pre-loaded for the Guest persona.

### Story 4.2: Journal Data Model Accuracy

As a patient user,
I want the app to use the exact structure of my physical MINDmyPAIN journal,
So that I am familiar with the required fields (Day, Sleep, Pain, Feeling, Action, Gratitude, Meds, Mood).

**Acceptance Criteria:**

- **Given** the application's data models
- **When** the user interfaces with the Journal entries
- **Then** the parsing and structure should strictly support:
  - Day / Date
  - Hours of restful sleep / How did you sleep?
  - Pain out of 10
  - Right now I am feeling (Free text)
  - What can I do to feel better today?
  - I am grateful for...
  - Medication (Morning, Midday, Evening)
  - Mood (Scale of 22 specific moods)

### Story 4.3: Smart Parser Fallback & Terminology

As a patient user,
I want the AI parser to never lose my data, and to use the term "Journal" instead of "Agenda",
So that unrecognized inputs are safely filed under general notes.

**Acceptance Criteria:**

- **Given** the Smart Parser (`smart-parser.ts`) processes an unstructured input
- **When** the AI cannot determine a specific category
- **Then** it must explicitly map the raw text into a "Right now I am feeling" or a general "Notes" field.
- **And** the term "Agenda" should be globally renamed to "Journal" in the UI and routing terminology.

### Story 4.4: GlassBoxCard Edit State Fix

As a patient user,
I want to edit structured data in a user-friendly form within the Glass Box,
So that I don't have to look at or edit raw JSON.

**Acceptance Criteria:**

- **Given** an AI-generated GlassBoxCard is presented
- **When** the user clicks "Edit"
- **Then** the card must switch into an explicit form UI, parsing the schema into distinct, editable text fields
- **And** raw JSON strings should not be visible or editable by the direct user.

### Story 4.5: Proactive Recall / Chat Interface

As a patient user,
I want to chat with an AI assistant about my past records via a chat interface,
So that I can easily recall information like "When was my last pain flare?".

**Acceptance Criteria:**

- **Given** the user navigates to the Chat/Recall tab (or accesses it via the dashboard)
- **When** the user asks a natural language question about their history
- **Then** the interface should respond contextually based on their approved journal entries
- **And** the UI should resemble a clean messaging/chat interface, supporting conversational turns.

# Epic 5: Feedback Fixes & UX Polish

**Goal**: Address targeted feedback from Epic 4 to improve UX polish and data correctness before starting the Wizard dashboard work.
**User Outcome**: Patients get a smoother chat experience, clearer action labeling, and correct script status across views.
**FRs covered**: FR_PR1, FR_SJ4

### Story 5.1: Chat Follow-up Suggestions

As a patient user,
I want 2-3 suggested follow-up questions after each AI response,
So that I can continue the conversation without thinking too hard.

**Acceptance Criteria:**

- **Given** the assistant responds in `/chat`
- **When** the response is rendered
- **Then** 2-3 follow-up suggestions appear as chips under the last assistant message
- **And** clicking a chip sends that question as the next user message
- **And** suggestions are derived from the assistant response context

### Story 5.2: Replace "Approve" with "Add"

As a patient user,
I want the Glass Box action labeled "Add" instead of "Approve",
So that the action feels less clinical and more welcoming.

**Acceptance Criteria:**

- **Given** any Glass Box card in the patient UI
- **When** the primary action is displayed
- **Then** it reads "Add" instead of "Approve"
- **And** no underlying behavior changes (status still transitions to approved)

### Story 5.3: Script "Filled" Status Persists Across Views

As a patient user,
I want the Filled status of scripts to persist across the Scripts and Journal views,
So that the checklist reflects the true state everywhere.

**Acceptance Criteria:**

- **Given** a script entry is toggled to Filled in `/scripts`
- **When** I return to `/journal`
- **Then** the script status remains Filled in the Glass Box view
- **And** the status persists after refresh

# Epic 6: Creator Feedback & Core Refinements

**Goal**: Address feedback and requests from the original creator, Kim, and resolve technical debt before tackling the Wizard Dashboard.
**User Outcome**: Kim has a dedicated environment to test the app to her true experience. Users can archive and manage journal entries. The underlying state management is refactored for proper parallel execution.

### Story 6.1: Kim's Account

As the creator,
I want a specific account and login screen protected by a password,
So that I can test the app with my true experience without interference from simulated personas.

**Acceptance Criteria:**

- **Given** the login screen
- **When** I navigate to `/kim`
- **Then** I am prompted for a password
- **And** upon successful entry, I am logged in to Kim's specific persona environment

### Story 6.2: Archive Feature

As a patient user,
I want to be able to soft delete or archive journal entries,
So that I can manage my history and review archived items without permanently losing data.

**Acceptance Criteria:**

- **Given** a journal entry
- **When** I select "Archive"
- **Then** the entry is soft-deleted and moved to an archived view
- **And** I can permanently delete archived items individually or in bulk

### Story 6.3: Login UX Refinement

As a user,
I want a visible "Login" button on the login screen,
So that I don't have to manually press 'enter' inside the text box when a password manager auto-fills the field.

**Acceptance Criteria:**

- **Given** the login screen
- **When** I click the "Login" button after entering or auto-filling credentials
- **Then** it authenticates without requiring a manual 'enter' keystroke inside the input field

### Story 6.4: Smart Parser Fallback Bug Fix

As a patient user,
I want unrecognized entries to properly default to the general Notes field,
So that I don't lose data when the AI cannot categorize an entry.

**Acceptance Criteria:**

- **Given** an unstructured voice/text input that doesn't fit specific categories
- **When** the AI processes the entry
- **Then** the content should default into a "Notes" or "Right now I am feeling" field
- **And** the fields should not be empty upon review/edit

### Story 6.5: Voice-to-Text in Proactive Chat

As a patient user,
I want to use voice-to-text natively within the chat interface,
So that interacting with my past records is as frictionless as journaling.

**Acceptance Criteria:**

- **Given** the Proactive Recall / Chat interface
- **When** I tap the microphone icon
- **Then** it records voice and transcribes it directly into the chat input
- **And** sending the transcribed query works seamlessly like text input

### Story 6.6: Hilary's Account

As a researcher,
I want a specific account for "Hilary" that functions exactly like Kim's protected account,
So that we can support an additional specific user context for testing.

**Acceptance Criteria:**

- **Given** the login screen
- **When** I navigate to `/hilary` or select Hilary
- **Then** I am prompted for a password
- **And** upon successful entry, I am logged into Hilary's specific persona environment

### Story 6.7: State Management & Optimistic UI Refactor

As a developer,
I want to refactor the Zustand store and optimistic UI logic,
So that the application can properly handle parallel server actions and regressions are avoided.

**Acceptance Criteria:**

- **Given** the application's state management
- **When** parallel server actions are dispatched
- **Then** the optimistic UI precisely reflects the state without breaking or conflicting
- **And** the Zustand store is robust enough to handle these parallel actions reliably

# Epic 7: Core Refinements & Functional Expansion

**Goal**: Address immediate functional gaps identified in post-Epic 6 testing prior to opening the Dashboard view, expanding structured health records to include demographics and immunizations, and standardizing Date inputs across the parse engine.
**User Outcome**: Users gain a dedicated profile and immunization tracking, while experiencing fewer logic errors with dates and easier mobile text entry.

### Story 7.1: Global Date Formatting & Relative Time Calculation

As a patient user,
I want the app to interpret phrases like "Next Tuesday" and save them strictly as `dd-mm-yyyy`,
So that my records maintain a clear, unconfused timeline.

**Acceptance Criteria:**

- **Given** I input a phrase with a relative date
- **When** the AI parser processes it
- **Then** it calculates the true date relative to the journal's creation date
- **And** all parsed date strings explicitly use the `dd-mm-yyyy` format across the UI

### Story 7.2: Chat UI Responsive Fixes & Auto-expanding Input

As a patient user,
I want my typing space in Chat to expand as I write on mobile and the placeholder text to wrap,
So that I can compose longer entries without text getting cut off.

**Acceptance Criteria:**

- **Given** the mobile chat interface
- **When** I type multiple lines
- **Then** the text area vertically expands to show the active text
- **And** the "Ask a question..." prompt wraps naturally on small screens instead of truncating

### Story 7.3: The "My Detail" Profile Page

As a patient user,
I want a dedicated form to manage my static medical and personal demographics,
So that I don't have to repeatedly enter standard context (like allergies or name changes).

**Acceptance Criteria:**

- **Given** the Profile avatar menu
- **When** I click "My Detail"
- **Then** I am taken to a form mapping to the `profiles` table schema
- **And** I can edit fields like Name, DOB, Address, Medicare No, Languages spoken, Allergies, etc.

### Story 7.4: Immunisation Record Component & Parser

As a patient user,
I want a specific tab to log my Vaccines and Immunizations,
So that I can securely track brand names and dates given over the course of years.

**Acceptance Criteria:**

- **Given** the bottom navigation and Parsers
- **When** I tap "Immunisation" (or AI parses an immunization note)
- **Then** I am presented with a `ImmunisationGlassBox`
- **And** it requests explicit fields: Vaccine Name, Date Given (`dd-mm-yyyy`), and Brand Name
- **And** the smart parser accurately routes and structures this data

### Story 7.5: Dedicated Journal Page & Clear Input Functionality

As a patient user,
I want a dedicated "Journal" page to view my raw journal reflections and a "Clear" button for the input box on the home page,
So that I can specifically review my thoughts without clutter and easily wipe my draft inputs.

**Acceptance Criteria:**

- **Given** the main navigation and home page
- **When** I want to see only my thoughts
- **Then** I can navigate to a dedicated "Journal" page that displays only "Raw Journal" entries (excluding Meds/Scripts/Appointments)
- **And** the input text box on the home page features a "Clear" button to quickly wipe the current text field.

### Story 7.6: Session Persistence Fix

As an end user (and creator Kim),
I want my selected persona login to persist even when my phone screen locks or goes into the background,
So that I don't have to keep logging back in every time I pull my phone out.

**Acceptance Criteria:**

- **Given** I am logged into a specific persona (e.g. Kim, Sarah, Michael)
- **When** I lock my phone screen or leave the browser tab open for an extended period
- **Then** my session should not reset
- **And** upon returning, I should remain on the authenticated view without needing to re-enter credentials or select a persona again.

### Story 7.7: Appointment Form Enhancements

As a patient user,
I want more detailed fields on the Appointment card to accurately record my doctor visits,
So that I can log the exact time, appointment type, address, purpose, and track required repeat prescriptions.

**Acceptance Criteria:**

- **Given** I am viewing an Appointment Glass Box (in `/appointments` or `/journal`)
- **When** the entry is in edit mode or viewed
- **Then** there should be a "Time" field formatted as HH:MM AM/PM
- **And** an "In-person / Telehealth" radio selection under the Profession/Practitioner Name
- **And** the "Location" field should be renamed to "Address"
- **And** under "Reason for Visit", the "Admin Needs" heading should be removed
- **And** the chip selections under "Reason for Visit" should be updated to exclusively: "Repeat Prescription", "Medical Certificate", "Specialist Referral", and "Pathology Referral"
- **And** a "Repeat Prescription" list section should be added under "Questions to Ask" (before Outcomes/Plan) where I can add items dynamically.

### Story 7.8: Medication History View Fix

As a patient user,
I want to see my medication logs fully structured with brand names and dosages on the Medications page,
So that I can review my actual structured data, rather than just the raw input note.

**Acceptance Criteria:**

- **Given** I navigate to the Medications tab (`/medications`)
- **When** the list of medication entries loads
- **Then** the entries should render using the full `MedicationGlassBox` component UI (like they do on the Home page)
- **And** they should visually display the parsed structured data (Brand Name, Dosage, etc) instead of just the raw log note.

### Story 7.9: Mary-Lynne's Account

As a collaborator,
I want a specific account for "Mary-Lynne" that functions exactly like Kim and Hilary's protected accounts,
So that I can test the app with my true experience without interference.

**Acceptance Criteria:**

- **Given** the login screen
- **When** I navigate to `/mary-lynne` or select Mary-Lynne
- **Then** I am prompted for a password
- **And** upon successful entry, I am logged into Mary-Lynne's specific persona environment

# Epic 8: The Wizard's Dashboard & Scenario Control (Deferred)

**Goal**: Enable the Researcher to monitor live sessions and trigger specific "Scenario Responses" or edit text in real-time. (Deferred).
**User Outcome**: (Researcher) Can invisibly drive the workshop scenarios. (Patient) Receives intelligent, context-aware responses that feel like a "Magic" AI.
**FRs covered**: FR_WD1, FR_WD2, FR_WD3

### Story 8.1: Researcher Dashboard Overview

As a researcher,
I want a dashboard where I can see the active session for "Sarah" or "Michael",
So that I can monitor their inputs in real-time.

**Acceptance Criteria:**

- **Given** the user is on `/app/dashboard`
- **When** the page loads
- **Then** they should see two panels: "Active Patient: Sarah" and "History Log"
- **And** The interface should clearly distinguish between 'User Input' (Left) and 'AI Response' (Right)
- **And** It should show the current connection status (Online/Offline)
- **And** Must adhere to `@simulated-auth-only` principles for viewing across users.

### Story 8.2: Live Stream & Real-time Updates

As a researcher,
I want incoming patient logs to appear instantly (<500ms),
So that I can respond quickly and maintain the illusion of a fast AI.

**Acceptance Criteria:**

- **Given** the dashboard is open
- **When** a patient submits a new log via Epic 2/3 forms
- **Then** the new entry should appear at the top of the feed immediately (Supabase Realtime)
- **And** A visual indicator should flash to grab my attention (NFR_USE2)

### Story 8.3: Wizard Intervention Actions (Edit/Scenario Trigger)

As a researcher,
I want to edit the AI-generated draft before the patient sees it,
So that I can correct hallucinations or improve the tone.

**Acceptance Criteria:**

- **Given** a new drafted response appears in the dashboard
- **When** I click "Edit"
- **Then** the text area (or structured JSON form) should become editable
- **And** I can type new content or correct form fields
- **And** Clicking "Push to Patient" should update the `journal_entries` status to `pending_review` (visible to patient)

### Story 8.4: Pre-Canned Response Library

As a researcher,
I want a library of pre-written responses for the specific workshop scenarios,
So that I don't have to type long medical summaries in 7 minutes.

**Acceptance Criteria:**

- **Given** I am responding to an input
- **When** I click the "Scenario Library" button
- **Then** a modal should open with options matched to the structured schemas (e.g., `[New Appointment Pattern]`, `[Medication Review Alert]`)
- **And** Selecting one should auto-fill the response editor with the scripted text/json
- **And** I can still make minor edits before pushing

### Story 8.5: "Thinking State" Indication

As a patient user,
I want to see a "AI is thinking..." animation while the researcher is preparing a response,
So that I know the system hasn't crashed.

**Acceptance Criteria:**

- **Given** the researcher is editing/typing a response (dashboard active)
- **When** the entry status is `draft` (backend state)
- **Then** the patient UI should show a "pulsing brain" or "Thinking..." skeleton loader
- **And** It should persist until the status changes to `pending_review`
- **Given** the researcher is editing/typing a response (dashboard active)
- **When** the entry status is `draft` (backend state)
- **Then** the patient UI should show a "pulsing brain" or "Thinking..." skeleton loader
- **And** It should persist until the status changes to `pending_review`

### Story 6.8: Remove "Save as Doctor Summary" Feature

As a patient user,
I do not want to see a specific "Save as Doctor Summary" feature,
So that I am not confused about how it differs from the proactive chat interface.

**Acceptance Criteria:**

- **Given** the active application views
- **When** navigating through the journal or chat
- **Then** any UI elements (buttons, forms, cards) related to generating or approving a "Doctor Summary" or "Clinical Summary" should be removed.
- **And** the primary way to recall data for doctor visits is explicitly directed through the Proactive Chat interface.

### Story 6.9: Refactor Data Model to Remove `clinical_summary` Type

As a developer,
I want to remove the redundant `clinical_summary` data types and seed data,
So that the database schema correctly reflects the active features of the application.

**Acceptance Criteria:**

- **Given** the database schema and seed data
- **When** the "Save as Doctor Summary" feature is removed
- **Then** the `clinical_summary` entry type should be removed from the `journal_entry_type` enum (or safely deprecated).
- **And** any existing seed data (e.g., Sarah's Entry 4) should be converted to a standard `journal` entry or removed/updated to reflect the new structure.
- **And** the `smart-parser.ts` logic must no longer attempt to classify inputs as `CLINICAL_SUMMARY`.
