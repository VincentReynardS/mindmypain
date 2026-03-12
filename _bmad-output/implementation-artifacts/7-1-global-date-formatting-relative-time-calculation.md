# Story 7.1: Global Date Formatting & Relative Time Calculation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want the app to interpret phrases like "Next Tuesday" and save them strictly as `dd-mm-yyyy`,
so that my records maintain a clear, unconfused timeline.

## Acceptance Criteria

1. **Given** I input a phrase with a relative date
2. **When** the AI parser processes it
3. **Then** it calculates the true date relative to the journal's creation date
4. **And** all parsed date strings explicitly use the `dd-mm-yyyy` format across the UI

## Tasks / Subtasks

- [x] Task 1: Update AI Context with Current Date
  - [x] Modify `smart-parser.ts` (or the equivalent API route) to inject the current date and time as a system instruction before passing the text to the LLM.
- [x] Task 2: Update AI Prompt for Date Formatting
  - [x] Adjust the system prompt in `smart-parser.ts` to mandate that any dates (absolute or relative) are resolved to the `dd-mm-yyyy` format based on the provided current date context.
- [x] Task 3: Enforce format in Zod Schemas
  - [x] Ensure that Date strings in Zod validation schemas strictly enforce or format to `dd-mm-yyyy`.
- [x] Task 4: UI Formatters
  - [x] Apply uniform date formatting in the UI components (e.g., Daily List, Glass Box Cards) using `dd-mm-yyyy`.

## Dev Notes

### Technical Requirements

- The AI must be given the current timestamp context to accurately determine relative dates ("yesterday", "next Tuesday").
- The Date string returned via JSON from the LLM (e.g., Appointment Date, Immunisation Date) must strictly follow `dd-mm-yyyy`.
- Fallbacks in the backend/frontend should ideally validate or parse the date to ensure the format holds.

### Architecture Compliance

- Conforms to **Data Architecture Decision 1**: "Global Date Formatting: All parsed relative time phrases (e.g., "Next Tuesday") must be computationally resolved by the AI or backend to a strict `dd-mm-yyyy` format relative to the current timestamp of the session before writing to the database."

### Library / Framework Requirements

- Use standard JavaScript native Date APIs or `date-fns` for date manipulation.
- Continue using `openai-node` to update the LLM system prompt.

### File Structure Requirements

- **Parsers:** Changes expected in `src/app/api/scribe/process/route.ts` or `src/lib/openai/smart-parser.ts` (depending on where the parsing prompt lies).
- **Utils:** Any date formatters should be located in `src/lib/utils.ts` or a new `src/lib/date-utils.ts`.

### Testing Requirements

- The parser should correctly resolve "yesterday" and "next Monday".
- Validate that the UI accurately reflects dates rendered from the backend payload.

### Project Context Reference

- Epic 7 (Core Refinements) aims to eliminate logic errors in data entry. Accurate relative date calculation ensures users can dictate naturally without corrupting their chronological journal.
- `project-context.md` rules on Next.js Server Actions and pure TypeScript typing still apply.

### Previous Story Intelligence

- No previous story in Epic 7; however, earlier smart parser work (Story 3.5, 4.3, 6.4) heavily relied on the prompt definition. Build cautiously upon existing parsing logic to avoid breaking other extractions (MEDICATION, APPOINTMENT schemas).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision 1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 4 tasks implemented: date context injection, prompt updates, Zod schema transforms, UI formatters
- Updated existing `smart-parser.test.ts` to account for Zod dd-mm-yyyy transform on appointment Date field
- Pre-existing `chat-ui.test.tsx` failure is unrelated (voice transcription piping test)
- Seed data updated from relative dates to hardcoded dd-mm-yyyy values
- Legacy data in Supabase is NOT migrated — `formatDateDDMMYYYY()` provides graceful degradation at UI layer
- Review follow-up fixes applied: parser reference dates now use the journal entry `created_at` timestamp
- Review follow-up fixes applied: Australia/Melbourne date normalization is explicit for parse and UI formatting helpers
- Review follow-up fixes applied: patient appointment, medication, and scripts views now format legacy and normalized dates consistently
- Verified with targeted Vitest suite and `pnpm type-check`

### File List

- `src/lib/openai/smart-parser.ts` — Tasks 1-3: `getCurrentDateContext()`, `ddmmyyyyDateString` Zod schema, prompt updates, date context injection
- `src/lib/openai/smart-parser.test.ts` — Updated existing test expectation for dd-mm-yyyy transform
- `src/lib/utils/date-helpers.ts` — Task 4: `formatDateDDMMYYYY()` utility
- `src/app/actions/journal-actions.ts` — Pass entry `created_at` into parser calls and merge reparsing
- `src/components/shared/glass-box/glass-box-card.tsx` — Task 4: date formatting in all renderers via `DATE_FIELDS` set
- `src/components/patient/appointment-glass-box.tsx` — Apply dd-mm-yyyy formatting in patient appointment view and align edit input with stored format
- `src/components/patient/medication-glass-box.tsx` — Apply dd-mm-yyyy formatting in patient medication view and align edit inputs with stored format
- `src/components/patient/scripts-list.tsx` — Apply dd-mm-yyyy formatting for prescribed dates
- `src/app/(patient)/medications/page.tsx` — Task 4: medication mentions date display
- `supabase/seed.sql` — Task 4: seed data dates updated to dd-mm-yyyy
- `src/__tests__/story-7-1-date-formatting.test.ts` — 37 new tests
- `src/__tests__/journal-actions.test.ts` — Added coverage for created_at-anchored parser calls and merge reparsing
- `src/__tests__/appointment-glass-box.test.tsx` — Added date formatting coverage for patient appointment UI
- `src/__tests__/medication-glass-box.test.tsx` — Added date formatting coverage for patient medication UI
- `src/__tests__/scripts-list.test.tsx` — Added date formatting coverage for scripts UI

## Senior Developer Review (AI)

### Outcome

Approved after fixes.

### Review Notes

- Relative date resolution is now anchored to the journal entry `created_at` timestamp instead of parse-time `now`.
- Date normalization now avoids timezone drift for `YYYY-MM-DD` values and formats runtime dates using `Australia/Melbourne`.
- Patient-facing appointment, medication, and scripts views now render dates consistently as `dd-mm-yyyy`.
- Dedicated patient edit forms no longer use `type="date"` for values stored as `dd-mm-yyyy`.

## Change Log

- 2026-03-12: Applied code review fixes for timezone-safe normalization, created_at-based parsing context, and patient UI date formatting coverage.
