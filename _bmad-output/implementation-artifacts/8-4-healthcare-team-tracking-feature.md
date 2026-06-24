# Story 8.4: healthcare-team-tracking-feature

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want a dedicated "Team" tab to see my healthcare providers,
so that I can track their profession, name, address, email, and phone number.

## Acceptance Criteria

1. **Given** the bottom navigation
   **When** I tap the "Team" button
   **Then** I am taken to a list of my care team displayed as cards
   **And** I can add new team members via the voice/text input box on the home page

## Tasks / Subtasks

- [x] Add "Team" Tab to Bottom Navigation
  - [x] Update the bottom navigation component to include a "Team" tab routing to `/team` (or `/app/team`).
- [x] Create Team Member List View
  - [x] Implement `src/app/(patient)/team/page.tsx` displaying a list of healthcare providers with the header "Team" and subheader "Your active teams."
  - [x] Create a `TeamMemberCard` (or `TeamMemberGlassBox`) component.
  - [x] **UI Details for Card**:
    - Left-hand colored border (e.g., green for active).
    - Top row actions: Yellow pill buttons for "Book online", "Call", "Message", and a standard "Edit" button with an icon.
    - Fields to display (uppercase labels): PROFESSION, NAME, ADDRESS, EMAIL, PHONE.
- [x] Smart Parser Integration
  - [x] Update `smart-parser.ts` to recognize when a user adds a healthcare provider via voice/text input on the home page.
  - [x] Map parsed fields (profession, name, address, email, phone) to the expected JSON schema.
- [x] Data Model Updates
  - [x] Ensure the new entry type is supported in the `journal_entries` table (see Completion Notes - implemented via the established `entry_type='journal'` + `_intent='team'` discriminator pattern, not a new enum value).

## Dev Notes

- **Data Model:** Team members should follow the established pattern for structured data (like Medications or Appointments) using the `journal_entries` table with a specific `entry_type` (e.g., `TEAM_MEMBER`), and a JSON payload for the specific fields (Profession, Name, Address, Email, Phone).
- **Architecture Compliance:** 
  - Ensure the new `/team` route is inside the `(patient)` layout.
  - Use Shadcn UI components for cards and layout to maintain the "Calm" design system tokens.
  - All data mutations must happen via Server Actions.
- **Previous Story Intelligence:** 
  - In Epic 8.3, we learned to be strict with data payloads and not add unrequested default behaviors (like defaulting DOB to today). Ensure the Smart Parser handles missing contact information gracefully (leave as null/empty string) rather than hallucinating details.
  - From Epic 7.1/8.3, ensure any dates (if added) use `dd-mm-yyyy`.

### Project Structure Notes

- **Route:** `src/app/(patient)/team/page.tsx`
- **Components:** `src/components/patient/team-member-glass-box.tsx` or similar.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.4: Healthcare Team Tracking Feature]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (Low)

### Debug Log References
- Ultimate context engine analysis completed - comprehensive developer guide created

### Completion Notes List

