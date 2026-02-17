# Story 1.1: Project Initialization & Infrastructure

Status: ready-for-dev

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

- [ ] Task 1: Initialize Project Foundation (AC: 1)
  - [ ] Run `npx create-next-app@latest mindmypain --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [ ] Initialize Shadcn UI: `npx shadcn-ui@latest init`
  - [ ] Install Core Dependencies: `npm install @supabase/supabase-js @supabase/ssr framer-motion lucide-react clsx tailwind-merge zustand openai`
  - [ ] Configure `tailwind.config.js` with "Calm" aesthetic tokens (soft blues/greens)
  - [ ] Update `components.json` for Shadcn configuration
- [ ] Task 2: Implement Project Structure (AC: 1)
  - [ ] Create directory structure: `src/app/(patient)`, `src/app/(wizard)`, `src/app/api/scribe/process`
  - [ ] Create shared components directories: `src/components/ui`, `src/components/shared`, `src/components/patient`, `src/components/wizard`
  - [ ] Create lib directories: `src/lib/supabase`, `src/lib/openai`, `src/lib/stores`
  - [ ] Create type definitions directory: `src/types`
  - [ ] Create middleware file: `src/middleware.ts`
- [ ] Task 3: Documentation (AC: 1)
  - [ ] Update `README.md` with:
    - Setup instructions
    - Environment variables template (`.env.local.example`)
    - Project structure overview
    - Key commands (dev, build, lint)

## Dev Notes

- **Architecture Compliance**: Strictly follow the folder structure defined in `architecture.md`.
- **Tech Stack**:
  - **Next.js**: 14+ (App Router)
  - **TypeScript**: Strict Mode
  - **Tailwind CSS**: Utility-first
  - **Shadcn UI**: For component primitives
  - **Supabase**: For backend/database interaction (`@supabase/ssr`)
  - **OpenAI**: For Whisper API (`openai` v4.28+)
  - **Zustand**: For global state management (`v5.0.0+`)
- **Dependencies**:
  - `openai` (latest stable v6.22.0)
  - `zustand` (latest stable v5.0.11)
  - `@supabase/ssr` (latest stable v0.8.0)
  - `shadcn-ui` (latest)
- **Testing Standards**: Verify project build and lint passing after initialization.

### Project Structure Notes

- **Alignment**: Ensure `src/app/(patient)` and `src/app/(wizard)` route groups are created to separate mobile and desktop views.
- **Naming**: Follow `kebab-case` for files and directories, `PascalCase` for components.

### References

- **Architecture Decision Document**: `_bmad-output/planning-artifacts/architecture.md` (Section: Project Structure & Boundaries)
- **PRD**: `_bmad-output/planning-artifacts/prd.md` (Section: Technical Requirements)
- **UX Design Specification**: `_bmad-output/planning-artifacts/ux-design-specification.md` (Section: Design System Foundation)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
