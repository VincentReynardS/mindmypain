# Story 1.1: Project Initialization & Infrastructure

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to initialize the Next.js project with Supabase, Shadcn, and OpenAI,
so that the team has a standard foundation for building features.

## Acceptance Criteria

1.  **Given** a clean development environment
    **When** the `npx create-next-app` command is run with TypeScript, Tailwind, and App Router
    **Then** the project structure should match the "Architecture Decision Document"
    **And** Shadcn UI should be initialized
    **And** `@supabase/ssr` and `openai` packages should be installed
    **And** `README.md` should be updated with setup instructions

## Tasks / Subtasks

- [x] Task 1: Initialize Project Foundation (AC: 1)
  - [x] Run `npx create-next-app@latest` with TypeScript, Tailwind, ESLint, App Router, src-dir
  - [x] Initialize Shadcn UI: `npx shadcn@latest init --defaults`
  - [x] Install Core Dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`, `zustand`, `openai`
  - [x] Configure `globals.css` with "Calm" aesthetic tokens (soft blues/greens, glass box, wizard, slow-tech transitions)
  - [x] Shadcn `components.json` configured automatically via init
- [x] Task 2: Implement Project Structure (AC: 1)
  - [x] Create directory structure: `src/app/(patient)`, `src/app/(wizard)`, `src/app/api/scribe/process`
  - [x] Create shared components directories: `src/components/ui`, `src/components/shared`, `src/components/patient`, `src/components/wizard`
  - [x] Create lib directories: `src/lib/supabase`, `src/lib/openai`, `src/lib/stores`
  - [x] Create type definitions: `src/types/database.ts`
  - [x] Create middleware file: `src/middleware.ts`
- [x] Task 3: Documentation (AC: 1)
  - [x] Update `README.md` with setup instructions, project structure, key commands
  - [x] Create `.env.local.example` with environment variables template

## Dev Notes

- **Architecture Compliance**: Strictly follow the folder structure defined in `architecture.md`.
- **Tech Stack**:
  - **Next.js**: 16.1.6 (App Router, Turbopack)
  - **TypeScript**: Strict Mode
  - **Tailwind CSS**: v4 (CSS-based config)
  - **Shadcn UI**: new-york style, Radix unified package
  - **Supabase**: `@supabase/ssr` for SSR-compatible auth
  - **OpenAI**: `openai` package for Whisper API
  - **Zustand**: v5 for global state management
- **Testing Standards**: Build and lint verified passing.

### References

- **Architecture Decision Document**: `_bmad-output/planning-artifacts/architecture.md`
- **PRD**: `_bmad-output/planning-artifacts/prd.md`
- **UX Design Specification**: `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

Gemini (Antigravity agent)

### Completion Notes List

- Scaffolded via `create-next-app` in temp dir then merged (existing dirs blocked in-place scaffold)
- Tailwind v4 uses CSS-based config (`@theme inline` in globals.css) instead of tailwind.config.js
- Added full "Calm" design tokens with light/dark mode support
- Created placeholder pages with minimal UI for all route groups
- Supabase clients follow official `@supabase/ssr` patterns (browser/server/middleware)
- Zustand stores created for user (persona) and audio state
- Database types manually defined matching architecture's single-table model
- Build: 0 errors, Lint: 0 errors (2 expected warnings from placeholder params)

### File List

- `src/app/globals.css` - Tailwind + Calm design tokens
- `src/app/(patient)/layout.tsx` - Mobile-first patient layout
- `src/app/(patient)/page.tsx` - Patient home (redirect to journal)
- `src/app/(patient)/journal/page.tsx` - Journal page placeholder
- `src/app/(patient)/scribe/page.tsx` - Scribe page placeholder
- `src/app/(wizard)/layout.tsx` - Desktop wizard layout
- `src/app/(wizard)/dashboard/page.tsx` - Dashboard placeholder
- `src/app/(wizard)/live-session/[id]/page.tsx` - Live session placeholder
- `src/app/api/scribe/process/route.ts` - Audio API placeholder
- `src/lib/supabase/client.ts` - Browser Supabase client (typed with Database generic)
- `src/lib/supabase/server.ts` - Server Supabase client (typed with Database generic)
- `src/lib/supabase/middleware.ts` - Middleware Supabase client
- `src/lib/openai/index.ts` - OpenAI client (lazy-init, server-only guard)
- `src/lib/stores/user-store.ts` - Zustand persona store
- `src/lib/stores/audio-store.ts` - Zustand audio state store
- `src/lib/utils.ts` - Shadcn cn() utility
- `src/types/database.ts` - Database type definitions
- `src/middleware.ts` - Next.js route middleware
- `src/app/layout.tsx` - Root layout (branded metadata)
- `src/app/page.tsx` - Root home (redirect to /journal)
- `README.md` - Project documentation
- `.env.local.example` - Environment variables template
- `.gitignore` - Git ignore rules
- `components.json` - Shadcn UI configuration
- `package.json` - Project dependencies
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `eslint.config.mjs` - ESLint configuration

## Senior Developer Review (AI)

**Review Date:** 2026-02-18
**Reviewer:** Antigravity (adversarial code review)
**Issues Found:** 3 HIGH, 4 MEDIUM, 3 LOW
**Issues Fixed:** 7 (all HIGH + all MEDIUM)

### Fixes Applied

| ID  | Severity | Issue                                               | Fix                                   |
| --- | -------- | --------------------------------------------------- | ------------------------------------- |
| H1  | HIGH     | Root layout had default "Create Next App" metadata  | Branded as MINDmyPAIN                 |
| H2  | HIGH     | Root page.tsx was untouched boilerplate             | Replaced with redirect to /journal    |
| H3  | HIGH     | package.json name was "mindmypain-scaffold"         | Renamed to "mindmypain"               |
| M1  | MEDIUM   | Supabase clients missing Database type generic      | Added `<Database>` to both clients    |
| M2  | MEDIUM   | OpenAI client has no server guard or error handling | Added server-only + lazy-init + error |
| M3  | MEDIUM   | 6 files not in story File List                      | Expanded File List above              |
| M4  | MEDIUM   | .gitignore blocks .env.local.example                | Added !.env.local.example exception   |

### Remaining (LOW - deferred)

- L1: User store personaName derivation could use lookup map
- L2: No .gitkeep in components/ui (Shadcn-managed)
- L3: next-env.d.ts in .gitignore (correct Next.js behavior)
