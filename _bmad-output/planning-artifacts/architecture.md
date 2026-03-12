---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: "architecture"
lastStep: 8
status: "complete"
completedAt: "2026-02-15"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

- **Smart Journaling & Scribe Mode**: Core value loops involving voice/text capture, highly interactive "Glass Box" review (AI draft -> User edit -> Approve), and structured evidence generation.
- **Researcher Mediation (Wizard-of-Oz)**: A critical "invisible" requirement where a researcher intercepts and modifies data in real-time. This requires a dedicated, synchronized dashboard.
- **Persona-Based Access**: Simplified authentication using pre-defined personas (Sarah/Michael) with seeded data, removing standard onboarding friction for the prototype.
- **Online-Only Operation**: Explicit decision to forego offline persistence for the prototype to prioritize real-time sync stability.

**Non-Functional Requirements:**

- **Real-Time Latency (<500ms)**: Critical for the "illusion" of AI. The researcher must see inputs and respond instantly.
- **Immersive Stability**: Zero crashes during 90-minute workshops. The "magic" breaks if the app stalls.
- **Accessibility (WCAG 2.1 AA)**: High contrast and large touch targets (>44px) are mandatory for the chronic pain user demographic.
- **Responsive Duality**: Strict mobile-first view for Patients (vertical) vs. desktop-optimized view for Researchers (dashboard).

**Scale & Complexity:**

- **Primary Domain**: Web Application (React/Next.js SPA) with Real-Time Backend (Supabase/Firebase).
- **Complexity Level**: **Medium-High Interaction / Low Scale**. While user count is low (research cohort), the _interaction complexity_ is high due to the real-time, bi-directional, human-in-the-loop data flow.
- **Estimated Components**: ~25-30 (Core views: Journal, Scribe, Dashboard; Primitives: Cards, Inputs, Waveforms; Layouts).

### Technical Constraints & Dependencies

- **Real-Time Database**: strict dependency on a service like Supabase or Firebase to handle the WebSocket sync required for the Wizard-of-Oz workflow.
- **Browser Compatibility**: Must support latest iOS Safari and Android Chrome capabilities for audio recording and seamless playback.
- **No Native Native Wrappers**: Pure web (PWA-style) execution; no React Native or Capacitor at this stage.

### Cross-Cutting Concerns Identified

1.  **The "Wizard" Data Flow**: Every AI interaction is actually a tri-state flow (User Input -> Researcher Pending -> Researcher Approved -> User View). This state machine affects Data Access Layers and UI feedback loops globally.
2.  **Audio State Management**: Global management of recording states (permissions, active recording, processing, playback) across the application.
3.  **Draft vs. Committed Data**: The "Glass Box" pattern requires a distinct separation between "provisional" data (drafts) and "clinical" data (approved records) in the data model.

## Starter Template Evaluation

### Primary Technology Domain

**Web Application (Next.js SPA)** with **Real-Time Backend (Supabase)**.

### Backend Decision: Supabase vs. Firebase

- **Decision:** **Supabase** (Recommended & Selected)
- **Rationale:**
  - **Structure:** SQL Schema prevents data drift in the complex "Draft/Commit" workflow.
  - **Safety:** Automated TypeScript type generation creates a rigid "Glass Box" contract between Frontend and Backend.
  - **Security:** Row Level Security (RLS) policies allow precise isolation between "Patient" and "Researcher" views (e.g., `policy "Wizard can see all"`, `policy "Patient sees own"`).

### Selected Starter: Clean Slate (Custom Setup)

**Rationale for Selection:**
We choose a **Clean Slate** approach using standard CLI tools over a pre-built SaaS starter.

1.  **Avoid Bloat:** The architecture requires specific "Wizard/Scribe" logic, not generic SaaS boilerplate (Stripe, Blog, Landing Pages, etc.) that comes with most starters.
2.  **Control:** We need precise control over the `shadcn/ui` components to implement the unique "Glass Box" and "Scribe" UX patterns.
3.  **Stability:** Dependencies are kept minimal to ensure the 90-minute workshop stability requirement.

