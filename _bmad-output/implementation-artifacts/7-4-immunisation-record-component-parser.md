# Story 7.4: immunisation-record-component-parser

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want a specific tab to log my Vaccines and Immunizations,
so that I can securely track brand names and dates given over the course of years.

## Acceptance Criteria

1. **Given** the bottom navigation and Parsers
2. **When** I tap "Immunisation" (or AI parses an immunization note)
3. **Then** I am presented with a `ImmunisationGlassBox`
4. **And** it requests explicit fields: Vaccine Name, Date Given (`dd-mm-yyyy`), and Brand Name
5. **And** the smart parser accurately routes and structures this data

## Tasks / Subtasks

- [x] Task 1: Create Immunisation Tab and Navigation
  - [x] Add "Immunisation" to the bottom navigation bar.
  - [x] Create route `/app/immunisations` (or similar) to list immunization records.
- [x] Task 2: Create `ImmunisationGlassBox` Component
  - [x] Build the `ImmunisationGlassBox` following the existing Glass Box patterns for editing structured data.
  - [x] Include explicit fields: Vaccine Name, Date Given (`dd-mm-yyyy`), and Brand Name.
  - [x] Ensure date inputs enforce the `dd-mm-yyyy` format standard.
- [x] Task 3: Update Smart Parser
  - [x] Update `smart-parser.ts` to recognize immunization-related voice/text inputs.
  - [x] Map parsed data to the `IMMUNISATION` entry type (or similar new enum value if needed).
  - [x] Extract Vaccine Name, Brand Name, and computationally resolve given dates into `dd-mm-yyyy`.
- [x] Task 4: Database Model Update (if required)
  - [x] Not required — existing architecture uses `entry_type: 'journal'` with ai_response shape detection. No DB enum change needed.
- [x] Task 5: Replace brittle field-sniffing with `_intent` persistence
  - [x] Store classified intent as `_intent` field inside `ai_response` at parse time in `processJournalEntry`.
  - [x] Update `detectAiResponseShape`, `getDynamicBadge`, and render chain in `glass-box-card.tsx` to check `_intent` first, falling back to field-sniffing for legacy entries.
  - [x] Update all page filters (medications, appointments, scripts, immunisations) to check `_intent` first with legacy fallback.
  - [x] Add `backfillEntryIntent` server action for on-the-fly migration of legacy entries without `_intent`.
  - [x] Preserve `_intent` in `updateJournalAiResponse` when edit forms save.

## Dev Notes

Ultimate context engine analysis completed - comprehensive developer guide created

### Technical Requirements
- Implement the `ImmunisationGlassBox` reusing existing Glass Box card wrapper/patterns for editing/approving.
- Explicit schema for immunizations: `vaccine_name`, `date_given`, `brand_name`.
- Ensure date parsing uses the global `dd-mm-yyyy` requirement (from Story 7.1).
- Smart Parser must confidently route to this new type and extract the fields from unstructured text (e.g., "Got my Pfizer covid booster today" -> type: IMMUNISATION, vaccine_name: "COVID-19 Booster", brand_name: "Pfizer", date_given: [today's date]).

### Architecture Compliance
- Use Shadcn UI for any form elements.
- Maintain Single Table architecture. The new record type goes into `journal_entries` table with a new `entry_type` (e.g., `IMMUNISATION`).
- `smart-parser.ts` must be extended in accordance to existing AI mapping patterns.
- AI schema must be updated for the new category.

### Library / Framework Requirements
- Next.js 14 App Router
- Tailwind CSS & Shadcn UI
- `@supabase/ssr`
- OpenAI (for parsing updates)

### File Structure Requirements
- `src/app/(patient)/immunisations/page.tsx`
- `src/components/patient/immunisation-glass-box.tsx`
- `src/lib/types/index.ts` (for schema update)
- `src/app/api/scribe/process/smart-parser.ts` (or wherever parser logic lives)

### Testing Requirements
- Test navigation to the new tab.
- Test manual entry creation in the Glass Box.
- Test the Smart Parser with mock texts (e.g., "Flu shot caught yesterday") and verify correct JSON extraction.

### Previous Story Intelligence
- Story 7.1 strictly formalized all date formats to `dd-mm-yyyy`. Ensure the `date_given` field uses this logic implicitly.
- Story 7.2 improved mobile chat responsiveness, indicating a high standard for text inputs on mobile. Ensure any manual data entry fields in the `ImmunisationGlassBox` look good on mobile devices without horizontal scrolling.

### Latest Tech Information
No new external libraries are introduced. Standard Next.js 14 App Router + Shadcn + `@supabase/ssr` applies.

### Project Structure Notes
- Alignment with unified project structure (paths, modules, naming). Continue using the App Router `(patient)` layout.
- The entry type will likely require an update to the Supabase `journal_entry_type` Enum (if hardcoded in DB) and the corresponding application TypeScript definitions.

### References
- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 7.4]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Data Architecture]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Immunisation entries with `Brand Name` (e.g. "Pfizer") were misidentified as medication by the field-sniffing shape detection, since both schemas share the `Brand Name` key. Root cause: the UI was re-inferring intent from ai_response fields instead of trusting the AI classification. Resolved by Task 5.