- **Data model decision (important):** The story's Dev Notes suggested a new `entry_type` such as `TEAM_MEMBER`. However, the *actual* established Glass Box pattern in this codebase (verified across appointments, medications, scripts, and immunisations) stores all structured records as `entry_type='journal'` with a discriminator key `_intent` inside `ai_response`. `processJournalEntry` always forces `entry_type='journal'`, and every listing page + `GlassBoxCard` depends on that. Introducing a distinct enum value would break those flows and the merge/dedup logic. To genuinely "follow the established pattern" (as the Dev Notes also instruct), team members are persisted as `entry_type='journal'` + `_intent='team'`. No DB migration or enum change was required.
- **Smart Parser:** Added a `team` intent to `classifyIntent` (with a category that distinguishes "save a provider's contact details" from "appointment"), plus `parseTeamMember` + `TeamMemberResponseSchema` (Profession, Name, Address, Email, Phone). The prompt explicitly forbids hallucinating missing contact info (Epic 8.3 learning) - absent fields are omitted.
- **Routing/processing:** `processJournalEntry` now handles the `team` case; `_intent='team'` is persisted via `withPersistedIntent`. `selectTeamMemberEntries` filters entries for the `/team` page.
- **Server Actions:** Added `updateTeamMemberEntry` / `approveTeamMemberEntry`; `/team` added to all relevant `revalidatePath` lists. All mutations go through Server Actions (architecture compliance).
- **UI:** New `/team` route inside the `(patient)` layout with header "Team" / subheader "Your active teams." Rich `TeamMemberGlassBox` card: colored left border (blue Draft -> green Added), yellow/amber pill actions (Book online, Call->`tel:`, Message->`mailto:`, disabled when no contact data), Edit (pencil icon), uppercase field labels. Team entries surfaced in the Home/Journal feed render through `GlassBoxCard` (new "Care Team" badge, `SafeTeamMemberRender`, and `TeamMemberEditForm` edit dispatch).
- **Token compliance (project-context rule #2):** The standalone `TeamMemberGlassBox` avoids the undefined `calm-primary` token (confirmed absent from `globals.css`); uses `calm-blue`/`calm-green`/`calm-text-muted`.
- **Validation:** `npm run test` = all 21 new tests pass (644 total, the 2 remaining failures are pre-existing/flaky on a clean tree and unrelated to this story). `tsc --noEmit` clean. ESLint clean on all changed/added files (the one repo lint error is in untouched `persona-guard.tsx`). The bottom-nav count assertion in `story-7-5` was updated 7->8 to reflect the new Team tab. Manual browser verification delegated to the user (test plan provided).
- **Follow-up (post-implementation, per user request):** The "Book online", "Call", and "Message" pill actions were disabled/removed from `TeamMemberGlassBox`; only the "Edit" control (moved into the header row) and "Add" remain. The card structure is otherwise unchanged, so these actions can be re-enabled later.
- **Tech debt note (project-context rule #8):** Forms use the existing local-state + Shadcn `Input`/`Button` approach, not React Hook Form + Zod (consistent with current repo; RHF stack not installed).

### File List

- `src/lib/openai/smart-parser.ts` (modified) - `team` intent + `parseTeamMember`/`TeamMemberResponseSchema`
- `src/lib/openai/smart-parser.test.ts` (modified) - team classify + parseTeamMember tests
- `src/lib/journal-entry-ai.ts` (modified) - `team` in `EntryIntent`/sets, `selectTeamMemberEntries`, raw-text pattern
- `src/app/actions/journal-actions.ts` (modified) - `team` process case, update/approve actions, `/team` revalidation
- `src/components/shared/glass-box/glass-box-card.tsx` (modified) - team badge/shape/render/edit dispatch
- `src/components/shared/glass-box/editors/team-member-edit-form.tsx` (new) - team edit form for GlassBoxCard
- `src/components/patient/team-member-glass-box.tsx` (new) - rich standalone team card
- `src/app/(patient)/team/page.tsx` (new) - `/team` list page
- `src/components/patient/bottom-nav.tsx` (modified) - Team tab
- `src/__tests__/patient-bottom-nav.test.tsx` (modified) - Team tab assertions
- `src/__tests__/story-7-5-journal-page-clear-input.test.ts` (modified) - nav count 7->8
- `src/__tests__/team-page.test.tsx` (new) - selection + page tests
- `src/__tests__/team-member-glass-box.test.tsx` (new) - card + GlassBoxCard wiring tests; behavioral RTL edit-persistence tests added in review

## Senior Developer Review (AI)

**Reviewer:** Vincent | **Date:** 2026-06-24 | **Outcome:** Approved (all High/Medium issues fixed)

### Findings & Resolutions

- **[HIGH][FIXED] Edits on `/team` were silently lost on reload.** The standalone `TeamMemberGlassBox` saved through `updateTeamMemberEntry`, which wrote only the `content` column, while the renderer (`resolveTeamMemberData`) prefers `ai_response`, which was never updated. The optimistic local merge masked the bug until refresh. Fix: the card now serializes a structured payload and `/team` persists via `updateJournalAiResponse` (writes both `ai_response` and `content`, preserving `_intent`), matching the Home-feed `GlassBoxCard` path. The orphaned `updateTeamMemberEntry` action was removed.
- **[MEDIUM][FIXED] `SafeTeamMemberRender` used the undefined `text-calm-primary` token** (`glass-box-card.tsx`). Replaced with `text-calm-text-muted` (defined in `globals.css`), consistent with the standalone card.
- **[MEDIUM][FIXED] Weak test coverage.** The new UI tests were source-string assertions that could not catch the High bug. Added jsdom/RTL behavioral tests covering the edit/save/persist path, the `_intent` non-leak, and field-clearing-to-null.
- **[MEDIUM][FIXED] `_intent` leaked into the `content` column.** `resolveTeamMemberData` and serialization now extract only the five known team fields, dropping discriminators like `_intent`.
- **[LOW][NOTED] `/team` over-fetches** all non-archived journal entries then filters client-side; acceptable at prototype scale.
- **[LOW][NOTED] `selectTeamMemberEntries` has no legacy/backfill fallback** (relies solely on `_intent === 'team'`); acceptable as the feature is new (no legacy rows).

### Validation

- `npx tsc --noEmit` clean; ESLint clean on all changed files.
- Targeted suites pass (team page + card: 16 tests). Full suite: 644 passed, 1 pre-existing/unrelated failure (`story-7-1` seed-SQL date assertion, untouched by this story).
- Git File List verified against the commit: no discrepancies.

### Change Log

- 2026-06-24: Senior Developer Review (AI) fixed 1 High + 3 Medium findings; status review to done.
