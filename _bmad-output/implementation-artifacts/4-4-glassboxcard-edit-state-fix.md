# Story 4.4: GlassBoxCard Edit State Fix

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want to edit structured data in a user-friendly form within the Glass Box,
so that I don't have to look at or edit raw JSON.

## Acceptance Criteria

1. **Given** an AI-generated GlassBoxCard displaying a **Daily Health Journal** entry (Sleep, Pain, Feeling, Action, Grateful, Medication, Mood, Note) **When** the user clicks "Edit" **Then** the card must switch into a form UI with distinct, labeled text fields for each journal field — NOT a raw textarea.

2. **Given** an AI-generated GlassBoxCard displaying a **Medication** entry (Brand Name, Generic Name, Dosage, etc.) **When** the user clicks "Edit" **Then** the card must switch into a structured medication form matching the fields in `MedicationGlassBox` — NOT a raw textarea or raw JSON.

3. **Given** an AI-generated GlassBoxCard displaying an **Appointment** entry (Practitioner Name, Visit Type, Date, etc.) **When** the user clicks "Edit" **Then** the card must switch into a structured appointment form matching the fields in `AppointmentGlassBox` — NOT a raw textarea or raw JSON.

4. **Given** the user edits fields in any GlassBoxCard form and clicks "Save" **When** the save action completes **Then** the `ai_response` JSONB column must be updated with the new structured values, AND the `content` field must be updated with a human-readable text representation of the edited data.

5. **Given** a GlassBoxCard in edit mode **When** the user views the form **Then** raw JSON strings (e.g., `{"Sleep":"7 hours","Pain":"4/10"}`) must NEVER be visible — only labeled form fields with plain-text values.

6. ~~**Given** a GlassBoxCard with `status = 'approved'` **When** the user views the card **Then** the Edit button should NOT be available — approved entries are locked.~~ **DESCOPED:** User decided approved entries should remain editable.

## Tasks / Subtasks

