# Story 8.2: ai-temporal-awareness-prompt-injection

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want the AI to know what today's date is when answering my questions,
So that it doesn't give me outdated information about "upcoming" tests that have already passed.

## Acceptance Criteria

1. **Given** I ask "Do I have any upcoming tests?"
   **When** the Proactive Chat query is sent to the LLM
   **Then** the system prompt injects the exact current date and time
2. **And** the AI successfully filters out past events and only returns tests scheduled in the future

## Tasks / Subtasks

- [x] Update Chat System Prompt (AC: 1, 2)
  - [x] Modify `src/app/api/chat/route.ts` (or the respective chat API route/server action).
  - [x] Inject the current date and time into the system instructions before sending to the `openai` API.
  - [x] Ensure the injected date format aligns with the project standard (`dd-mm-yyyy`) along with the exact time.
- [x] Update Testing (AC: 1, 2)
  - [x] Add unit tests verifying the system prompt includes the current date/time string.

## Dev Notes

- **Architecture:** The date injected into the prompt should be formatted clearly (e.g., using `dd-mm-yyyy hh:mm AM/PM`) so the AI correctly interprets relative temporal queries compared to existing `dd-mm-yyyy` stored entries.
- **Previous Story Intelligence:** In Story 8.1, `smart-parser.ts` classification was improved and dedup logic was added. Ensure that prompt injections for the chat assistant do not interfere with the context structure built for those parsers, though chat typically uses a separate system prompt or route.
- **Git Intelligence:** Previous commits frequently adjusted JSON structures in `journal_entries.ai_response`. The Chat feature likely reads from these. Ensure the AI is instructed to compare the injected date against the stored `dd-mm-yyyy` dates in the context.

### Project Structure Notes

- The Chat API is likely located in `src/app/api/chat/route.ts` or a Server Action handling proactive recall.
- Use `date-fns` or native `Intl.DateTimeFormat` if available to generate the timestamp safely.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 8]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (Low)

### Debug Log References

### Completion Notes List
- Ultimate context engine analysis completed - comprehensive developer guide created
- Added `getCurrentDateTimeContext()` helper to `date-helpers.ts` returning the current date/time as `dd-mm-yyyy hh:mm AM/PM` in the Australia/Melbourne timezone (using native `Intl.DateTimeFormat`, consistent with existing date helpers - no new dependencies). The `dd-mm-yyyy` portion intentionally matches the format of dates stored in `journal_entries.ai_response`, so the LLM can compare like-for-like.
- Injected a "Current Date & Time" context block into the chat route system prompt (`src/app/api/chat/route.ts`), instructing the AI to compare stored dd-mm-yyyy dates against the injected current date to correctly classify upcoming vs. past events.
- The injection is computed per-request inside the POST handler (not the module-level static `SYSTEM_PROMPT` constant), ensuring the timestamp is always current.
- Tests: added `story-8-2-temporal-awareness.test.ts` (helper formatting incl. AM/PM and timezone) and a new case in `chat-api-route.test.ts` verifying the system prompt contains a `dd-mm-yyyy hh:mm AM/PM` string and the "current date" instruction.
- Validation: full suite 615/616 pass (the 1 failing test, `story-7-1-date-formatting.test.ts` seed.sql assertion, is pre-existing on the clean tree and unrelated to this story). Type-check clean. The single lint error (`persona-guard.tsx`) is also pre-existing and in an untouched file.

**Follow-up fix (post manual QA):** Initial injection alone did not satisfy AC2 - the AI still reported a past appointment (31-03-2026) as "upcoming". Root cause: `serializeEntries()` in the chat route only surfaced a fixed scalar list plus nested `Appointments`/`Scripts` arrays, so a standalone appointment record (date stored at the top level of `ai_response` under `Date`, per `AppointmentResponseSchema`) had its date dropped entirely - the model was guessing tense from raw free-text. Even when a date was visible, relying on the LLM to compute relative tense was unreliable. Fix:
- Added `getRelativeDateStatus()` to `date-helpers.ts` - deterministically classifies a dd-mm-yyyy / yyyy-mm-dd date as PAST / TODAY / UPCOMING (Melbourne tz, date-only).
- Rewrote the appointment/immunisation serialization in the chat route to surface top-level `Date` (and nested `Appointments[].Date`) as readable lines tagged `[PAST]`/`[TODAY]`/`[UPCOMING]`. Tag key (`Practitioner Name`/`Visit Type`/`Date`) matches the canonical shape used by `glass-box-card.tsx` and `AppointmentResponseSchema`.
- Strengthened the system instruction to filter strictly on these tags and never describe a `[PAST]` event as upcoming.
- Added tests for `getRelativeDateStatus` and a chat-route test asserting past/future appointments are tagged correctly in the system prompt.

### File List
- src/lib/utils/date-helpers.ts (modified) - added `getCurrentDateTimeContext()` and `getRelativeDateStatus()`
- src/app/api/chat/route.ts (modified) - inject current date/time into system prompt; surface appointment dates with [PAST]/[TODAY]/[UPCOMING] tags
- src/__tests__/story-8-2-temporal-awareness.test.ts (added) - helper + injection + relative-status tests
- src/__tests__/chat-api-route.test.ts (modified) - added date-injection and date-tagging test cases

## Change Log

| Date | Description |
|---|---|
| 2026-06-22 | Story 8.2 implemented: AI temporal awareness via current date/time injection into chat system prompt. Added `getCurrentDateTimeContext()` helper and unit tests. Status to review. |
| 2026-06-22 | Follow-up fix after manual QA found past appointments still reported as upcoming: surface appointment dates in chat context with deterministic [PAST]/[TODAY]/[UPCOMING] tags (`getRelativeDateStatus()`), fixing dropped top-level appointment dates in `serializeEntries`. Strengthened filtering instruction. |
