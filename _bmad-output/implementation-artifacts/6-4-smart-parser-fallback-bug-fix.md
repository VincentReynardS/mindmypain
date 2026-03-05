# Story 6.4: Smart Parser Fallback Bug Fix

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want unrecognized entries to properly default to the general Notes field,
so that I don't lose data when the AI cannot categorize an entry.

## Acceptance Criteria

1. **Given** an unstructured voice/text input that doesn't fit specific categories
   **When** the AI processes the entry
   **Then** the content should default into a "Notes" or "Right now I am feeling" field
2. **Given** an unrecognized entry
   **When** the entry is saved and reviewed in the UI
   **Then** the fields should not be empty upon review/edit

## Tasks / Subtasks

- [x] Task 1: Fix `parseJournal` AI extraction logic (AC: 1, 2)
  - [x] Updated `JOURNAL_SYSTEM_PROMPT` to instruct AI to place unrecognized input into Note field.
  - [x] Added post-parse fallback in `parseJournal()` — if all fields are empty, sets `result.Note = text`.
  - [x] Fallback respects validly extracted data (only triggers when ALL fields are empty).
  - [x] Added 2 new tests: all-null fallback + partial-data non-override.

- [x] Task 2: Validate edge case handling (AC: 1, 2)
  - [x] Confirmed `journal-actions.ts` catch block already preserves raw text on API failure.
  - [x] Found additional bug: `classifyIntent` can misroute to `appointment`/`medication`/`script` parsers which return sparse data that renders as empty cards.
  - [x] Added safety net in `processJournalEntry` — after ANY parser returns, checks if response has renderable content. If all values are null/empty, falls back to journal response with raw text in Note.
  - [x] Strengthened `JOURNAL_SYSTEM_PROMPT` Note instruction to capture remaining unmapped content even when other fields are populated.

- [x] Task 3: Manual Browser Testing
  - [x] "Just testing the app today" → Organize → Note: "Just testing the app today"
  - [x] "At Adrian's appointment, 180 Cash, add to finance section." → Organize → Note contains full text (previously rendered empty card)

## Dev Notes

### Current Implementation & The Bug

The `processJournalEntry` action uses a two-step parsing pipeline:

1. `classifyIntent(text)` detects the intent. For ambiguous text, it correctly defaults to `journal`.
2. `parseJournal(text)` sends the text to `gpt-4o` with `JOURNAL_SYSTEM_PROMPT`.

**The Bug:** The AI prompt instructs: `If a field or array is empty/not mentioned, set it to null or an empty array []. Be concise.` For ambiguous text like "Just testing!", the AI successfully parses the text but decides none of the fields (Sleep, Pain, Mood, etc.) apply, returning an empty JSON object: `{ "Sleep": null, "Pain": null, "Note": null, ... }`. The zod schema parses this successfully, returning empty data to the UI. The user's input is effectively discarded.

**The Fix:**
In `parseJournal` (`src/lib/openai/smart-parser.ts`), after parsing the AI response with `JournalResponseSchema.parse(parsed)`, implement a check. If all primary text fields (`Feeling`, `Note`, `Action`, `Sleep`, `Pain`, `Grateful`, `Medication`, `Mood`) are empty, explicitly assign the original raw `text` to the `Note` (or `Feeling`) field before returning the object.

Example logic:

```typescript
const result = JournalResponseSchema.parse(parsed);

// Prevent data loss for unrecognized entries
const hasAnyData =
  result.Sleep ||
  result.Pain ||
  result.Feeling ||
  result.Action ||
  result.Grateful ||
  result.Medication ||
  result.Mood ||
  result.Note ||
  (result.Appointments && result.Appointments.length > 0) ||
  (result.Scripts && result.Scripts.length > 0);

if (!hasAnyData) {
  result.Note = text;
}

return result;
```

Additionally, check if `JOURNAL_SYSTEM_PROMPT` needs a slight tweak to explicitly say: "If the input doesn't fit any specific category, place the ENTIRE input text into the 'Note' field."

### Project Structure Notes

- `src/lib/openai/smart-parser.ts`: Contains the parsing logic.
- `src/app/actions/journal-actions.ts`: Contains the server action calling the parser. Keep in mind the unified error fallback in `processJournalEntry` catch block in `journal-actions.ts` already correctly preserves raw text on an API failure. The issue is when the AI API _succeeds_ but returns an empty structured output.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-4.3-Smart-Parser-Fallback--Terminology]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.4-Smart-Parser-Fallback-Bug-Fix]
- [Source: src/lib/openai/smart-parser.ts] (Parsing logic)
- [Source: src/app/actions/journal-actions.ts] (Action calling parser)
- [Source: _bmad-output/project-context.md#Rule-4] (Manual UI testing requirement)

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

### Completion Notes List

- Both prompt tweak and code fallback implemented as dual safety net
- 308 tests pass (2 new), no lint regressions from changes
- Senior code review fixes applied: semantic-empty detection now handles empty nested objects/arrays and false-only booleans.
- Added regression coverage for `processJournalEntry` success-path fallback behavior.
- Merge-on-organize now only runs for true journal-origin outputs (`intent=journal` or safety-net fallback), avoiding sparse appointment/medication false merges.
- Post-merge delete failure no longer triggers synthetic fallback rewriting of source entry; cleanup is best-effort to avoid data corruption.

### File List

- `src/lib/openai/smart-parser.ts` — Prompt tweak + post-parse empty-result fallback
- `src/lib/openai/smart-parser.test.ts` — 2 new test cases
- `src/app/actions/journal-actions.ts` — Safety net for misclassified entries with sparse parser output
- `src/__tests__/journal-actions.test.ts` — Added 2 tests for successful parser-empty fallback and meaningful-value preservation
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Synced `6-4-smart-parser-fallback-bug-fix` to `done`

## Senior Developer Review (AI)

### Reviewer

Vincent

### Date

2026-03-05

### Outcome

Approved after fixes.

### Summary of Issues Fixed

- Hardened empty-content detection in `parseJournal` to treat arrays of empty objects as non-meaningful.
- Hardened empty-content detection in `processJournalEntry` to avoid treating `false`-only parser output as meaningful.
- Added test coverage for successful parser-return paths that were previously untested.
- Restricted journal-merge eligibility to prevent sparse non-journal payloads being merged/deleted as journal entries.
- Added guardrail for partial merge failures so synthetic fallback does not run after target merge succeeds.

### Validation Evidence

- `pnpm -s vitest run src/lib/openai/smart-parser.test.ts` (pass)
- `pnpm -s vitest run src/__tests__/journal-actions.test.ts` (pass)
- `pnpm -s vitest run src/lib/openai/smart-parser.test.ts src/__tests__/journal-actions.test.ts` (pass)

### Change Log

- 2026-03-05: Applied post-review fixes for semantic-empty parser outputs, added regression tests, and synced story status to `done`.
- 2026-03-05: Hardened journal merge eligibility and partial-failure handling; added regression tests for sparse non-journal payloads and delete-failure merge cleanup.
