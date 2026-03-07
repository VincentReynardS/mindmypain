# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Next.js + Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode
npm run type-gen     # Regenerate src/types/database.ts from Supabase schema (run after migrations)
npm run db:reset     # Reset local DB and re-apply all migrations + seed
npm run db:migration:new  # Scaffold a new migration file
```

## Architecture

**MINDmyPAIN** is a research prototype for chronic pain journaling. It has two distinct user interfaces within a single Next.js app:
- **Patient view** (`src/app/(patient)/`) — Mobile-first, accessed via `/journal`, `/scribe`, `/medications`, `/appointments`, `/scripts`
- **Researcher/wizard view** (`src/app/(wizard)/`) — Desktop-first, accessed via `/dashboard`, `/live-session/[id]`

The app uses **simulated authentication** — there is no Supabase Auth. Personas (`sarah`, `michael`, `guest_<timestamp>`) are selected on the landing page and stored in `useUserStore` (Zustand, persisted to sessionStorage). These strings are used directly as `user_id` in all DB queries. RLS policies are permissive (`true`) for prototype purposes.

### The Glass Box Pattern

The core UI/data pattern throughout the app. Every journal entry moves through:
1. **`raw_text`** — unprocessed, shows as `JournalEntryCard` with an Organize button
2. **`journal`** — draft with or without AI-parsed `ai_response`; shows as `GlassBoxCard`
3. User reviews the AI-structured fields, edits raw content if needed, then **Approves** to lock the entry (`status = 'approved'`)

The `ai_response` JSONB column stores the structured output. The `content` column always stores the raw editable text.

### Entry Type → Renderer Mapping

| `entry_type` | Renderer | Notes |
|---|---|---|
| `raw_text` | `JournalEntryCard` | Unprocessed; shows Organize button if not yet approved |
| `journal` | `GlassBoxCard` → `SafeDailyJournalRender` | Structured daily health fields (Sleep, Pain, Mood, etc.) |
| `insight_card` | `GlassBoxCard` | Insight content |

### AI Parsing Layer (`src/lib/openai/smart-parser.ts`)

All calls use `gpt-4o` with `response_format: { type: 'json_object' }`. Responses are validated with Zod schemas. Key functions:

- `classifyIntent(text)` → `'journal' | 'medication' | 'appointment' | 'script' | 'agenda'`
- `parseJournal(text)` → Sleep, Pain, Mood, Feeling, Action, Grateful, Medication, Note, `Appointments[]`, `Scripts[]`
- `parseMedication / parseAppointment / parseScript` — specialized parsers

### Entry Creation Flow (`createJournalEntry`)

- All entries are created as `raw_text` with `status = 'draft'` — user must click Organize to classify and parse
- Intent `journal | agenda` → checks for an existing `raw_text` draft for today; if found, appends content; otherwise creates a new `raw_text` draft
- Intent `appointment | medication | script` → always creates a new `raw_text` draft

### Entry Processing Flow (`processJournalEntry`)

Re-classifies intent, calls the matching parser (`parseJournal`, `parseMedication`, `parseAppointment`, or `parseScript`), writes the result to `ai_response`, and always sets `entry_type = 'journal'`. The `GlassBoxCard` component sniffs the `ai_response` shape to determine the badge and renderer.

### State Management

Zustand stores live in `src/lib/stores/`. Always use atomic selectors:

```ts
// Correct
const isRecording = useAudioStore((s) => s.isRecording);

// Wrong — causes unnecessary re-renders
const { isRecording } = useAudioStore();
```

### Supabase Clients

```ts
// In Server Components / Server Actions / API routes
import { createClient } from '@/lib/supabase/server';

// In Client Components
import { createClient } from '@/lib/supabase/client';
```

Never import the server client inside a `'use client'` component. The OpenAI client (`src/lib/openai/`) uses `server-only` to prevent browser exposure — never import it in client components.

### Type Safety

`src/types/database.ts` is the source of truth for DB types. Use the convenience aliases:
- `JournalEntry`, `NewJournalEntry`, `UpdateJournalEntry`

Run `npm run type-gen` after any schema change to keep it in sync.

### Migrations

Migration files live in `supabase/migrations/` named `<timestamp>_<description>.sql`. Create with `npm run db:migration:new`. Apply locally with `npm run db:reset`. Note: PostgreSQL does not support removing enum values directly — recreate the type (see `20260223000000_rename_daily_journal_to_journal.sql` for the pattern).

### Audio

Voice recording uses the `useAudioRecorder` hook (`src/hooks/use-audio-recorder.ts`) which wraps `MediaRecorder` (webm/opus) and a Web Audio API `AnalyserNode` for real-time volume. The recorded blob is uploaded to `POST /api/scribe/process`, which calls Whisper (`whisper-1`) and returns a transcript.

### Design System

All custom colors use the `calm-*` prefix (e.g., `calm-primary`, `calm-surface`, `calm-teal`, `calm-blue`, `calm-green`, `calm-text-muted`). Defined in `src/app/globals.css`. Minimum touch target size is 44px. The design aesthetic is "calm confidence" — slow transitions (300ms–2s), soft backgrounds.
