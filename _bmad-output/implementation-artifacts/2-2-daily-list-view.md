# Story 2.2: Daily List View

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want to see my journal entries grouped by date,
so that I can review my health history chronologically.

## Acceptance Criteria

1. **Given** the user has existing journal entries
   **When** they scroll the main journal view
   **Then** entries should be grouped under Date Headers (e.g., "Today", "Yesterday", "February 17")

2. **Given** the journal view is loaded
   **When** entries exist for the current persona
   **Then** each entry should show its timestamp and a snippet of content (truncated to ~80 chars)

3. **Given** the journal view is loaded
   **When** entries of different types exist
   **Then** the list should support rendering both raw text entries AND Glass Box Card placeholders (visually distinct `entry_type` badges)

4. **Given** the user submits a new entry (via Story 2.1 input)
   **When** the entry is saved to Supabase
   **Then** it should appear at the top of the "Today" group without a full page reload (optimistic or realtime update)

5. **Given** the user is logged in as a persona (Sarah or Michael)
   **When** the journal list loads
   **Then** only entries belonging to that persona's `user_id` should be displayed

## Tasks / Subtasks

- [x] **Task 1: Create Journal Store** (AC: 1, 4, 5)
  - [x] 1.1 Create `src/lib/stores/journal-store.ts` (Zustand) to manage `entries: JournalEntry[]`, `isLoading`, `error`, and actions: `fetchEntries(userId)`, `addEntry(entry)`, `setEntries(entries[])`
  - [x] 1.2 Implement `fetchEntries` using Supabase client: `supabase.from('journal_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false })`
  - [x] 1.3 Export atomic selectors following project pattern

- [x] **Task 2: Date Grouping Utility** (AC: 1)
  - [x] 2.1 Create `src/lib/utils/date-helpers.ts` with `groupEntriesByDate(entries: JournalEntry[])` function
  - [x] 2.2 Return `Map<string, JournalEntry[]>` keyed by display label: "Today", "Yesterday", or formatted date (e.g., "February 17")
  - [x] 2.3 Use native `Intl.DateTimeFormat` — do NOT add date-fns or similar library

- [x] **Task 3: JournalEntryCard Component** (AC: 2, 3)
  - [x] 3.1 Create `src/components/patient/journal-entry-card.tsx`
  - [x] 3.2 Display: timestamp (HH:mm format), content snippet (truncated ~80 chars with ellipsis), entry_type badge
  - [x] 3.3 Style with Calm tokens: `bg-calm-surface-raised`, `text-calm-text`, `text-calm-text-muted` for timestamp
  - [x] 3.4 Use `rounded-lg`, generous padding, `transition-duration-calm` on hover
  - [x] 3.5 Visually distinguish `entry_type` using subtle badge: `raw_text` -> no badge, `agendas` -> calm-purple-soft badge, `clinical_summary` -> calm-green-soft badge, `insight_card` -> calm-blue-soft badge

- [x] **Task 4: DateGroupHeader Component** (AC: 1)
  - [x] 4.1 Create `src/components/patient/date-group-header.tsx`
  - [x] 4.2 Sticky date header with `text-calm-text-muted`, `text-sm`, `font-medium`
  - [x] 4.3 Semi-transparent background on scroll for readability

- [x] **Task 5: JournalEntryList Component** (AC: 1, 2, 3, 5)
  - [x] 5.1 Create `src/components/patient/journal-entry-list.tsx`
  - [x] 5.2 Reads from `useJournalStore` entries, groups via `groupEntriesByDate`
  - [x] 5.3 Renders `DateGroupHeader` + list of `JournalEntryCard` per group
  - [x] 5.4 Shows loading skeleton while `isLoading` is true
  - [x] 5.5 Shows empty state: "No entries yet. Start by recording or typing above." with calm styling

- [x] **Task 6: Integrate into Journal Page** (AC: 1, 4, 5)
  - [x] 6.1 Modify `src/app/(patient)/journal/page.tsx` to include `JournalEntryList` below the existing input controls
  - [x] 6.2 Add `useEffect` to fetch entries on mount using the persona's `user_id` from `useUserStore`
  - [x] 6.3 After Story 2.1 text submission, add new entry to journal store (optimistic insert)
  - [x] 6.4 Maintain `"use client"` directive (already present)

- [x] **Task 7: Testing** (AC: all)
  - [x] 7.1 Unit test `groupEntriesByDate` utility with edge cases (today, yesterday, older dates, empty array)
  - [x] 7.2 Unit test `useJournalStore` actions and selectors
  - [x] 7.3 Component test `JournalEntryCard` renders timestamp, snippet, and badge correctly
  - [x] 7.4 Component test `JournalEntryList` renders grouped entries and empty state
  - [x] 7.5 Ensure all existing tests (92) continue passing -- zero regressions

## Dev Notes

- **Architecture Compliance**:
  - Use **Zustand** store at `src/lib/stores/journal-store.ts` — follow `useUserStore` pattern: `create<State>()(...)` with atomic selectors
  - Use **Supabase Browser Client** from `@/lib/supabase/client` (`createClient()`) for data fetching in client components
  - Use `Database['public']['Tables']['journal_entries']['Row']` type (aliased as `JournalEntry` in `@/types/database`)
  - The `journal_entries` table has columns: `id`, `user_id`, `created_at`, `updated_at`, `content`, `transcription`, `audio_url`, `status` (draft/pending_review/approved), `entry_type` (raw_text/agendas/clinical_summary/insight_card), `ai_response`, `tags`, `metadata`
  - **DO NOT** use Server Components for the journal page — it is already `"use client"` and must remain so (it integrates with audio recording Zustand stores)

