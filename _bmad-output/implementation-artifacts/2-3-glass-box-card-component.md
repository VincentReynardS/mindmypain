# Story 2.3: The "Glass Box" Card Component

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want AI-generated content to appear in a clear, structured "Card" that I can edit,
so that I feel in control of what is saved to my record.

## Acceptance Criteria

1. **Given** the AI has processed an input
   **When** the result is returned (entry exists with `status: 'draft'` or `'pending_review'`)
   **Then** it should render as a "Glass Box" Card (Visually distinct from user text with specific styling like `calm-surface-raised` or border)

2. **Given** a Glass Box Card is displayed
   **When** the user views it
   **Then** it should have an "Edit" button that makes the content fields editable

3. **Given** a Glass Box Card is displayed
   **When** the user views it
   **Then** it should have an "Approve" button that saves the content to the DB with status `approved`

4. **Given** different entry types
   **When** rendering the card
   **Then** it should support different schemas/layouts:
   - `agendas`: Render as list (for now, simply parse line breaks or JSON if provided)
   - `clinical_summary`: Render as text block
   - `insight_card`: Render with distinct highlight

5. **Given** the user edits the content
   **When** they click "Approve"
   **Then** the updated content should be saved to Supabase and the status updated to `approved`

## Tasks / Subtasks

- [x] **Task 1: Create Server Actions**
  - [x] 1.1 Create `src/app/actions/journal-actions.ts`
  - [x] 1.2 Implement `updateJournalEntry(id, updates)` to handle content and status changes
  - [x] 1.3 Ensure `revalidatePath('/app/journal')` is called

- [x] **Task 2: Create GlassBoxCard Component**
  - [x] 2.1 Create `src/components/shared/glass-box/glass-box-card.tsx`
  - [x] 2.2 Implement display mode (read-only) and edit mode (textarea/inputs)
  - [x] 2.3 Style with "Calm" tokens - distinctly different from raw text entries (e.g., specific border or background nuance)
  - [x] 2.4 Add "Edit" and "Approve" buttons (using Shadcn Button with calm variants)

- [x] **Task 3: Implement Content Schemas**
  - [x] 3.1 Within `GlassBoxCard`, implement robust rendering for `raw_text` vs `agendas` vs `clinical_summary`
  - [x] 3.2 For `agendas`, if content is JSON, render structured list; if text, render text
  - [x] 3.3 Ensure "Edit" mode handles the underlying string content correctly

- [x] **Task 4: Integrate with Journal Entry List**
  - [x] 4.1 Update `src/components/patient/journal-entry-card.tsx` or `journal-entry-list.tsx`
  - [x] 4.2 If `entry_type` is NOT `raw_text`, render `GlassBoxCard` instead of simple snippet
  - [x] 4.3 Or allow `JournalEntryCard` to expand into `GlassBoxCard` on click

- [x] **Task 5: State Management Integration**
  - [x] 5.1 Connect "Approve" action to `journal-store` (optimistic update of status/content)
  - [x] 5.2 Call Server Action for persistence

- [x] **Task 6: Testing**
  - [x] 6.1 Component test `GlassBoxCard` (render, edit toggle, approve call)
  - [x] 6.2 Test schema rendering (text vs agenda)
  - [x] 6.3 Verify integration with Journal List

## Dev Notes

### Architecture Compliance

- **Server Actions**: ALL writes must go through `src/app/actions`. Do not use Supabase client directly for writes in components if possible, or consistent with established pattern. _(Correction: Architecture checks say "Server Actions: All data mutations... MUST happen via Server Actions")_
- **State Management**: Use `journal-store` for optimistic updates.
- **Micro-Library**: Use established Shadcn primitives where applicable (Button, Card, Textarea).

### UX Guidelines

- **Glass Box Metaphor**: The card should feel like a "living draft". Use "Suggestion Mode" styling cues (e.g., subtle highlighted background for AI text).
- **Edit Interaction**: Clicking "Edit" should ideally switch text to `Textarea` in place, or open a focused modal if content is long. For Mobile First, in-place expansion or full-screen sheet is preferred. Let's go with **in-place edit** for simplicity and flow.
- **Approve Interaction**: "Approve" should be the primary action (prominent button). "Edit" is secondary (`ghost` or `outline` variant).

### Technical Specifics

- **Database Types**: Use `JournalEntry` and `JournalEntryType` from `@/types/database`.
- **Content Storage**: `content` column is text. `ai_response` or `metadata` might hold JSON. check `types/database.ts`: `ai_response` is `Record<string, unknown>`.
- **Parsing logic**: Check if `ai_response` is populated. If so, use that for structured rendering (e.g. Agendas). If not, fallback to `content` string. _For this story, focus on `content` string editing, as the simple MVP._

### Previous Story Intelligence (from 2.2)

- `JournalEntryCard` exists in `src/components/patient/journal-entry-card.tsx`.
- `JournalEntryList` uses it.
- **Pattern**: `JournalEntryCard` is currently a tailored list item.
- **Recommendation**:
  - Rename/Refactor `JournalEntryCard` to be the "Summary/List Item" view.
  - Create `GlassBoxCard` as the "Detailed/Actionable" view.
  - In `JournalEntryList`, render `GlassBoxCard` directly if the entry is the "active" one, or perhaps render `GlassBoxCard` always for AI entries?
  - AC 2.3 says "render as a Glass Box Card". This suggests the list item _itself_ becomes the Glass Box Card for AI entries, or acts as one.
  - Given mobile screen real estate, a collapsed "Card" that expands on tap is good.
  - **Decision**: `JournalEntryCard` remains the list item. If `entry_type != raw_text`, it renders a `GlassBoxCard` _inside_ or _as_ the card content, with the buttons visible.

### File Structure Requirements

- `src/components/shared/glass-box/glass-box-card.tsx` (New)
- `src/app/actions/journal-actions.ts` (New)

### Testing Requirements

- Unit test `GlassBoxCard` states (view vs edit).
- Mock `updateJournalEntry` action in tests.

## Change Log

### Senior Developer Review (AI)

- **Status**: Approved with Fixes
- **Issues Found**: 1 High (Broken Schema Rendering), 3 Medium (Inefficient State, Fragile Tests, JSON Editing), 1 Low (Console Logs)
- **Fixes Applied**:
  - Implemented `SafeAgendaRender` to handle JSON content in `agendas` entries.
  - Implemented optimistic updates in `journal-store` and `JournalEntryList` to reduce API calls.
  - Silenced `console.error` in production components.
  - Updated tests to match current implementation.
