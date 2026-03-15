# Story 7.5: dedicated-journal-page-clear-input-functionality

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want a dedicated "Journal" page to view my raw journal reflections and a "Clear" button for the input box on the home page,
So that I can specifically review my thoughts without clutter and easily wipe my draft inputs.

## Acceptance Criteria

1. **Given** the main navigation and home page
2. **When** I want to see only my thoughts
3. **Then** I can navigate to a dedicated "Journal" page that displays only "Raw Journal" entries (excluding Meds/Scripts/Appointments)
4. **And** the input text box on the home page features a "Clear" button to quickly wipe the current text field.

## Tasks / Subtasks

- [x] Task 1: Add Clear Button to Journal Input
  - [x] Update `JournalInput` (or `ScribeControls`) on the home page to include a "Clear" button.
  - [x] The "Clear" button should reset the Zustand draft/recording store's transcript/text cleanly.
- [x] Task 2: Implement Dedicated "Journal" Page
  - [x] Decide on route naming (e.g., separating `/home` for the main input feed and `/journal` for pure journal reflections, or keeping `/journal` as home and adding `/reflections`). The standard interpretation is: Home becomes `/home` (with input and mixed feed), and the new "Journal" page is `/journal` (pure feed). Alternatively, add a filter/tab on the current home feed.
  - [x] Ensure the new pure list strictly filters for `_intent === 'journal'` (or similar intent representing purely raw thoughts).
- [x] Task 3: Adjust Navigation
  - [x] Make sure the dedicated page is accessible to the user (e.g. updating `bottom-nav.tsx` or adding it to a profile drawer/top menu). Be mindful of mobile viewport width if adding a 7th tab.

## Dev Notes

Ultimate context engine analysis completed - comprehensive developer guide created

### Technical Requirements
- **Clear Button**: Must interact directly with the `useJournalStore` or `useAudioStore` (whichever holds the current draft text) to clear the string without needing to submit.
- **Filtering Logic**: Must use the `_intent` field established in Story 7.4. Pure journal entries will have `_intent === 'journal'` or fallback to lack of specific shape if legacy.
- **Route Organization**: Address the ambiguity of "home page" vs "Journal page". Currently, `/journal` is the home page. You must split them cleanly. Recommended: move Home to `/home` and make `/journal` the filtered list, updating Next configs and layouts as needed.

### Architecture Compliance
- Use Shadcn UI for the new "Clear" button (e.g., variant="ghost", icon).
- Maintain Single Table architecture (`journal_entries`). No database migration needed.
- Adhere to the `app/(patient)` layout and routing.

### Library / Framework Requirements
- Next.js 14 App Router
- Zustand (for clearing text)
- Tailwind CSS & Shadcn UI

### File Structure Requirements
- `src/components/patient/journal-input.tsx` (or where the text box is)
- New or refactored page: e.g. `src/app/(patient)/home/page.tsx` and `src/app/(patient)/journal/page.tsx`
- `src/components/patient/bottom-nav.tsx` (for updating route links)

### Testing Requirements
- Test that clicking "Clear" immediately empties the text box and the underlying state.
- Test that the dedicated Journal page ONLY shows reflection logs (no medications, immunisations, scripts, or appointments).

### Previous Story Intelligence
- Story 7.4 introduced `_intent` on `ai_response` for reliable categorization, moving away from brittle field-sniffing. You MUST use `_intent` filtering for the new Journal-only list.
- Story 7.2 added auto-expanding inputs. Ensure adding a Clear button does not break the relative positioning or responsiveness of the input box on mobile.

### Latest Tech Information
Standard Next.js 14 App Router apply.

### Project Structure Notes
- Alignment with unified project structure (paths, modules, naming). Continue using the App Router `(patient)` layout.

