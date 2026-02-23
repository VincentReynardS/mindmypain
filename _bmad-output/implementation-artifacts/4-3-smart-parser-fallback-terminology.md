# Story 4.3: Smart Parser Fallback & Terminology

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want the AI parser to never lose my data, and to use the term "Journal" instead of "Agenda",
so that unrecognized inputs are safely filed under general notes.

## Acceptance Criteria

1. **Given** the Smart Parser (`smart-parser.ts`) processes an unstructured input **When** the AI cannot determine a specific category **Then** it must explicitly map the raw text into a "Right now I am feeling" or a general "Notes" field — zero data loss guaranteed.

2. **Given** the `classifyIntent()` function encounters an error or returns an unrecognized intent **When** the fallback is triggered **Then** the entry must still be saved as `entry_type = 'journal'` with the raw content preserved in both `content` and `ai_response.Feeling` or `ai_response.Note`.

3. **Given** the `parseJournal()` function throws an error (OpenAI failure, Zod validation failure, network timeout) **When** the fallback is triggered **Then** a synthetic `ai_response` must be created mapping the raw text to the "Feeling" and "Note" fields, and the entry must NOT remain as `raw_text` — it must become `journal` with a reviewable Glass Box.

4. **Given** the entire application codebase **When** searching for the term "agenda" (case-insensitive) **Then** all user-facing references must be replaced with "Journal", and all code-level references must use "journal" — the `classifyIntent` return type must no longer include `'agenda'`.

5. **Given** a user submits any text input (including gibberish, greetings, or edge cases like "hi", "test", or empty-after-trim) **When** the entry is processed through `processJournalEntry` **Then** the entry must always result in a valid `journal` entry with a Glass Box card, never be left stranded as `raw_text` after processing.

6. **Given** an input containing multiple intents (e.g., "My back hurts and I need a Lyrica refill and I see Dr. Chen next week") **When** the parser extracts partial intents but fails on some **Then** the successfully parsed intents must be preserved, and any unmatched content must fall through to the "Note" field.

## Tasks / Subtasks