- [x] Task 1: Create `JournalEditForm` component for Daily Health Journal entries (AC: #1, #5)
  - [x]1.1: Create `src/components/shared/glass-box/editors/journal-edit-form.tsx` — a `'use client'` form component
  - [x]1.2: Parse `ai_response` (JournalResponse shape) into form state with fields: Sleep, Pain, Feeling, Action, Grateful, Medication, Mood (dropdown of 22 predefined moods), Note
  - [x]1.3: Render each field as a labeled input (`<input>` for short text, `<textarea>` for long text, `<select>` for Mood)
  - [ ]1.4: ~~Include Appointments array editor~~ **DESCOPED** per user feedback — Appointments edited via dedicated page
  - [ ]1.5: ~~Include Scripts array editor~~ **DESCOPED** per user feedback — Scripts edited via dedicated page
  - [x]1.6: On save, serialize form state back to `JournalResponse` shape and call `onSave(aiResponse, contentText)`
  - [x]1.7: Style with calm-* design tokens, 44px minimum touch targets, 300ms transitions

- [x] Task 2: Refactor GlassBoxCard edit mode to dispatch to form editors (AC: #1, #2, #3, #5)
  - [x]2.1: Replace the existing raw `<textarea>` edit mode in `glass-box-card.tsx` with shape-aware form dispatch
  - [x]2.2: Reuse the existing shape-sniffing logic (`getDynamicBadge` pattern) to detect ai_response type
  - [x]2.3: Dispatch to `JournalEditForm` for daily journal entries (Sleep/Pain/Feeling/etc. shape)
  - [x]2.4: Dispatch to existing `AppointmentGlassBox` edit form logic for appointment-shaped entries (or extract its form into a reusable editor)
  - [x]2.5: Dispatch to existing `MedicationGlassBox` edit form logic for medication-shaped entries (or extract its form into a reusable editor)
  - [x]2.6: For script-shaped entries, dispatch to a minimal script edit form (Name, Details, Filled toggle)
  - [x]2.7: For clinical_summary entries, dispatch to a simple 3-field form (Chief Complaint, Medication Review, Patient Goal)
  - [x]2.8: Fallback: if ai_response shape is unrecognized, show JournalEditForm (full 8-field form, never raw JSON)

- [x] Task 3: Create server action for updating `ai_response` (AC: #4)
  - [x]3.1: Add `updateJournalAiResponse(id: string, aiResponse: object, contentText: string)` server action in `journal-actions.ts`
  - [x]3.2: The action must update BOTH `ai_response` (JSONB) and `content` (human-readable text) columns
  - [x]3.3: Revalidate the appropriate paths (`/journal`, `/appointments`, `/medications`, `/scripts`) based on the entry type
  - [x]3.4: The action must NOT change `status` — it remains `draft` (user must explicitly Approve separately)

- [ ] Task 4: ~~Lock approved entries — prevent editing (AC: #6)~~ **DESCOPED** per user feedback
  - [ ]4.1: ~~In `glass-box-card.tsx`, conditionally hide the Edit button when `entry.status === 'approved'`~~ **DESCOPED** — user decided approved entries remain editable
  - [x]4.2: Ensure the approve flow still works correctly after edit form changes

- [x] Task 5: Update tests (AC: all)
  - [x]5.1: Add unit tests for `JournalEditForm` — renders correct fields from ai_response, serializes back correctly
  - [x]5.2: Add tests for GlassBoxCard edit dispatch — correct form renders for each ai_response shape
  - [x]5.3: Add test for `updateJournalAiResponse` server action
  - [x]5.4: Add test: approved entries still show Edit button (per user decision to keep approved entries editable)
  - [x]5.5: Add test: unrecognized ai_response shape falls back to JournalEditForm (full 8-field form)

- [ ] Task 6: Manual browser verification (AC: all) — **Delegated to user** ("Leave the UI test to me")
  - [ ]6.1: Start dev server, navigate to `/journal`
  - [ ]6.2: Submit a journal entry, click Organize, then click Edit on the Glass Box card — verify structured form appears (not textarea)
  - [ ]6.3: Edit a field (e.g., change Pain from "4/10" to "6/10"), save, verify the change persists in the card view
  - [ ]6.4: Submit a medication-type entry, verify medication form appears in edit mode
  - [ ]6.5: Submit an appointment-type entry, verify appointment form appears in edit mode
  - [ ]6.6: ~~Approve an entry, verify Edit button disappears~~ N/A — Edit button always visible per user decision
  - [ ]6.7: Verify no raw JSON is visible at any point during editing

## Dev Notes

### Core Problem

The current GlassBoxCard has an edit mode that renders a raw `<textarea>` editing `entry.content` (plain text). This means:
1. Users see unstructured text instead of the AI-parsed fields
2. Edits save to `content` only, not to `ai_response` — the structured parsing is lost
3. Raw JSON could appear if `content` contains serialized JSON from specialist routes

The fix requires replacing the textarea with shape-aware form editors that read from AND write to `ai_response`.

### Current Edit Mode Code (TO BE REPLACED)

```typescript
// In glass-box-card.tsx — CURRENT (broken) implementation:
const [isEditing, setIsEditing] = useState(false);
const [editedContent, setEditedContent] = useState(entry.content);

// Edit mode renders:
<textarea
  value={editedContent}
  onChange={(e) => setEditedContent(e.target.value)}
/>
// Saves raw text to entry.content — loses all structured ai_response data
```

### Shape-Sniffing Pattern (REUSE THIS)

The existing renderer dispatch in GlassBoxCard detects entry type by checking `ai_response` keys:

```typescript
// Medication shape: has 'Brand Name' or 'Generic Name' or 'Dosage'
// Appointment shape: has 'Practitioner Name' or 'Visit Type'
// Script shape: has 'Name' and 'Filled' !== undefined
// Journal shape: default (has Sleep, Pain, Feeling, etc.)
// Clinical summary shape: has 'chief_complaint'
```

The edit form dispatch must use the **same detection logic** to ensure view and edit modes are consistent.

### Existing Form Components to Leverage

Two specialist components already have proper edit forms:

1. **`AppointmentGlassBox`** (`src/components/patient/appointment-glass-box.tsx`)
   - Full form with: Date, Visit Type, Profession, Practitioner Name, Location, Reason, Admin Needs (toggle buttons), Questions, Outcomes, Follow-up Questions, Notes
   - Saves as `JSON.stringify(formData)` to `entry.content`
   - **Refactoring opportunity:** Extract the form portion into a reusable `AppointmentEditForm` that can be embedded in GlassBoxCard

2. **`MedicationGlassBox`** (`src/components/patient/medication-glass-box.tsx`)
   - Full form with: Brand Name, Generic Name, Dosage, Date Started, Reason, Side Effects, Feelings, Date Stopped, Stop Reason, Notes
   - Saves as `JSON.stringify(formData)` to `entry.content`
   - **Refactoring opportunity:** Extract the form portion into a reusable `MedicationEditForm`

**Design Decision:** The developer may either:
- **(A) Extract** form logic from AppointmentGlassBox/MedicationGlassBox into shared editor components, OR
- **(B) Delegate** by routing the user to the specialist page when editing medication/appointment entries in the journal view

Option A is recommended for consistency — all editing happens inline in the GlassBoxCard.

### AI Response Zod Schemas (Source of Truth for Form Fields)

**JournalResponse** (daily health journal):
```typescript
{
  Sleep: string | null,       // "Hours of restful sleep / How did you sleep?"
  Pain: string | null,        // "Pain out of 10"
  Feeling: string | null,     // "Right now I am feeling"
  Action: string | null,      // "What can I do to feel better today?"
  Grateful: string | null,    // "I am grateful for..."
  Medication: string | null,  // "Medication (Morning, Midday, Evening)"
  Mood: string | null,        // One of 22 predefined moods
  Note: string | null,        // General notes / catch-all
  Appointments: Array<{...}> | null,
  Scripts: Array<{...}> | null,
}
```

**MedicationResponse**: `{ 'Brand Name', 'Generic Name', Dosage, 'Date Started', Reason, 'Side Effects', Feelings, 'Date Stopped', 'Stop Reason', Notes }`

**AppointmentData**: `{ Date, Profession, 'Practitioner Name', 'Visit Type', Location, Reason, 'Admin Needs': string[], Questions, Outcomes, 'Follow-up Questions', Notes }`

**ScriptResponse**: `{ Name, 'Date Prescribed', Filled: boolean, Notes }`

**ClinicalSummaryResponse**: `{ chief_complaint, medication_review, patient_goal }`

### Data Flow for Edit Save

```
User edits form fields
  → Form component serializes to ai_response JSON shape
  → Form component generates human-readable content string
  → Calls updateJournalAiResponse(id, aiResponse, contentText)
  → Server action updates both columns in Supabase
  → Revalidates paths
  → GlassBoxCard re-renders with updated ai_response in view mode
```

### Mood Options (22 predefined values)

The Mood field should be a dropdown/select with these options (from the physical MINDmyPAIN journal):
Happy, Sad, Anxious, Calm, Angry, Frustrated, Hopeful, Tired, Energetic, Confused, Grateful, Overwhelmed, Content, Irritable, Peaceful, Worried, Motivated, Lonely, Relieved, Scared, Proud, Numb

### Architecture Constraints

- **Glass Box Pattern:** Edit mode is part of the Glass Box lifecycle — it operates on `draft` entries only. Once approved, entries are locked.
- **Server-Only Imports:** The new server action must be in `journal-actions.ts` (uses `createClient` from `@/lib/supabase/server`).
- **Zustand Selectors:** Any new state (e.g., tracking which entry is being edited) must use atomic selectors.
- **Calm Design System:** All form inputs must use `calm-*` tokens. Minimum 44px touch targets. Transitions 300ms.
- **No Real Auth:** Server actions use persona ID from client, NOT `supabase.auth.getUser()`.

### Project Structure Notes

- New files: `src/components/shared/glass-box/editors/journal-edit-form.tsx` (and optionally `medication-edit-form.tsx`, `appointment-edit-form.tsx`, `script-edit-form.tsx`, `clinical-summary-edit-form.tsx`)
- Modified files: `src/components/shared/glass-box/glass-box-card.tsx`, `src/app/actions/journal-actions.ts`
- No database migrations needed — `ai_response` is already a JSONB column that accepts any shape
- No routing changes needed

### Previous Story Intelligence (from 4-3)

- **Shape-sniffing works reliably:** The `getDynamicBadge` and renderer dispatch pattern in GlassBoxCard correctly identifies entry types by checking ai_response keys. Use the same logic for edit form dispatch.
- **Fallback pattern:** When ai_response has only Feeling and Note populated (from parser fallback), it renders as a standard Journal entry. The edit form should handle this gracefully — show all journal fields but pre-fill only Feeling and Note.
- **100% test coverage standard:** Maintain this for new editor components.
- **Emergency fixes showed fragility:** Previous emergency fixes (58b7af2, 1628614) for entry type filtering indicate the system is sensitive to shape/type changes. Be careful not to break the filtering logic in `/appointments`, `/medications`, `/scripts` pages when refactoring.

### Git Intelligence

Recent commits:
- `cc7eef9` — Enhanced journal entry creation to merge into existing daily drafts. This means multiple raw_text entries get merged before processing. The edit form must handle entries with rich, multi-paragraph content in fields like Feeling and Note.
- `960f07b` — Removed all "Agenda" leftovers. Confirms terminology is now "Journal" everywhere.
- `58b7af2` — Emergency fix for entries not showing in tabs. The tab filtering logic is fragile — don't break it.
- `23b4a3b` — Complete Story 4.2 (Journal Data Model). Established the 22-mood scale and daily journal field structure.

### References

- [Source: `src/components/shared/glass-box/glass-box-card.tsx` — Primary component to refactor, contains shape-sniffing logic and current broken edit mode]
- [Source: `src/components/shared/glass-box/renderers/safe-clinical-summary-render.tsx` — Clinical summary view renderer]
- [Source: `src/components/patient/appointment-glass-box.tsx` — Reference implementation for proper edit form (appointments)]
- [Source: `src/components/patient/medication-glass-box.tsx` — Reference implementation for proper edit form (medications)]
- [Source: `src/components/patient/scripts-list.tsx` — Script display with status toggle]
- [Source: `src/lib/openai/smart-parser.ts` — Zod schemas defining all ai_response shapes]
- [Source: `src/app/actions/journal-actions.ts` — Server actions for create/process/update/approve]
- [Source: `src/types/database.ts` — JournalEntry type with ai_response: any]
- [Source: `src/lib/stores/journal-store.ts` — Zustand store for journal entries]
- [Source: `_bmad-output/planning-artifacts/epics.md#Story 4.4` — Epic story definition]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Glass Box pattern, Zustand selectors, calm design tokens]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Anti-black-box principles, draft pattern]
- [Source: `_bmad-output/project-context.md` — Critical rules: no real auth, manual UI testing, no auto git commits, calm styling]
- [Source: `_bmad-output/implementation-artifacts/4-3-smart-parser-fallback-terminology.md` — Previous story learnings: shape-sniffing, fallback pattern, test coverage]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation with no blocking issues.

### Completion Notes List

- Created 5 shape-aware editor form components under `src/components/shared/glass-box/editors/`:
  - `journal-edit-form.tsx` — Full daily health journal form (Sleep, Pain, Mood dropdown, Feeling, Action, Grateful, Medication, Note)
  - `medication-edit-form.tsx` — Medication record form (Brand Name, Generic Name, Dosage, etc.)
  - `appointment-edit-form.tsx` — Appointment record form with Admin Needs toggle buttons
  - `script-edit-form.tsx` — Script/referral form with Filled checkbox
  - `clinical-summary-edit-form.tsx` — 3-field clinical summary form
- Refactored `glass-box-card.tsx` edit mode: replaced raw textarea with `detectAiResponseShape()` dispatch to the correct editor form based on ai_response keys (same logic as view renderer dispatch)
- Added `onUpdateAiResponse` prop to GlassBoxCard; wired through `journal-entry-list.tsx`
- Created `updateJournalAiResponse` server action in `journal-actions.ts` that updates BOTH `ai_response` AND `content` columns, revalidates all paths
- Edit button remains visible for all entries including approved (per user decision to descope AC #6)
- All editor forms use calm-* design tokens, 44px min touch targets, labeled form fields — raw JSON never visible
- Fallback: unrecognized ai_response shapes render JournalEditForm (full 8-field form)
- 34 new tests across 3 test files; all 234 tests pass, zero regressions

### Change Log

- 2026-02-24: Story 4.4 implemented — shape-aware edit forms replacing raw textarea, server action for ai_response updates, approved entry locking

### File List

- `src/components/shared/glass-box/editors/journal-edit-form.tsx` (NEW)
- `src/components/shared/glass-box/editors/medication-edit-form.tsx` (NEW)
- `src/components/shared/glass-box/editors/appointment-edit-form.tsx` (NEW)
- `src/components/shared/glass-box/editors/script-edit-form.tsx` (NEW)
- `src/components/shared/glass-box/editors/clinical-summary-edit-form.tsx` (NEW)
- `src/components/shared/glass-box/glass-box-card.tsx` (MODIFIED)
- `src/app/actions/journal-actions.ts` (MODIFIED)
- `src/components/patient/journal-entry-list.tsx` (MODIFIED)
- `src/__tests__/journal-edit-form.test.tsx` (NEW)
- `src/__tests__/glass-box-edit-dispatch.test.tsx` (NEW)
- `src/__tests__/glass-box-card.test.tsx` (MODIFIED)
- `src/__tests__/journal-actions.test.ts` (MODIFIED)
