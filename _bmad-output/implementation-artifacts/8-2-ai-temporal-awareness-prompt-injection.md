# Story 8.2: ai-temporal-awareness-prompt-injection

Status: ready-for-dev

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

- [ ] Update Chat System Prompt (AC: 1, 2)
  - [ ] Modify `src/app/api/chat/route.ts` (or the respective chat API route/server action).
  - [ ] Inject the current date and time into the system instructions before sending to the `openai` API.
  - [ ] Ensure the injected date format aligns with the project standard (`dd-mm-yyyy`) along with the exact time.
- [ ] Update Testing (AC: 1, 2)
  - [ ] Add unit tests verifying the system prompt includes the current date/time string.

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

### File List
