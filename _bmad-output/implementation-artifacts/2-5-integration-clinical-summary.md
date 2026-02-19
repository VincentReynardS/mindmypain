# Story 2.5: Integration: Clinical Summary (Scenario 2)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want the app to generate a professional summary for my doctor, (Scenario 2)
so that I can communicate my history effectively without anxiety.

## Acceptance Criteria

1. **Given** the user inputs specific medical details (e.g., "Lyrica side effects, pain spiked to 8/10 yesterday")
   **When** they request a summary (via "Generate Summary" button or prompt)
   **Then** the backend should classify this intent as `type: CLINICAL_SUMMARY`

2. **Given** an entry is identified as a Clinical Summary intent
   **When** the "Smart Parsing" integration runs
   **Then** it should call the LLM to extract structured data into specific sections:
   - **Chief Complaint**: The primary reason for the concern
   - **Medication Review**: Any mentions of dosage, side effects, or adherence
   - **Patient Goal**: What the patient wants from the appointment (e.g., "Change meds", "Get referral")

3. **Given** the LLM returns structured data
   **When** saving to the database
   **Then** the JSON structure result must be saved to `ai_response` column
   **And** A structured text version (or stringified JSON) must be saved to `content` column

4. **Given** the parsing is complete
   **When** the user views the entry
   **Then** the `GlassBoxCard` component should render the `SafeClinicalSummaryRender` view
   **And** It should look like a "Doctor Letter" (distinct from Agendas or raw text)

5. **Given** the summary is generated
   **When** the user clicks "Approve"
   **Then** the status should update to `approved` and it becomes part of the permanent record

## Tasks / Subtasks

- [x] **Task 1: AI Service Enhancement**
  - [x] 1.1 Update `src/lib/openai/smart-parser.ts`
  - [x] 1.2 Implement `generateClinicalSummary(text: string)` function
  - [x] 1.3 System Prompt: Act as an empathetic medical scribe. Enforce JSON schema: `{ "chief_complaint": "string", "medication_review": "string", "patient_goal": "string" }`
  - [x] 1.4 Use existing `gpt-5.2` model (consistent with Story 2.4)

- [x] **Task 2: Server Action Update**
  - [x] 2.1 Update `src/app/actions/journal-actions.ts`
  - [x] 2.2 Add logic handling `type: 'clinical_summary'`
  - [x] 2.3 Call `generateClinicalSummary` -> Store JSON in `ai_response` -> Store string/formatted content in `content`

- [x] **Task 3: Glass Box Card Enhancement**
  - [x] 3.1 Create `src/components/shared/glass-box/renderers/safe-clinical-summary-render.tsx`
  - [x] 3.2 Implement clean, professional layout (Header for "Clinical Summary", distinct sections)
  - [x] 3.3 Update `GlassBoxCard` (`src/components/shared/glass-box/glass-box-card.tsx`) to import and use this renderer when `type === 'clinical_summary'`

- [x] **Task 4: UI Trigger Implementation**
  - [x] 4.1 Update `src/components/patient/journal-input.tsx` or similar
  - [x] 4.2 Add explicit "Generate Doctor Summary" button/toggle (or logic to infer it, but explicit is safer for Scenario 2)
  - [x] 4.3 Ensure "Processing" state is displayed during generation (reuse Story 2.4 patterns)

- [x] **Task 5: Testing & Validation**
  - [x] 5.1 Unit test `generateClinicalSummary` with mock response
  - [x] 5.2 Component test `SafeClinicalSummaryRender` with sample JSON
  - [x] 5.3 Manual verify: Input text -> Generate -> Check DB columns -> Check UI rendering

## Dev Notes

### Architecture Compliance

- **AI Pattern**: Reuse `smart-parser.ts` pattern established in Story 2.4. Do not create a new service file unless necessary.
- **Server Actions**: Keep logic in `journal-actions.ts`.
- **Type Safety**: Define `ClinicalSummaryResponse` interface in `src/types/ai.ts` co-located with `AgendaResponse`.

### Technical Specifics

- **Model**: `gpt-5.2` (or current project standard).
- **JSON Standard**: Continue using `response_format: { type: "json_object" }`.
- **Error Handling**: If LLM fails to generate specific sections, fallback to generic "Notes" section or raw text.

### Previous Story Intelligence (from 2.4 & 2.3)

- **JSON Storage**: Story 2.4 established saving JSON string to `content` for `GlassBoxCard` compatibility. Continue this pattern, but ALSO save to `ai_response`.
- **Auth Caveat**: **CRITICAL** - Remember the Auth breakage in Story 2.4. Do NOT enforce `auth.uid()` checks in Server Actions. Rely on the `userId` passed from the client (simulated auth) and existing RLS policies.
- **Component Reuse**: `GlassBoxCard` is the container. Do not rewrite it; just plug in the new renderer.

### Project Structure Notes

- `src/components/shared/glass-box/renderers/` is a good place for specific schema renderers to avoid bloating the main card component.

### References

- [Source: planning-artifacts/epics.md#Story 2.5](file:///_bmad-output/planning-artifacts/epics.md)
- [Source: implementation-artifacts/2-4-integration-smart-parsing.md](file:///_bmad-output/implementation-artifacts/2-4-integration-smart-parsing.md)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented `generateClinicalSummary` in `smart-parser.ts` with "Medical Scribe" persona.
- Updated `processJournalEntry` and `createJournalEntry` in `journal-actions.ts` to handle `clinical_summary` type.
- Created `SafeClinicalSummaryRender` component for professional "Doctor Letter" presentation.
- Updated `GlassBoxCard` to use the new renderer.
- Added "Save as Doctor Summary" button to `JournalInput`.
- Verified with unit tests for the parser.
- [Review Fixes] Added component test, fixed ghost transcription bug, and added error handling.

### File List

- `src/lib/openai/smart-parser.ts` (Modified)
- `src/lib/openai/smart-parser.test.ts` (Modified)
- `src/app/actions/journal-actions.ts` (Modified)
- `src/components/shared/glass-box/glass-box-card.tsx` (Modified)
- `src/components/shared/glass-box/renderers/safe-clinical-summary-render.tsx` (New)
- `src/components/shared/glass-box/renderers/safe-clinical-summary-render.test.tsx` (New)
- `src/components/patient/journal-input.tsx` (Modified)
- `src/lib/stores/audio-store.ts` (Modified)
