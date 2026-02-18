# MINDmyPAIN

**Smart Health Journal** - A thesis prototype that empowers chronic pain patients to reclaim control over their narrative by transforming unstructured voice/text logs into structured clinical evidence.

## Overview

MINDmyPAIN is a Wizard-of-Oz prototype built for user research workshops. It simulates an "Active AI Partner" that listens, summarizes, and identifies patterns - mediated by a researcher behind the scenes.

**Key Features:**

- **Smart Journaling** - Voice/text capture with AI-inferred categorization
- **Glass Box Pattern** - AI drafts are transparent and user-editable
- **Wizard Dashboard** - Researcher can monitor and intervene in real-time

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Backend:** Supabase (Postgres + Realtime)
- **AI:** OpenAI Whisper API (voice-to-text)
- **State:** Zustand v5
- **Hosting:** Vercel + Supabase Cloud

## Getting Started

### Prerequisites

- Node.js v20+ (LTS recommended)
- npm v10+
- Supabase account & project
- OpenAI API key

### Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd mindmypain
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and fill in your credentials.

4. **Database Setup (Schema & Seed Data):**

   This project requires a specific database schema and seed data to function.

   **a. Login & Link:**

   ```bash
   npx supabase login
   npx supabase link --project-ref awjkvzvpifiqbcfkzwjl
   ```

   **b. Apply Schema:**

   ```bash
   npx supabase db push
   ```

   **c. Populate Data (Seed):**
   - **Option 1 (Dashboard):** Copy `supabase/seed.sql` content -> Paste in [Supabase SQL Editor](https://supabase.com/dashboard/project/awjkvzvpifiqbcfkzwjl/sql) -> Run.
   - **Option 2 (CLI):** Run `npx supabase db reset --linked` (WARNING: Wipes remote DB and re-seeds).

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. **Open the app:**
   - Patient view: [http://localhost:3000](http://localhost:3000)
   - Researcher dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Project Structure

```
src/
├── app/
│   ├── (patient)/              # Mobile-first Patient View
│   │   ├── journal/            # Journal History List
│   │   ├── scribe/             # Voice Recording Interface
│   │   ├── layout.tsx          # Mobile Container & Nav
│   │   └── page.tsx            # Patient Home (redirects to /journal)
│   ├── (wizard)/               # Desktop-first Researcher View
│   │   ├── dashboard/          # Active Sessions List
│   │   ├── live-session/[id]/  # Wizard Intervention Console
│   │   └── layout.tsx          # Dashboard Shell
│   ├── api/
│   │   └── scribe/process/     # Audio Upload & Processing
│   ├── globals.css             # Tailwind + Design Tokens
│   └── layout.tsx              # Root Layout & Providers
├── components/
│   ├── ui/                     # Shadcn Primitives
│   ├── shared/                 # Reusable Components
│   │   ├── glass-box/          # Draft vs Committed UI
│   │   └── audio-visualizer/   # Waveform Components
│   ├── patient/                # Patient-Specific UI
│   └── wizard/                 # Researcher-Specific UI
├── lib/
│   ├── supabase/               # Supabase Clients (browser/server/middleware)
│   ├── openai/                 # OpenAI Whisper Wrapper
│   ├── stores/                 # Zustand State Stores
│   └── utils.ts                # Shadcn Utility (cn)
├── types/                      # TypeScript Definitions
└── middleware.ts               # Route Protection
```

## Key Commands

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start development server (Turbopack) |
| `npm run build` | Build for production                 |
| `npm run start` | Start production server              |
| `npm run lint`  | Run ESLint                           |

## Design System

The app uses a custom "Calm" aesthetic with:

- **Soft blues/greens** for surfaces and accents
- **Warm grays** for text hierarchy
- **"Slow tech" transitions** (300ms-2000ms) for a meditative feel
- **Touch targets >= 44px** for accessibility (WCAG 2.1 AA)
- **Glass Box pattern** with distinct draft/approved visual states

## Architecture Notes

- **Route Groups:** `(patient)` and `(wizard)` ensure CSS/state isolation
- **Zustand Stores:** Always use atomic selectors (`useStore(s => s.field)`)
- **Supabase Types:** Generated from schema - never manually type DB rows
- **Server Actions:** All data mutations via Server Actions or API Routes

---

_Built for Vincent's thesis research on AI-mediated patient empowerment._
