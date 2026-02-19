# Story 2.4: Integration: Smart Parsing (Scenario 1 & 3)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want the app to sort my "messy dump" into an organized Agenda or Task List, (Scenario 1 & 3)
so that I don't have to worry about forgetting important details.

## Acceptance Criteria

1. **Given** the user creates a journal entry (or edits an existing one)
   **When** the content is processed (e.g., via "Organize" button or auto-classification on submission)
   **Then** the backend should classify the intent. If it's a "messy dump" of tasks/questions, classify as `type: AGENDAS`.

2. **Given** an entry is identified as an Agenda
   **When** the "Smart Parsing" integration runs
   **Then** it should call the LLM (OpenAI) to extract structured items:
   - Clinical Symptoms
   - Admin Tasks
   - Questions for Doctor

3. **Given** the LLM returns structured data
   **When** saving to the database
   **Then** the JSON structure result must be saved to `ai_response` column
   **And** A stringified version of the JSON (or formatted text) must be saved to `content` column to trigger the `GlassBoxCard` rendering logic

4. **Given** the parsing is complete
   **When** the user views the entry
   **Then** the `GlassBoxCard` component should render the `SafeAgendaRender` list view instead of raw text

5. **Given** a processing delay (< 3s)
   **When** the parsing is happening
   **Then** the UI should show a "Processing..." or "Organizing..." state to the user

## Tasks / Subtasks

- [x] **Task 1: AI Service Integration**
  - [x] 1.1 Create `src/lib/openai/smart-parser.ts` (or extend existing client)
  - [x] 1.2 Implement `parseAgenda(text: string)` function that calls OpenAI API
  - [x] 1.3 key requirement: System Prompt must enforce strict JSON output matching the schema: `{ "agenda_items": [ { "category": "string", "item": "string" } ] }`

- [x] **Task 2: Server Action Enhancement**
  - [x] 2.1 Update `src/app/actions/journal-actions.ts`
  - [x] 2.2 Create `processEntry(id: string)` action (or integrate into `createJournalEntry`)
  - [x] 2.3 Logic: Fetch entry -> Call `parseAgenda` -> Update `entry_type='agendas'`, `ai_response=json`, `content=JSON.stringify(json)` -> Revalidate path

- [x] **Task 3: Frontend Trigger & State**
  - [x] 3.1 Update `src/components/patient/journal-entry-card.tsx` or creation flow
  - [x] 3.2 Add "Organize" button (if not automatic) or visual indicator during processing
  - [x] 3.3 Verify "Processing" state handling (optimistic UI or loading state)

- [x] **Task 4: Testing & Validation**
  - [x] 4.1 Unit test `parseAgenda` with mock OpenAI response
  - [x] 4.2 Verify `GlassBoxCard` renders the generated JSON correctly
  - [x] 4.3 Verify fallback if LLM returns invalid JSON (should stay as raw text or error)

## Dev Notes

### Architecture Compliance

- **AI Service**: Use `openai` library. Ensure API key is loaded from env (`OPENAI_API_KEY`).
- **Server Actions**: All database mutations and AI calls must happen server-side.
- **Type Safety**: Define the `AgendaResponse` interface in `src/types/ai.ts` (or similar) to ensure type safety between LLM and DB.

### Technical Specifics

- **Model**: Use `gpt-5.2` for speed/cost (Parsing is a simple task).
- **JSON Mode**: Use OpenAI's `response_format: { type: "json_object" }` to guarantee valid JSON.
- **Latency**: Expect 1-3s latency. The UI _must_ handle this gracefully.

### Previous Story Intelligence (from 2.3)

- **GlassBoxCard Compatibility**: Story 2.3 implemented `SafeAgendaRender` which parses `content` string.
- **Critical Data Flow**: To use the _existing_ 2.3 logic, we MUST save the JSON string into the `content` column.
- **Refinement Opportunity**: While `ai_response` column exists, `GlassBoxCard` currently relies on `content`. For this story, stick to the `content` pattern for display, but populate `ai_response` for future proofing.
- **Editing Risk**: Editing the raw JSON string in `GlassBoxCard` (from Story 2.3) is fragile. If time permits, add a simpler "Edit Text" mode that re-triggers parsing, or just warn the user. (Note: Story 2.3 marked "JSON Editing" as a known medium issue - this story focuses on _Generation_, so basic JSON string storage is acceptable for now).

### Project Structure Notes

- `src/lib/openai/` is the correct place for the service.
- `src/app/actions/` is the correct place for the logic.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Validated `GlassBoxCard` source for rendering logic.
- Checked `journal-actions.ts` for existing patterns.

### Completion Notes List

- AI Parsing integration defined.
- JSON storage pattern (content vs ai_response) clarified to match Story 2.3 implementation.

### Lessons Learned (Critical Regression Fix)

- **Auth Mismatch**: Attempting to enforce Supabase Auth `user_id` checks in Server Actions broke the app because we use string Persona IDs (e.g., 'sarah'). Reverted to using passed `userId` while maintaining RLS at the database level. **Do not re-introduce strict Auth UUID checks.**

### Completion Notes

- Implemented `processJournalEntry` server action with robust error handling and type casting.
- Created `smart-parser.ts` with OpenAI `gpt-5.2` integration and `json_object` enforcement.
- Verified parsing logic with `smart-parser.test.ts`.
- Updated `JournalEntryCard` to include "Organize" button for raw text entries.

## File List

### Modified

- `src/app/actions/journal-actions.ts`
- `src/components/patient/journal-entry-card.tsx`
- `package.json` (OpenAI dependency confirmed)

### New

- `src/lib/openai/smart-parser.ts`
- `src/lib/openai/smart-parser.test.ts`
- `src/components/patient/journal-input.tsx` (Added "Save Entry" flow)
- `MANUAL_TESTING.md` (Verification plan)

## Change Log

- 2026-02-19: Implemented AI parsing service and frontend integration. Added unit tests for parser. Verified via manual logic check and automated unit tests.
