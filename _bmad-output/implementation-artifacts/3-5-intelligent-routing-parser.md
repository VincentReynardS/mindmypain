# Story 3.5: Intelligent Routing Parser Upgrade

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want the AI to automatically file my "messy dumps" into the correct journal tabs,
So that I don't have to manually fill out the complex forms.

## Acceptance Criteria

1. **Given** the user submits a voice/text entry
2. **When** the system parses the input
3. **Then** the `smart-parser.ts` logic should identify if the input represents an Appointment, Medication change, Script task, or general Agenda
4. **And** The AI should attempt to populate the corresponding JSON schema for that specific category
5. **And** The backend should set the `entry_type` correctly so it appears in the right tab's list view

## Tasks / Subtasks

- [x] Task 1: Upgrade `smart-parser.ts` Routing Logic (AC: 1, 2, 3)
  - [x] Subtask 1.1: Enhance the system prompt or routing function in `src/lib/openai/smart-parser.ts` (or equivalent file handling AI generation) to classify the intent (`appointment`, `medication`, `script`, `agenda`).
  - [x] Subtask 1.2: Ensure the parser can select the appropriate Zod schema or JSON structure based on the inferred classification.
- [x] Task 2: Schema Population & Type Alignment (AC: 4)
  - [x] Subtask 2.1: Implement the logic to specifically populate `Appointment` schema if classified as appointment.
  - [x] Subtask 2.2: Implement the logic to specifically populate `Medication` schema if classified as medication.
  - [x] Subtask 2.3: Implement the logic for `Script` and `Referral` schemas.
- [x] Task 3: Backend Integration (AC: 5)
  - [x] Subtask 3.1: Update the API route (e.g. `src/app/api/scribe/process/route.ts`) to save the correctly classified `entry_type` alongside the generated `content` payload into the `journal_entries` table.
- [x] Task 4: Testing & Verification
  - [x] Subtask 4.1: Add unit tests for `smart-parser.ts` to verify correct intent extraction and schema formatting for different mock inputs (Appointment vs Medication).

## Dev Notes

### Technical Requirements

- **Architecture:** The parser logic should run on the server (API route or Server Action) securely calling the OpenAI API.
- **Model Usage:** Ensure usage of `openai-node` v4.28+ and leverage `response_format: { type: "json_object" }` or structured outputs (function calling) for robust schema adherence.
- **Data Model:** Store the inferred category into the `entry_type` column of the `journal_entries` table. Ensure the `content` column strictly matches the expected JSON structure for that type, as the frontend components (`AppointmentGlassBox`, `MedicationGlassBox`, `ScriptsList`) expect this.

### Architecture Compliance

- Follow the single-table design using the `status` enum (`draft`, `pending_review`, `approved`). New parsed entries from the voice/text dump should ideally be created as a `draft` or `pending_review` based on the existing flow.
- Maintain atomic state updates and use server actions gracefully without forcing unnecessary full page reloads, unless revalidating a specific path like `/app/(patient)/journal`.

### Library & Framework Requirements

- Use `openai` SDK for Node.js.
- Ensure Zod (`zod`) is used to validate the AI response before saving to the database to prevent rendering crashes on the frontend.

### File Structure Requirements

- **AI Logic:** `src/lib/openai/smart-parser.ts` (or create if missing/refactoring).
- **Types/Schemas:** Ensure JSON schemas match types used in `src/types/` or co-located with the Glass Box components.
- **API/Actions:** `src/app/api/scribe/process/route.ts` or `src/app/actions/journal-actions.ts`.

### Testing Requirements

- Write unit tests for the parser using Vitest in `src/__tests__/`. Mock the OpenAI response to ensure the routing logic handles different intents correctly.

### Previous Story Intelligence

- **Code Pattern Established:** Look at `src/app/(patient)/medications/page.tsx` and `src/components/patient/medication-glass-box.tsx` for referencing how the JSON payload is validated and rendered. Keep the AI's generated JSON structure strictly aligned with those expectations.
- **Security Check:** Remember the explicit instruction from `project-context.md` to skip `supabase.auth.getUser()` session checks. Do not accidentally introduce UUID checks while modifying the API route that saves the parsed entry. Use the passed Persona ID.
- **Dependencies:** The previous stories successfully established the UI for Appointments, Medications, and Scripts. This story wires the AI brain to feed those UI tabs automatically.

### Project Context Reference

- **Rule 1 (Prototype Auth):** Never check `user.id` or `auth.uid()` from Supabase auth inside Server Actions or API routes to prevent IDOR vulnerabilities.
- **Rule 3 (Server Actions):** When passing functions from Server Components to Client Components, ALWAYS wrap them in a strictly exported async server action.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.5: Intelligent Routing Parser Upgrade]
- [Source: _bmad-output/project-context.md]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

### Completion Notes List

- Implemented `classifyIntent` to leverage an LLM heuristic instead of a regex-based keyword mapping.
- Added explicit schemas using Zod for `MedicationResponse`, `ScriptResponse`, and `AppointmentResponse`.
- Implemented `parseAppointment` and integrated Zod parsing for structure enforcement to prevent frontend rendering crashes.
- Modified `processJournalEntry` inside `src/app/actions/journal-actions.ts` to use `classifyIntent` and route to the correct parsing function.
- Tests updated and run successfully across the test suite for both `smart-parser.ts` functionality and overall integration resilience.
- **[Code Review Fixes]:**
  - Upgraded both `parseAgenda` and `generateClinicalSummary` to use robust Zod schemas.
  - Rewrote API caller functions to use explicit `try/catch` and retain original error messages instead of silently swallowing error sources.
  - Added enum restriction for `AppointmentResponseSchema.Admin Needs`.
  - Added default value of `false` to `ScriptResponseSchema.Filled`.
  - Annotated DB restriction technical debt in `journal-actions.ts`.

### File List

- src/lib/openai/smart-parser.ts
- src/lib/openai/smart-parser.test.ts
- src/app/actions/journal-actions.ts

## Change Log

- Replaced keyword heuristics with `classifyIntent` logic in backend integration routing.
- Added strict Zod schema validation across all parser responses.
- Fixed code review issues relating to missing schemas, hidden errors, and untracked tech debt.