- [x] Task 1: Remove "agenda" from `classifyIntent` return type and prompt (AC: #4)
  - [x] 1.1: Update `INTENT_CLASSIFICATION_PROMPT` to remove "agenda" category entirely — only keep `journal | medication | appointment | script`
  - [x] 1.2: Update `classifyIntent()` return type to `Promise<'appointment' | 'medication' | 'script' | 'journal'>`
  - [x] 1.3: Remove `case 'agenda':` from `processJournalEntry` switch in `journal-actions.ts`
  - [x] 1.4: Remove `intent === 'agenda'` check from `createJournalEntry` in `journal-actions.ts` (just use `intent === 'journal'`)
  - [x] 1.5: Search and remove any remaining "agenda" references in `src/` (excluding test snapshots and migration SQL history)

- [x] Task 2: Implement parser-level fallback in `parseJournal` (AC: #2, #3)
  - [x] 2.1: Wrap the `parseJournal` function's OpenAI call + Zod parse in a try-catch that returns a **synthetic fallback response** instead of throwing
  - [x] 2.2: The synthetic fallback must create a `JournalResponse` object with `Feeling` set to the raw text (first 500 chars) and `Note` set to the full raw text
  - [x] 2.3: All other fields (`Sleep`, `Pain`, `Mood`, `Grateful`, `Action`, `Medication`, `Appointments`, `Scripts`) must be `null` in the fallback
  - [x] 2.4: Log the original error with `console.error` but do NOT re-throw — return the synthetic response

- [x] Task 3: Implement process-level fallback in `processJournalEntry` (AC: #1, #5)
  - [x] 3.1: If `classifyIntent` returns an unrecognized value (not in `journal | medication | appointment | script`), treat as `'journal'`
  - [x] 3.2: Wrap the entire switch/parse logic in `processJournalEntry` in a try-catch
  - [x] 3.3: On ANY parser failure, create a synthetic `ai_response` (same shape as Task 2.2) and still update the entry to `entry_type = 'journal'` with `status = 'draft'`
  - [x] 3.4: Ensure the entry is NEVER left as `raw_text` after `processJournalEntry` is called — it must always transition to `journal`

- [x] Task 4: Clean up seed data and migration comments (AC: #4)
  - [x] 4.1: Update `supabase/seed.sql` to replace "agenda" terminology in comments and JSON data (replace `"agenda_items"` key in seed JSON with appropriate alternative like `"preparation_items"`)
  - [x] 4.2: Leave migration SQL files untouched (they are historical records)

- [x] Task 5: Update tests (AC: all)
  - [x] 5.1: Update `src/lib/openai/smart-parser.test.ts` — remove 'agenda' intent tests, add fallback behavior tests
  - [x] 5.2: Update `src/__tests__/journal-actions.test.ts` — add tests for process-level fallback (parser failure still produces valid entry)
  - [x] 5.3: Add test: `classifyIntent` with gibberish returns 'journal'
  - [x] 5.4: Add test: `parseJournal` with API failure returns synthetic response (not throw)
  - [x] 5.5: Add test: `processJournalEntry` with full parser failure still produces `entry_type = 'journal'`
  - [x] 5.6: Update `src/__tests__/story-1-2-database-migration.test.ts` line 150 comment referencing "agenda"

- [ ] Task 6: Manual browser verification (AC: all)
  - [ ] 6.1: Start dev server, navigate to `/journal`
  - [ ] 6.2: Submit a gibberish entry (e.g., "asdfghjkl random noise"), click Organize, verify Glass Box card appears with content in Feeling/Note
  - [ ] 6.3: Submit a normal journal entry, verify it parses correctly as before
  - [ ] 6.4: Verify no "Agenda" text appears anywhere in the patient UI
  - [ ] 6.5: Verify existing seed data entries still render correctly

## Dev Notes

### Design Trade-off: Journal-Shape Fallback for Non-Journal Intents

When a non-journal parser (e.g., `parseMedication`, `parseAppointment`) throws, the process-level fallback creates a synthetic `JournalResponse` (journal shape) rather than the original intent's shape. This is intentional — the Glass Box pattern requires a valid `ai_response` to render, and the journal shape is the universal fallback that `SafeDailyJournalRender` can always display. The user can still see their raw text in the Feeling/Note fields and manually correct the entry.

### Architecture Patterns and Constraints

- **Glass Box Pattern (Critical):** Every entry must go through: `raw_text` → process → `journal` (with `ai_response`). The fallback ensures this pipeline NEVER breaks. After processing, the entry MUST be `journal` type — never left as `raw_text`.
- **Zod Validation:** All AI responses are validated with Zod schemas. The fallback must return a valid `JournalResponse` that passes `JournalResponseSchema.parse()`.
- **Server-Only Imports:** `smart-parser.ts` is server-only. All changes stay in server context.
- **Supabase Client:** Use `createClient` from `@/lib/supabase/server` in server actions.
- **Calm Design System:** No UI changes needed for this story — fallback entries render through existing `SafeDailyJournalRender` / `GlassBoxCard`.

### Key Files to Touch

| File | Change Type | Description |
|------|------------|-------------|
| `src/lib/openai/smart-parser.ts` | **Modify** | Remove 'agenda' from prompt/types, add fallback in `parseJournal` |
| `src/app/actions/journal-actions.ts` | **Modify** | Remove 'agenda' handling, add process-level fallback |
| `src/lib/openai/smart-parser.test.ts` | **Modify** | Update tests for new behavior |
| `src/__tests__/journal-actions.test.ts` | **Modify** | Add fallback integration tests |
| `src/__tests__/story-1-2-database-migration.test.ts` | **Modify** | Fix comment on line 150 |
| `supabase/seed.sql` | **Modify** | Replace "agenda" in comments/JSON |

### Current State Analysis

**What "agenda" references remain in `src/`:**
1. `smart-parser.ts:22-23` — Prompt still mentions "agenda" as historical term
2. `smart-parser.ts:30` — Return type includes `'agenda'`
3. `journal-actions.ts:31` — `intent === 'agenda'` check in `createJournalEntry`
4. `journal-actions.ts:178` — `case 'agenda':` in `processJournalEntry` switch
5. `story-1-2-database-migration.test.ts:150` — Comment referencing "agenda"

**What's already done (from Story 4.2 and emergency fixes):**
- Database enum no longer contains 'agenda' (removed via migration `20260223000000`)
- TypeScript `JournalEntryType` no longer includes 'agenda'
- Data migration already converted existing 'agendas' entries to 'journal'
- UI routing already uses `/journal` not `/agenda`

### Current `processJournalEntry` Fallback Behavior (INSUFFICIENT)

```typescript
// Current: If parseJournal throws, the ENTIRE processJournalEntry throws
// Result: Entry stays as raw_text — user sees error, Glass Box never appears
catch (err) {
  console.error('Process Entry Failed:', err);
  throw new Error('Failed to process entry with AI');  // ← THIS IS THE BUG
}
```

**Required behavior:** Catch the error, create synthetic `ai_response`, update entry to `journal` anyway.

### Synthetic Fallback Response Shape

```typescript
// When parsing fails, create this:
const syntheticResponse: JournalResponse = {
  Sleep: null,
  Pain: null,
  Feeling: rawText.substring(0, 500),  // Map to "Right now I am feeling"
  Action: null,
  Grateful: null,
  Medication: null,
  Mood: null,
  Note: rawText,  // Full text preserved in Notes
  Appointments: null,
  Scripts: null,
};
```

### Testing Standards

- **Framework:** Vitest with `@testing-library/react` for components
- **Pattern:** Mock OpenAI calls, test Zod validation at boundaries
- **Coverage:** 100% on new/modified parser code
- **Manual:** Browser verification required per project-context.md Rule #4

### Project Structure Notes

- All changes are in existing files — no new files needed
- No database migrations needed — enum is already correct
- No routing changes needed — `/journal` is already the active route
- Alignment with unified project structure: confirmed, no conflicts

### References

- [Source: `src/lib/openai/smart-parser.ts` — Primary implementation file for classifyIntent, parseJournal, and all parsers]
- [Source: `src/app/actions/journal-actions.ts` — Server actions: createJournalEntry, processJournalEntry]
- [Source: `src/components/shared/glass-box/glass-box-card.tsx` — GlassBoxCard with getDynamicBadge and SafeDailyJournalRender]
- [Source: `src/types/database.ts` — JournalEntryType enum (already correct: no 'agenda')]
- [Source: `supabase/migrations/20260223000000_rename_daily_journal_to_journal.sql` — Migration that removed 'agenda' from DB enum]
- [Source: `_bmad-output/implementation-artifacts/4-2-journal-data-model-accuracy.md` — Previous story learnings]
- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 4 story definitions and BDD scenarios]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR_SJ2 (Category Inference), FR_SJ3 (Multi-Intent), FR_SJ4 (Glass Box Review), FR_PR2 (Data Preservation)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — "Draft" pattern, anti-black-box principles, fallback warmth requirements]
- [Source: `_bmad-output/project-context.md` — Critical rules: no real auth, manual UI testing, no auto git commits]

### Previous Story Intelligence (from 4-2)

- **Prompt tuning methodology works:** Story 4.2 successfully tuned `INTENT_CLASSIFICATION_PROMPT` to prioritize `journal` over other intents for ambiguous inputs. Continue this pattern.
- **Zod validation at boundaries:** All AI responses go through strict Zod schema validation. The fallback response MUST also pass `JournalResponseSchema.parse()`.
- **Shape-sniffing in GlassBoxCard:** The component detects entry type by checking `ai_response` keys (`Practitioner Name` → Appointment, `Brand Name` → Medication, etc.). A fallback response with only `Feeling` and `Note` populated will correctly render as a standard Journal entry.
- **100% test coverage pattern:** Story 4.2 achieved 100% coverage on parser code. Maintain this.

### Git Intelligence

Recent commits show:
- `58b7af2` Emergency fix for appointment/medication/script entries not showing — indicates fragility in the entry type filtering that fallback changes must not break
- `1628614` Emergency fix removing `daily_journal` — shows the enum cleanup is ongoing; story 4.3 completes it by removing 'agenda' from code
- `23b4a3b` Complete Story 4.2 — the foundation this story builds on

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

### Completion Notes List

### File List

| File | Change | Description |
|------|--------|-------------|
| `src/lib/openai/smart-parser.ts` | Modified | Removed 'agenda' from prompt and return type; added parser-level fallback in `parseJournal` with synthetic `JournalResponse` |
| `src/app/actions/journal-actions.ts` | Modified | Removed 'agenda' handling in `createJournalEntry` and `processJournalEntry`; added process-level fallback catch block |
| `src/lib/openai/smart-parser.test.ts` | Modified | Removed 'agenda' tests; added fallback behavior tests for `parseJournal` and `classifyIntent` API failure |
| `src/__tests__/journal-actions.test.ts` | Modified | Added `processJournalEntry` fallback test (parser failure still produces valid journal entry) |
| `src/__tests__/story-1-2-database-migration.test.ts` | Modified | Updated line 150 comment replacing "agenda" with "journal" |
| `supabase/seed.sql` | Modified | Replaced "agenda_items" key with "preparation_items" in seed JSON data |