**Initialization Command:**

```bash
# 1. Initialize Next.js 14+ (App Router)
npx create-next-app@latest mindmypain --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Initialize Shadcn UI (for Design System)
npx shadcn-ui@latest init

# 3. Install Core Dependencies
npm install @supabase/supabase-js @supabase/ssr framer-motion lucide-react clsx tailwind-merge
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**

- **TypeScript Strict Mode**: Mandatory for clinical data safety and defining the "Glass Box" interface.
- **Node.js**: LTS (v20+) for development stability.

**Styling Solution:**

- **Tailwind CSS**: Utility-first for rapid construction of both the immersive Patient PWA and the complex Researcher Dashboard.
- **Radix UI (via Shadcn)**: Accessible primitives for the complex "Glass Box" interactions (Dialogs, Sheets, Tabs).

**State Management:**

- **Server State**: `@supabase/ssr` + standardized data fetching hooks.
- **Client State**: Minimal client state (React `useState`/`Context`) for managing transient "Audio Recording" and "Pending Draft" UI states.

**Development Experience:**

- **Supabase CLI**: Local development capabilities with `supabase start` to simulate the backend.
- **Type Generation**: `supabase gen types typescript` loop for keeping frontend/backend types in sync.

**Note:** Project initialization using this command set should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

1.  **Audio Pipeline**: OpenAI Whisper API (Accurate, Slower) vs. Deepgram (Fast, Streaming). **Decision: OpenAI Whisper API**.
2.  **Data Strategy**: Single Table (`status` column) vs. Multi-Table. **Decision: Single Table**.
3.  **Auth Strategy**: Custom Profiles vs. Standard Auth. **Decision: Custom Profiles (No Auth Flow)**.

**Important Decisions (Shape Architecture):**

1.  **State Management**: React Context vs. Zustand. **Decision: Zustand**.
2.  **Hosting**: Vercel (Frontend) + Supabase (Backend).

### Data Architecture

**Decision 1: The "Glass Box" Data Model**

- **Decision:** **Single Table with Status Column & Separated Profile Table**
- **Rationale:**
  - **Core Stream Simplicity:** A single `journal_entries` table with a `status` Enum (`draft`, `pending_review`, `approved`) handles the chronological data flow. The `entry_type` Enum explicitly handles types like `MEDICATION`, `APPOINTMENT`, `SCRIPT`, and `IMMUNISATION` alongside general `JOURNAL` entries.
  - **Profile Data Table:** A dedicated `profiles` table will manage static demographics. Required Columns: `id` (references simulated user), `full_name`, `dob`, `address_line_1`, `address_line_2`, `email`, `mobile_phone`, `home_phone`, `medicare_irn`, `medicare_valid_to`, `phi_name`, `phi_number`, `is_organ_donor`, `emergency_contact_name`, `emergency_contact_relationship`, `emergency_contact_mobile`, `languages_spoken`, `is_aboriginal`, `is_torres_strait_islander`, `allergies`.
  - **Global Date Formatting:** All parsed relative time phrases (e.g., "Next Tuesday") must be computationally resolved by the AI or backend to a strict `dd-mm-yyyy` format relative to the current timestamp of the session before writing to the database.
  - **RLS:** Policies will handle visibility (e.g., `policy "Patient sees own approved"`).

### Authentication & Security

**Decision 2: Workshop Authentication (Persona-Based)**

- **Decision:** **No Auth Flow (Simulated Profiles)**
- **Implementation:**
  - **Hardcoded Profiles:** The app will have a `UserContext` provider initialized with one of three static profiles: `Sarah` (Seed Data), `Michael` (Seed Data), or `Guest` (Empty).
  - **Security Trade-off:** RLS policies will need to use a simulated `user_id` passed in queries rather than `auth.uid()`. This is acceptable **strictly** for the prototype/workshop environment but must be refactored for production.
    > [!WARNING]
    > **CRITICAL IMPLEMENTATION DETAIL:** The app uses string-based Persona IDs (e.g., 'sarah', 'michael') for `user_id`. Do NOT enforce `supabase.auth.getUser()` checks in Server Actions that expect UUIDs. This will break the application. Use the Persona ID passed from the client instead.

### API & Communication Patterns

**Decision 3: Voice-to-Text Strategy**

- **Decision:** **OpenAI Whisper API**
- **Version:** `openai-node` v4.28+ (latest stable)
- **Rationale:**
  - **Accuracy:** Highest accuracy for medical terminology (e.g., "fibromyalgia", "neuropathy") which is critical for user trust.
  - **UX:** The ~2s latency will be handled by a "Processing/Listening" animation state (UX Requirement).

### Frontend Architecture

**Decision 4: State Management**

- **Decision:** **Zustand**
- **Version:** `v5.0.0+`
- **Rationale:**
  - **Audio State:** perfect for managing the global `AudioRecorder` singleton state (isRecording, volume, duration) without causing re-renders in the main UI tree.
  - **Draft State:** Efficiently handles the "Transient" draft text as it streams back from the AI before being committed to the database.

### Infrastructure & Deployment

**Decision 5: Hosting Strategy**

- **Decision:** **Vercel + Supabase Cloud**
- **Rationale:**
  - **Vercel:** Zero-config deployment for Next.js App Router.
  - **Supabase:** Managed PostgreSQL database with instant API generation.

### Decision Impact Analysis

**Implementation Sequence:**

1.  **Project Init**: Next.js + Shadcn + Supabase Client.
2.  **Data Layer**: Define `journal_entries` table with Enums and RLS (adapted for simulated users).
3.  **State Layer**: Implement `useUserStore` (Personas) and `useAudioStore` (Zustand).
4.  **Core Feature**: Implement "Scribe" flow (Record -> Upload -> Whisper -> Database).
5.  **Wizard Dashboard**: Implement the "Review Interface" for researchers.

**Cross-Component Dependencies:**

- **Auth <-> RLS**: The decision to skip real Auth means we must be very careful with RLS policies. We will likely use a `function` in Postgres to simulate `auth.uid()` based on a header or context for the workshop.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 areas where AI agents could make different choices (Supabase Client, Store Structure, Type Safety, Shadcn Usage, File Naming).

### Naming Patterns

**Database Naming Conventions (Supabase/Postgres):**

- **Tables:** `snake_case`, plural (e.g., `journal_entries`, `users`).
- **Columns:** `snake_case` (e.g., `created_at`, `user_id`, `is_active`).
- **Enums:** `SCREAMING_SNAKE_CASE` values (e.g., `status: 'PENDING_REVIEW'`, `role: 'WIZARD'`).

**Code Naming Conventions:**

- **Components:** `PascalCase` (e.g., `AudioRecorder.tsx`, `MeetingNotes.tsx`).
- **Hooks:** `camelCase` starting with `use` (e.g., `useAudioStore.ts`, `useUserSession.ts`).
- **Stores:** `use<Domain>Store` (e.g., `useWizardStore`, `useJournalStore`).
- **Server Actions:** `camelCase` with logical verb (e.g., `submitJournalEntry`, `fetchDrafts`).

### Structure Patterns

**Project Organization:**

- **App Router:** Use Route Groups to separate layouts: `app/(patient)` for the mobile app, `app/(wizard)` for the researcher dashboard.
- **Shared Components:**
  - `components/ui`: Shadcn primitives (do not modify unless necessary).
  - `components/shared`: Custom reusable components (e.g., `GlassBoxCard`).
  - `components/patient` & `components/wizard`: Domain-specific feature components.
- **Lib/Utils:**
  - `lib/supabase`: Client constructors.
  - `lib/utils.ts`: Shadcn helper (cn).
  - `lib/types`: TypeScript extensions.

**State Management (Zustand):**

- **Location:** `stores/<domain>-store.ts`.
- **Pattern:** Export raw store creator for testing + default hook for usage.
- **Selectors:** ALWAYS use atomic selectors to prevent re-renders: `const { isRecording } = useAudioStore(s => s.isRecording)`.

### Process Patterns

**Supabase Access:**

- **Client Components:** Import `createClient` from `@/lib/supabase/client`.
- **Server Components:** Import `createClient` from `@/lib/supabase/server` (handles cookies).
- **Middleware:** Use `createClient` from `@/lib/supabase/middleware`.

**Glass Box Form Pattern:**

- **Drafting:** Input maps to `Zustand` store (transient).
- **Committing:** User click -> Server Action -> Supabase Insert -> Revalidate Path -> Clear Store.

### Enforcement Guidelines

**All AI Agents MUST:**

- **Strictly use generated Types:** Never manually type a DB row. Use `Database['public']['Tables'][...]`.
- **Use Atomic Selectors:** Never `const store = useStore()` in a component that renders frequently (like Audio Visualizers).
- **Separate Client/Server Logic:** Clearly distinguish between `use client` components (interactivity) and Server Actions (data mutation).

**Pattern Examples:**

**Good Example (Atomic Selector):**

```tsx
// Correct
const isRecording = useAudioStore((state) => state.isRecording);
```

**Anti-Pattern (Full Store):**

```tsx
// Incorrect - causes re-renders on every volume change
const { isRecording } = useAudioStore();
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
mindmypain/
├── src/
│   ├── app/
│   │   ├── (patient)/              # Mobile-first Patient View
│   │   │   ├── journal/            # Journal History List
│   │   │   ├── scribe/             # Active Recording Interface
│   │   │   ├── layout.tsx          # Mobile Container & Nav
│   │   │   └── page.tsx            # Patient Home
│   │   ├── (wizard)/               # Desktop-first Researcher View
│   │   │   ├── dashboard/          # Active Sessions List
│   │   │   ├── live-session/[id]/  # Wizard Intervention Console
│   │   │   └── layout.tsx          # Dashboard Shell
│   │   ├── api/
│   │   │   └── scribe/process/     # Audio Upload & Processing Pipeline
│   │   ├── globals.css             # Tailwind Directives & Variables
│   │   └── layout.tsx              # Root Providers (QueryClient, Toaster)
│   ├── components/
│   │   ├── ui/                     # Shadcn Primitives (Do not modify)
│   │   ├── shared/                 # Reusable Business Components
│   │   │   ├── glass-box/          # "Draft vs Committed" UI Logic
│   │   │   └── audio-visualizer/   # Shared Waveform Components
│   │   ├── patient/                # Patient-Specific UI
│   │   │   ├── persona-selector.tsx
│   │   │   └── scribe-controls.tsx
│   │   └── wizard/                 # Researcher-Specific UI
│   │       ├── intervention-card.tsx
│   │       └── live-feed.tsx
│   ├── lib/
│   │   ├── supabase/               # Database Clients
│   │   ├── openai/                 # AI Service Wrappers
│   │   └── stores/                 # Zustand State Stores
│   ├── types/                      # TypeScript Definitions
│   └── middleware.ts               # Route Protection
```

### Architectural Boundaries

**API Boundaries:**

- **Route Groups:** Strict separation between `(patient)` and `(wizard)` layouts ensures CSS/State isolation.
- **Server Actions:** All data mutations (creates/updates) MUST happen via Server Actions in `src/app/actions` (to be created) or co-located in feature folders.
- **API Routes:** Only used for Streaming Audio uploads (`api/scribe/process`) where raw body handling is required.

**Component Boundaries:**

- **Shadcn vs Custom:** `components/ui` is "Vendor Code" (owned by library). `components/shared` is "Project Code" (owned by us).
- **Client vs Server:**
  - `page.tsx` is ALWAYS a Server Component (fetches data).
  - `*-client.tsx` or components in `components/` handle interactivity.

**Data Boundaries:**

- **Supabase Generated Types:** The canonical source of truth for all Data Models.
- **Zustand Types:** Transient UI state (e.g. `isRecording`) is defined in `lib/stores`.