### References
- [Source: `_bmad-output/planning-artifacts/epics.md`#Story 7.5]
- [Source: `_bmad-output/implementation-artifacts/7-4-immunisation-record-component-parser.md`]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Story note correction: use `npm test -- src/__tests__/story-7-5-journal-page-clear-input.test.ts` for Vitest targeted execution. `--runInBand` is a Jest flag and is invalid here.

### Completion Notes List

- **Task 1 — Clear Button**: Added a Clear button (X icon + "Clear" text) to `JournalInput` next to the existing Save Entry button. Uses ghost/bordered styling consistent with calm design tokens. Calls `setText("")` and `resetTranscribedText()` to clear both local state and audio store. Disabled when text is empty.
- **Task 2 — Dedicated Journal Page**: Moved the main input + all-entries view from `/journal` to a new `/home` route. Transformed `/journal` into a filtered view showing only journal reflections. Filtering uses authoritative `_intent` field with legacy field-sniffing fallback (matching `detectAiResponseShape` pattern from GlassBoxCard) to exclude medication, appointment, script, and immunisation entries. `raw_text` entries always included.
- **Task 3 — Navigation**: Updated bottom nav from 6 to 7 tabs: Home (`/home`), Journal (`/journal`), Appts, Meds, Scripts, Immun., Ask. Used shortened labels for mobile viewport width. Added `BookOpen` icon for Journal tab. Updated all login redirects (`persona-selector.tsx`, `kim/page.tsx`, `hilary/page.tsx`) from `/journal` to `/home`. Updated back-links in `my-detail-form.tsx` and `journal/archive/page.tsx`.
- **Tests**: 27 Story 7.5 tests added in `story-7-5-journal-page-clear-input.test.ts`. Updated 3 existing test files to reference new `/home` route. Review follow-up added focused filtering coverage in `journal-entry-ai.test.ts` and anchor assertions for `/home#entryId` navigation. Use `npm test -- src/__tests__/story-7-5-journal-page-clear-input.test.ts` for the targeted Vitest run. Lint clean.
- **Review Follow-up Fixes**: Tightened dedicated journal filtering through a shared `isJournalReflectionEntry()` helper so obvious medical raw drafts do not leak into `/journal`. Added DOM ids to feed cards so `/home#entryId` links can land on actual entries.
- **Manual UI Testing**: Verified in browser — Clear button works correctly (empties text, becomes disabled), Journal page filters correctly (no meds/scripts/appointments/immunisations), bottom nav renders all 7 tabs without overflow.

### File List

- `src/components/patient/journal-input.tsx` — Added Clear button with handleClear function
- `src/app/(patient)/home/page.tsx` — **NEW** — Home page with input + all entries (moved from /journal)
- `src/app/(patient)/journal/page.tsx` — Rewritten as filtered journal-only view
- `src/lib/journal-entry-ai.ts` — Added shared journal-only filtering helper for dedicated journal routing
- `src/app/(patient)/page.tsx` — Updated to redirect to /home
- `src/components/patient/bottom-nav.tsx` — Added Journal tab, updated Home href to /home, shortened labels
- `src/components/patient/persona-selector.tsx` — Updated redirect from /journal to /home
- `src/app/kim/page.tsx` — Updated redirect from /journal to /home
- `src/app/hilary/page.tsx` — Updated redirect from /journal to /home
- `src/app/(patient)/journal/archive/page.tsx` — Updated back-link from /journal to /home
- `src/components/patient/my-detail-form.tsx` — Updated back-link from /journal to /home
- `src/app/(patient)/medications/page.tsx` — Updated medication mention link from /journal to /home
- `src/__tests__/story-7-5-journal-page-clear-input.test.ts` — **NEW** — 27 tests for Story 7.5
- `src/__tests__/story-2-1-journal-input.test.ts` — Updated to reference home page
- `src/__tests__/story-2-2-daily-list-view.test.ts` — Updated to reference home page
- `src/__tests__/story-6-6-hilarys-login-ui.test.tsx` — Updated redirect assertions to /home
- `src/__tests__/patient-bottom-nav.test.tsx` — Added /home assertion
- `src/__tests__/journal-entry-ai.test.ts` — Added dedicated journal filtering coverage for processed and raw draft entries
- `src/components/patient/journal-entry-card.tsx` — Added entry id anchor for `/home#entryId` deep links
- `src/components/shared/glass-box/glass-box-card.tsx` — Added entry id anchor for `/home#entryId` deep links
- `_bmad-output/implementation-artifacts/7-5-dedicated-journal-page-clear-input-functionality.md` — Corrected the Vitest command note and recorded review follow-up fixes

### Change Log

- 2026-03-15: Implemented Story 7.5 — Added Clear button to journal input, created dedicated Journal page with intent-based filtering, split Home/Journal routes, updated navigation to 7 tabs
- 2026-03-15: Review follow-up — fixed dedicated journal raw-draft leakage, restored `/home#entryId` deep-link anchors, and corrected the Vitest targeted test command in story notes
