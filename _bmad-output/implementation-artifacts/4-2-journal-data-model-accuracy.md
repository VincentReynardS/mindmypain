# Story 4.2: Journal Data Model Accuracy

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want the app to use the exact structure of my physical MINDmyPAIN journal,
So that I am familiar with the required fields (Day, Sleep, Pain, Feeling, Action, Gratitude, Meds, Mood).

## Acceptance Criteria

1. **Given** the application's data models
2. **When** the user interfaces with the Journal entries
3. **Then** the parsing and structure should strictly support:
   - Day / Date
   - Hours of restful sleep / How did you sleep?
   - Pain out of 10
   - Right now I am feeling (Free text)
   - What can I do to feel better today?
   - I am grateful for...
   - Medication (Morning, Midday, Evening)
   - Mood (Scale of 22 specific moods)

## Tasks / Subtasks

- [x] Task 1: Update Application Data Models (AC: 1, 3)
  - [x] Update Zod schemas/TypeScript types to support the new physical journal fields under the `JOURNAL_ENTRY` type or a new `PHYSICAL_JOURNAL` subtype.
  - [x] Ensure `status` enum maps properly (`draft`, `pending_review`, `approved`).
- [x] Task 2: Update Smart Parsing Logic (AC: 3)
  - [x] Enhance `smart-parser.ts` to map LLM transcriptions into this precise structure when categorizing an input as a Journal logging event.
  - [x] Define exactly the new JSON structure required from the AI model in connection to this accurate data schema.
- [x] Task 3: Update `GlassBoxCard` Rendering
  - [x] Modify the relevant Glass Box (or Journal Card) component to conditionally render these new specific fields when displaying an entry of this type.
- [x] Task 4: Verify Database Compatibility
  - [x] Confirm the new JSON structure can be stored correctly in `journal_entries.content` or update the supabase schema/seed if structural changes inside the json column require seed data updates.

## Dev Notes

- **Data Structure Constraints:** The primary structure must be flexible since Supabase relies on a `content` JSONB column. Updating Zod validation and TypeScript interfaces is paramount for preserving type safety.
- **Real Auth Avoidance:** Ensure this feature relies completely on the simulated "Persona Guard" system and Zustand state without checking `supabase.auth.getUser()`.
- **UI Guidelines:** Ensure any new UI fields added to `GlassBoxCard` or forms respect the `calm` text and background tokens and maintain WCAG 2.1 AA accessibility (touch targets > 44px).

### Project Structure Notes

- Types should be updated within `src/types/` or co-located with the Zod schema validations for the LLM output (e.g. `src/lib/openai/schema`).
- Changes strictly reside in patient-facing UI elements (`src/components/patient` or `src/components/shared/glass-box`), avoiding `(wizard)` routes.
- Component state updates should continue using Zustand (`src/lib/stores/`) and maintain atomic selectors to prevent render loops.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 4: AI Retrieval & Chat & Journal Accuracy]
- [Source: _bmad-output/project-context.md#Critical Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]

## Dev Agent Record

### Agent Model Used

Antigravity (Gemini)

### Debug Log References

- Previous work extended `useUserStore` state for personas. This story will mainly impact the data transformation and parsing logic, and the display logic of standard journal cards.

### Completion Notes List

- Added database migration to include `daily_journal` in the `journal_entry_type` enum and pushed to the remote testing db.
- Updated the TypeScript definition in `database.ts` to include `daily_journal`.
- Implemented `parseDailyJournal` and `DailyJournalResponseSchema` inside the OpenAI `smart-parser.ts`.
- Tuned the `INTENT_CLASSIFICATION_PROMPT` to prioritize mapping general daily logs to `journal` over other types (like `medication`), ensuring everything aggregates under the Daily Journal format cleanly.
- Implemented `SafeDailyJournalRender` inside the `GlassBoxCard` component to elegantly list out the extracted fields.
- Automated API testing with Vitest confirmed 100% test coverage with Zod bounds on new code logic.
- A manual UI traversal proved the AI creates a Glass Box matching digital journal parameters including Day, Sleep, Pain, Feeling, Walk/Actions, Gratitude, Medication, and Mood (22-mood scale).

### File List

- `supabase/migrations/20260222000000_add_daily_journal_type.sql`
- `src/types/database.ts`
- `src/lib/openai/smart-parser.ts`
- `src/lib/openai/smart-parser.test.ts`
- `src/app/actions/journal-actions.ts`
- `src/components/shared/glass-box/glass-box-card.tsx`