- **UX Guidelines**:
  - **"Calm" Aesthetic**: Use design tokens from `globals.css` — `calm-surface`, `calm-surface-raised`, `calm-text`, `calm-text-muted`
  - **Progressive Disclosure**: Show content snippets only; full details come in Story 2.3 (Glass Box Card)
  - **Touch Targets**: All tappable areas ≥44px (`--spacing-touch-target: 2.75rem`)
  - **Date Headers**: Use friendly labels ("Today", "Yesterday") not raw ISO dates — mirrors the physical journal structure
  - **Loading State**: Use skeleton loaders matching the calm aesthetic (no harsh spinners)

- **Anti-Patterns to AVOID**:
  - ❌ `const store = useJournalStore()` — causes unnecessary re-renders. Use atomic selectors: `useJournalStore(s => s.entries)`
  - ❌ Installing `date-fns`, `moment`, or `dayjs` — use native `Intl.DateTimeFormat` and `Date` APIs
  - ❌ Creating a `useEffect` that fetches data on every render — fetch once on mount with dependency on `personaId`
  - ❌ Using Server Components or `page.tsx` as Server Component — the page is `"use client"` because it shares state with audio stores
  - ❌ Fetching ALL entries regardless of user — MUST filter by `user_id` matching current persona

- **Integration with Story 2.1**:
  - The journal page already has `JournalInput`, `ScribeControls`, and `AudioVisualizer`
  - New `JournalEntryList` goes BELOW these existing components in the page layout
  - When a new entry is created (future: submit button), it should be appended to the journal store optimistically
  - For now, focus on displaying existing seed data entries — the "submit and see" flow will be refined in Stories 2.4/2.5

- **Seed Data Context**:
  - Sarah has ≥5 approved entries (chronic pain history) — these should appear grouped by their `created_at` dates
  - Michael has ≥5 approved entries (anxiety-related) — different persona, different entries
  - Seed entries have `status: 'approved'` and various `entry_type` values

### Project Structure Notes

- **New Files**:
  - `src/lib/stores/journal-store.ts` — Zustand store for journal entries
  - `src/lib/utils/date-helpers.ts` — Date grouping utility
  - `src/components/patient/journal-entry-card.tsx` — Individual entry card
  - `src/components/patient/date-group-header.tsx` — Date section header
  - `src/components/patient/journal-entry-list.tsx` — Composed list component
  - `src/__tests__/story-2-2-daily-list-view.test.ts` — All tests for this story

- **Modified Files**:
  - `src/app/(patient)/journal/page.tsx` — Add `JournalEntryList` below existing controls

- **Existing Patterns to Follow**:
  - Store pattern: see `src/lib/stores/audio-store.ts` and `src/lib/stores/user-store.ts`
  - Component pattern: see `src/components/patient/scribe-controls.tsx` (Calm tokens, aria-labels, touch targets)
  - Test pattern: see `src/__tests__/story-2-1-journal-input.test.ts` (vitest, describe blocks, static + behavioral)

### References

- [Epics: Story 2.2](_bmad-output/planning-artifacts/epics.md#story-22-daily-list-view)
- [Architecture: Data Model](_bmad-output/planning-artifacts/architecture.md#data-architecture)
- [Architecture: Project Structure](_bmad-output/planning-artifacts/architecture.md#project-structure--boundaries)
- [Architecture: State Management](_bmad-output/planning-artifacts/architecture.md#frontend-architecture)
- [UX: Progressive Disclosure](_bmad-output/planning-artifacts/ux-design-specification.md#transferable-ux-patterns)
- [UX: Calm Aesthetic](_bmad-output/planning-artifacts/ux-design-specification.md#design-system-foundation)
- [DB Types](_bmad-output/planning-artifacts/architecture.md#data-architecture) → `src/types/database.ts`

## Dev Agent Record

### Agent Model Used

Antigravity (Google DeepMind)

### Debug Log References

None - clean implementation with zero test failures.

### Completion Notes List

- Created Zustand journal store with fetchEntries (Supabase-backed), addEntry (optimistic), setEntries, clearEntries
- Created date-helpers utility with getDateLabel (Today/Yesterday/formatted), formatTime (HH:mm), truncateContent, groupEntriesByDate
- Created JournalEntryCard component with Calm tokens, transition animations, and entry_type badges
- Created DateGroupHeader with sticky positioning, backdrop blur, and semi-transparent background
- Created JournalEntryList composing DateGroupHeader + JournalEntryCard with loading skeleton, error state, and empty state
- Integrated JournalEntryList into journal page with useEffect-based fetching keyed on personaId
- All 138 tests pass (46 new for Story 2.2, 92 existing - zero regressions)

### Change Log

- 2026-02-19: Story 2.2 implemented - all 7 tasks complete, 46 tests added, all ACs satisfied

### File List

- [NEW] src/lib/stores/journal-store.ts
- [NEW] src/lib/utils/date-helpers.ts
- [NEW] src/components/patient/journal-entry-card.tsx
- [NEW] src/components/patient/date-group-header.tsx
- [NEW] src/components/patient/journal-entry-list.tsx
- [NEW] src/**tests**/story-2-2-daily-list-view.test.ts
- [MODIFIED] src/app/(patient)/journal/page.tsx
- [MODIFIED] \_bmad-output/implementation-artifacts/sprint-status.yaml
