# Story 7.8: Medication History View Fix

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want to see my medication logs fully structured with brand names and dosages on the Medications page,
So that I can review my actual structured data, rather than just the raw input note.

## Acceptance Criteria

1. **Given** I navigate to the Medications tab (`/medications`)
   **When** the list of dedicated medication entries loads
   **Then** each entry should display its parsed structured fields (Brand Name, Generic Name, Dosage, Date Started, Reason, Side Effects, Feelings, Date Stopped, Stop Reason, Notes) from `ai_response`
   **And** they should NOT show just the raw text note from the `content` column

2. **Given** a medication entry on the Medications page
   **When** I click "Edit"
   **Then** the edit form should populate from `ai_response` structured data
   **And** saving should update both `ai_response` (structured) and `content` (human-readable text) columns

3. **Given** a medication entry on the Medications page
   **When** I click "Add" (approve)
   **Then** the entry status should transition to `approved` and display as "Added"
   **And** the structured view should remain intact after approval

4. **Given** a legacy medication entry that has `content` as JSON but no `ai_response`
   **When** it renders on the Medications page
   **Then** it should gracefully fall back to parsing `content` as JSON for display

## Tasks / Subtasks

- [x] Task 1: Refactor `MedicationGlassBox` to read from `ai_response` instead of `content` (AC: #1, #4)
  - [x] Change view mode to read structured fields from `entry.ai_response` (primary) with `entry.content` JSON parse as fallback
  - [x] Update the `MedicationData` extraction logic to prefer `ai_response` over `content`
  - [x] Ensure all field labels and rendering match `SafeMedicationRender` output on the home page

- [x] Task 2: Refactor `MedicationGlassBox` edit mode to use `ai_response` (AC: #2)
  - [x] Populate edit form fields from `ai_response` instead of `content`
  - [x] On save, call `updateJournalAiResponse` (writes both `ai_response` and `content`) instead of `updateMedicationEntry` (writes only `content`)
  - [x] Preserve `_intent: 'medication'` in the saved `ai_response`

- [x] Task 3: Update medications page to pass `ai_response`-aware callbacks (AC: #2, #3)
  - [x] Update `handleUpdate` to use `updateJournalAiResponse` action
  - [x] Verify `handleApprove` correctly works with the new data flow
  - [x] Ensure optimistic UI updates reflect structured data changes

- [x] Task 4: Tests (AC: #1–#4)
  - [x] Update `medication-glass-box.test.tsx` to test `ai_response`-based rendering
  - [x] Test fallback to `content` JSON for legacy entries
  - [x] Test edit form population from `ai_response`

## Dev Notes

### Root Cause

`MedicationGlassBox` reads structured data from `entry.content` via `JSON.parse()` (line 26-31, 36, 220 of `medication-glass-box.tsx`). However, the AI parser stores structured medication data in `entry.ai_response` (JSONB column), and `entry.content` contains either raw user text or a stringified JSON copy. On the home page, `GlassBoxCard` → `SafeMedicationRender` reads directly from `entry.ai_response`, which is why medications display correctly there but not on `/medications`.

**The fix:** Make `MedicationGlassBox` read from `entry.ai_response` as primary source, with `entry.content` JSON parse as fallback for legacy entries.

### Technical Requirements

**Two data paths exist for medication entries — both must be understood:**

| Path | Read Source | Write Target | Used By |
|---|---|---|---|
| `GlassBoxCard` (home page) | `entry.ai_response` | `updateJournalAiResponse()` → writes both `ai_response` + `content` | Home / Journal pages |
| `MedicationGlassBox` (medications page) | `entry.content` (BUG) | `updateMedicationEntry()` → writes only `content` | `/medications` page |

**After fix, both paths should read from `ai_response` and write via `updateJournalAiResponse()`.**

**Data extraction priority for view mode:**
1. `entry.ai_response` — primary source (structured JSONB from AI parser)
2. `JSON.parse(entry.content)` — fallback for legacy entries pre-dating `ai_response`
3. `{ Notes: entry.content }` — final fallback if content is plain text

**`MedicationGlassBox` component changes (Task 1):**

Current `parseContent()` function (line 26-31):
```ts
function parseContent(content: string): MedicationData {
  try { return JSON.parse(content || '{}'); }
  catch { return { Notes: content }; }
}
```

Replace with a function that extracts from `ai_response` first:
```ts
function extractMedicationData(entry: JournalEntry): MedicationData {
  // Primary: structured ai_response
  const ai = entry.ai_response as Record<string, unknown> | null;
  if (ai && (ai['Brand Name'] || ai['Generic Name'] || ai.Dosage)) {
    return {
      'Brand Name': String(ai['Brand Name'] ?? ''),
      'Generic Name': String(ai['Generic Name'] ?? ''),
      Dosage: String(ai.Dosage ?? ''),
      'Date Started': String(ai['Date Started'] ?? ''),
      Reason: String(ai.Reason ?? ''),
      'Side Effects': String(ai['Side Effects'] ?? ''),
      Feelings: String(ai.Feelings ?? ''),
      'Date Stopped': String(ai['Date Stopped'] ?? ''),
      'Stop Reason': String(ai['Stop Reason'] ?? ''),
      Notes: String(ai.Notes ?? ''),
    };
  }
  // Fallback: parse content as JSON
  try { return JSON.parse(entry.content || '{}'); }
  catch { return { Notes: entry.content }; }
}
```

This function takes the full `entry` (not just `content`), so **all call sites** must be updated:
- Line 36: `useState<MedicationData>(parseContent(entry.content))` → `useState<MedicationData>(() => extractMedicationData(entry))`
- Line 65: `setFormData(parseContent(entry.content))` → `setFormData(extractMedicationData(entry))`
- Line 220: `const data = parseContent(entry.content)` → `const data = extractMedicationData(entry)`

**`MedicationGlassBox` save handler changes (Task 2):**

Current `handleSave` (line 41-51) calls `onUpdate(entry.id, JSON.stringify(formData))` which writes only to `content`.

Change the component's `onUpdate` prop signature:
```ts
// Old
onUpdate: (id: string, content: string) => Promise<void>;
// New
onUpdate: (id: string, aiResponse: object, contentText: string) => Promise<void>;
```

Reuse the serialization functions from `MedicationEditForm` (`serializeToAiResponse` and `serializeToContentText`) — either import them or duplicate the logic inline. The `handleSave` should call:
```ts
await onUpdate(entry.id, serializeToAiResponse(formData), serializeToContentText(formData));
```

**Medications page changes (Task 3):**

Update `handleUpdate` in `medications/page.tsx`:
```ts
// Old: uses updateMedicationEntry(id, content) — writes only content
// New: uses updateJournalAiResponse(id, aiResponse, contentText) — writes both
const handleUpdate = async (id: string, aiResponse: object, contentText: string) => {
  const previousEntries = [...medicationEntries];
  setMedicationEntries(entries =>
    entries.map(e => e.id === id ? { ...e, ai_response: aiResponse as JsonObject, content: contentText } : e)
  );
  try {
    await updateJournalAiResponse(id, aiResponse as JsonObject, contentText);
    setError(null);
  } catch (err) {
    console.error('Failed to update medication:', err);
    setMedicationEntries(previousEntries);
    setError('Failed to update medication. Please try again.');
  }
};
```

Update imports: replace `updateMedicationEntry` with `updateJournalAiResponse` from `journal-actions.ts`.

The `handleApprove` function can stay as-is — `approveMedicationEntry` just sets status and doesn't touch content.

### Architecture Compliance

- **Auth**: No Supabase Auth. Persona IDs are strings — do not add auth checks.
- **State**: Zustand for client state. Use atomic selectors (`useUserStore((s) => s.personaId)`).
- **Supabase**: Client-side `createClient` is correct for this client component page.
- **Styling**: Tailwind with `calm-*` tokens. Do NOT use `bg-calm-primary` (undefined). Touch targets >= 44px.
- **Glass Box Status**: Display "Added" in patient UI; persist as `approved` in DB.

### Library / Framework Requirements

- No new dependencies required
- Reuse existing `updateJournalAiResponse` server action from `journal-actions.ts`
- Reuse existing serialization pattern from `MedicationEditForm` if helpful

### File Structure Requirements

Files to modify (all paths from `src/`):

| File | Change |
|---|---|
| `components/patient/medication-glass-box.tsx` | Read from `ai_response` instead of `content`; update save to produce both `ai_response` + `contentText` |
| `app/(patient)/medications/page.tsx` | Switch `handleUpdate` to call `updateJournalAiResponse`; update import |
| `__tests__/medication-glass-box.test.tsx` | Update tests for `ai_response`-based rendering and new `onUpdate` signature |

No new files needed.

### Testing Requirements

- Component tests for `MedicationGlassBox` rendering from `ai_response`
- Test fallback rendering from `content` JSON for legacy entries
- Test fallback rendering from plain text `content`
- Test edit form populates from `ai_response` data
- Test save calls `onUpdate` with both `aiResponse` object and `contentText` string
- **Manual UI testing required** (project-context Rule 4): spin up browser and visually inspect `/medications` page

### Previous Story Intelligence

- **Story 7.7** (Appointment Form Enhancements): Updated the parallel `AppointmentGlassBox` component to also use `ai_response`. Established the pattern of backward-compatible field reading (`Address` with `Location` fallback). Follow the same approach for medication data extraction.
- **Story 7.4** (Immunisation Records): Added a new Glass Box type. Confirmed that `detectAiResponseShape()` in `glass-box-card.tsx` uses `_intent` field first, then field-sniffing fallback. The medications page already correctly uses `_intent` for filtering.
- **Story 6.7** (State Management Refactor): Optimistic UI pattern with rollback. The medications page already follows this pattern — preserve it when updating `handleUpdate`.
- **Story 3.3** (Medication Record Glass Box): Original creation of `MedicationGlassBox`. It was built before `ai_response` was the primary data source, which is why it reads from `content`.

### Git Intelligence

Recent commits show Epic 7 stories completed in sequence. The appointment form enhancement (Story 7.7) is the closest precedent — it solved the same class of problem for `AppointmentGlassBox` (reading from `content` instead of `ai_response`). Key patterns from that story:
- Both view and edit modes read from `ai_response`
- Edit saves via `updateJournalAiResponse` (writes both columns)
- Legacy entries get backward-compatible field reading

### Project Structure Notes

- All medication components are in standard locations per project structure
- No new files needed — this is a data source fix for existing files
- The two parallel renderer systems (legacy `MedicationGlassBox` + newer `GlassBoxCard/SafeMedicationRender`) should ideally be consolidated, but that is out of scope. This story ensures both read from the same data source.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 7.8]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Data Architecture]
- [Source: `_bmad-output/project-context.md`#Rule 2 Styling, #Rule 4 Manual UI Testing, #Rule 6 Glass Box Status]
- [Source: `src/components/patient/medication-glass-box.tsx`#parseContent (line 26)]
- [Source: `src/app/(patient)/medications/page.tsx`#handleUpdate (line 27)]
- [Source: `src/components/shared/glass-box/editors/medication-edit-form.tsx`#serializeToAiResponse]
- [Source: `src/app/actions/journal-actions.ts`#updateJournalAiResponse (line 355)]
- [Source: `src/components/shared/glass-box/glass-box-card.tsx`#SafeMedicationRender]
- [Source: `_bmad-output/implementation-artifacts/7-7-appointment-form-enhancements.md`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `pnpm exec vitest run src/__tests__/medication-glass-box.test.tsx src/__tests__/journal-entry-ai-medication.test.ts src/__tests__/journal-actions.test.ts`

### Completion Notes List

- Refactored medication selection into shared logic so `/medications` now includes legacy JSON-only entries, persisted `_intent` entries, and medication mentions consistently.
- Updated `MedicationGlassBox` to trust persisted `_intent`, preserve `_intent: 'medication'` on save, and avoid undefined `border-calm-primary`.
- Extended `backfillEntryIntent` to create `ai_response` from legacy JSON content when the row previously had no `ai_response`, eliminating the dead-end legacy path.
- Replaced the new `text-calm-primary` usage in `SafeMedicationRender` with supported `calm` tokens.
- Added tests for legacy medication selection, intent-preserving saves, and legacy backfill creation from JSON content.
- Manual browser verification is still required by project context and has not been recorded in this story.

### Change Log

- 2026-03-18: Implemented Story 7.8 medication history fix and review follow-up fixes.

### File List

- `src/lib/journal-entry-ai.ts` — Added shared medication selection and legacy JSON detection logic.
- `src/components/patient/medication-glass-box.tsx` — Updated medication extraction, save serialization, and border token usage.
- `src/app/(patient)/medications/page.tsx` — Switched to shared medication selection, stable Supabase client initialization, and parallel best-effort backfill.
- `src/app/actions/journal-actions.ts` — Extended `backfillEntryIntent` to synthesize `ai_response` from legacy JSON content.
- `src/components/shared/glass-box/glass-box-card.tsx` — Replaced undefined medication text token with supported styling.
- `src/__tests__/medication-glass-box.test.tsx` — Added coverage for persisted medication intent rendering and intent-preserving saves.
- `src/__tests__/journal-entry-ai-medication.test.ts` — Added selector coverage for legacy medication discovery and mention separation.
- `src/__tests__/journal-actions.test.ts` — Added coverage for legacy medication backfill from JSON content.