### Completion Notes List

- **Task 1:** Added Immunisation tab with Syringe icon to bottom nav (`bottom-nav.tsx`). Created `/immunisations` route page with loading/empty states, optimistic updates, and GlassBoxCard rendering.
- **Task 2:** Integrated immunisation into the unified GlassBoxCard architecture — added shape detection (`Vaccine Name` field), teal badge, `SafeImmunisationRender` inline renderer, `ImmunisationEditForm` structured editor, and edit mode dispatch. Added `Date Given` to `DATE_FIELDS` set.
- **Task 3:** Extended `classifyIntent` with `'immunisation'` category. Added `ImmunisationResponseSchema` (Zod) and `parseImmunisation()` function. Added `case 'immunisation'` to `processJournalEntry` switch. Added `updateImmunisationEntry`/`approveImmunisationEntry` server actions. Added `/immunisations` to all revalidation paths.
- **Task 4:** Skipped — existing architecture uses `entry_type: 'journal'` with ai_response shape detection for all parsed entry types.
- **Task 5:** Replaced brittle field-sniffing with `_intent` persistence. `processJournalEntry` now stores `_intent` in `ai_response` at parse time. `detectAiResponseShape`, `getDynamicBadge`, the render chain, and all page filters check `_intent` first, falling back to field-sniffing for legacy entries. Added `backfillEntryIntent` server action for on-the-fly migration. `updateJournalAiResponse` preserves `_intent` across edits. This fixes the `Brand Name` collision between immunisation and medication schemas.

### Change Log

- 2026-03-15: Implemented Story 7.4 — Immunisation Record Component & Parser
- 2026-03-15: Fixed Brand Name collision bug — replaced field-sniffing with `_intent` persistence across all entry types

### File List

- `src/components/patient/bottom-nav.tsx` (modified)
- `src/app/(patient)/immunisations/page.tsx` (new)
- `src/components/shared/glass-box/glass-box-card.tsx` (modified)
- `src/components/shared/glass-box/editors/immunisation-edit-form.tsx` (new)
- `src/lib/openai/smart-parser.ts` (modified)
- `src/app/actions/journal-actions.ts` (modified)
- `src/lib/openai/smart-parser.test.ts` (modified)
- `src/__tests__/immunisation-glass-box.test.tsx` (new)
- `src/__tests__/immunisation-edit-form.test.tsx` (new)
- `src/__tests__/immunisation-page.test.tsx` (new)
- `src/__tests__/patient-bottom-nav.test.tsx` (modified)
- `src/app/(patient)/appointments/page.tsx` (modified — `_intent` filter + backfill)
- `src/app/(patient)/medications/page.tsx` (modified — `_intent` filter + backfill)
- `src/app/(patient)/scripts/page.tsx` (modified — `_intent` filter + backfill)
