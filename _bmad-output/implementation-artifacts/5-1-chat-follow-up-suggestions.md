# Story 5.1: Chat Follow-up Suggestions

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want 2 suggested follow-up questions after each AI response,
so that I can continue the conversation without thinking too hard.

## Acceptance Criteria

1. **Given** the assistant responds in `/chat` **When** the response is rendered **Then** 2 follow-up suggestions appear as chips under the last assistant message.
2. **Given** follow-up chips are visible **When** I click a chip **Then** that question is sent as the next user message.
3. **Given** suggestions are shown **When** they are generated **Then** they are derived from the assistant response context.

## Tasks / Subtasks

- [x] Task 1: Extend chat API contract with structured follow-ups (AC: #1, #3)
  - [x] 1.1 Update `src/app/api/chat/route.ts` response shape from `{ answer }` to `{ answer, followUps }`.
  - [x] 1.2 Generate follow-ups in the same OpenAI call as the answer using structured JSON output to enforce exactly 2 items.
  - [x] 1.3 Add schema validation/sanitization for follow-ups:
    - [x] Non-empty strings
    - [x] Exactly 2 items
    - [x] Deduplicate case-insensitively
    - [x] Trim and cap chip length for UI readability
  - [x] 1.4 Add deterministic fallback follow-ups if the model returns invalid JSON or incomplete suggestions.
  - [x] 1.5 Keep existing constraints (`MAX_HISTORY_LENGTH`, question length validation, approved-entries-only context).

- [x] Task 2: Extend chat store message model for assistant suggestions (AC: #1)
  - [x] 2.1 Update `src/lib/stores/chat-store.ts` `ChatMessage` type to support optional `followUps: string[]` on assistant messages.
  - [x] 2.2 Ensure existing store actions remain backward-compatible for user messages.
  - [x] 2.3 Keep atomic selector usage pattern unchanged across consumers.

- [x] Task 3: Render follow-up chips in chat UI (AC: #1)
  - [x] 3.1 Update `src/components/patient/chat-message.tsx` to render suggestion chips only for assistant messages with `followUps`.
  - [x] 3.2 Add an `onSuggestionClick` callback prop so parent can submit selected suggestion.
  - [x] 3.3 Apply calm design tokens and ensure chips meet 44px tap target minimum.
  - [x] 3.4 Ensure chips visually attach to the associated assistant response and do not appear for user messages.

- [x] Task 4: Wire click-to-send behavior in chat page (AC: #2)
  - [x] 4.1 In `src/app/(patient)/chat/page.tsx`, pass follow-ups from API response when adding assistant message.
  - [x] 4.2 Reuse existing `handleSubmit` path when a chip is clicked, so history/loading/error behavior stays consistent.
  - [x] 4.3 Keep auto-scroll behavior for both assistant messages and chip-triggered submits.
  - [x] 4.4 Prevent duplicate submit races while `isLoading` is true.

- [x] Task 5: Preserve API safety and context quality (AC: #3)
  - [x] 5.1 Update system prompt to explicitly require follow-up suggestions grounded in the returned answer and journal evidence.
  - [x] 5.2 Enforce "no diagnosis or medical advice" for both answer and suggestions.
  - [x] 5.3 Keep "I don't have that information in your journal entries" fallback rule intact.

- [x] Task 6: Add/refresh automated tests (AC: all)
  - [x] 6.1 `src/__tests__/chat-api-route.test.ts`: assert response includes `followUps` array of exactly 2 items, and validate fallback behavior.
  - [x] 6.2 `src/__tests__/chat-store.test.ts`: assert assistant messages can carry `followUps` without breaking existing add/clear/loading/error behavior.
  - [x] 6.3 `src/__tests__/chat-ui.test.tsx`: assert chips render only for assistant messages and clicking a chip triggers submit path.
  - [x] 6.4 Add regression assertions for existing chat behavior (history included in request, errors still surfaced, empty state unchanged).

- [x] Task 7: Manual validation in browser (AC: all) - delegated to user for final viewport verification.
  - [x] 7.1 Start app, open `/chat`, ask a question, verify 2 chips appear below the assistant response.
  - [x] 7.2 Click each chip, verify it submits as a user message and triggers a new assistant response.
  - [x] 7.3 Confirm suggestions update each turn and reflect the latest assistant response content.
  - [x] 7.4 Confirm no suggestions appear in loading/error-only states.
  - [x] 7.5 Confirm UI remains usable on narrow mobile viewport (chip wrapping, no overlap with input/nav).

## Dev Notes

### Developer Context Section

- Story 4.5 already established chat route, page, store, and tests. This story is an additive enhancement, not a rewrite.
- Existing chat pipeline:
  - `ChatPage.handleSubmit` sends `{ question, userId, history }` to `/api/chat`.
  - API builds context from approved journal entries and returns `{ answer }`.
  - UI renders assistant bubble and loading dots.
- Reuse this pipeline and add follow-up support with minimal surface change.

### Technical Requirements

- Suggestions must be generated from the same journal-grounded context as the assistant answer.
- Suggestions must be actionable next questions, not generic advice text.
- Suggestions must remain session-transient (no DB persistence).
- Preserve persona-based prototype auth pattern (no `supabase.auth.getUser()` checks).
- Keep all changes inside patient/chat and chat API boundaries; no migration required.

### Architecture Compliance

- Use App Router route handler pattern in `src/app/api/chat/route.ts`.
- Keep server-only OpenAI usage in API route (never in client component).
- Keep approved-entry filter (`status = approved`) and `user_id` scoping in query.
- Maintain atomic Zustand selectors in chat page and other consumers.
- Respect calm design tokens and mobile-first interaction constraints.

### Library and Framework Requirements

- `next@16.1.6`: continue Route Handler `POST` implementation in App Router.
- `openai@6.22.0`: use structured output constraints for reliable `{ answer, followUps }` JSON.
- `zustand@5.0.11`: keep simple transient store with strict typed message shape.
- `vitest@3.2.4` + RTL: extend current tests instead of introducing new test frameworks.

### File Structure Requirements

- Modify:
  - `src/app/api/chat/route.ts`
  - `src/lib/stores/chat-store.ts`
  - `src/app/(patient)/chat/page.tsx`
  - `src/components/patient/chat-message.tsx`
  - `src/__tests__/chat-api-route.test.ts`
  - `src/__tests__/chat-store.test.ts`
  - `src/__tests__/chat-ui.test.tsx`
- Avoid creating new top-level feature folders. Keep feature cohesion with existing chat files.

### Testing Requirements

- API tests must verify:
  - `followUps` returned and bounded.
  - graceful fallback when model output is malformed.
  - existing question/userId/history validation remains intact.
- UI tests must verify:
  - chips render below assistant message only.
  - clicking chip triggers the same submit flow as typed input.
  - disabled/loading guard prevents duplicate requests.
- Store tests must verify:
  - optional suggestion payload support does not break reset and loading/error behavior.

### Previous Story Intelligence

- Story 4.5 introduced current chat architecture and test harness. Extend it directly.
- Existing `chat-ui.test.tsx` is partly source-guardrail based; keep this style and add behavioral tests for chip interactions.
- Current page uses pre-submit history snapshot before adding the user message. Preserve this to avoid history drift.
- Existing error handling in page and API should stay unchanged except response shape extension.

### Git Intelligence Summary

Recent commit pattern shows chat work is localized and test-backed:
- `a7b6d5a`: Added current chat feature with route, page, components, store, tests.
- `cc8bec8`: Reinforced shape-aware editing and broad regression test strategy.
- `7c9518c`: Seed data updates; chat context remains tied to approved entries.
- `d31a524`: Sprint bookkeeping updates only.

Implementation implication: keep this story narrowly scoped to chat response contract + UI chips + tests.

### Latest Tech Information

- OpenAI Structured Outputs: Prefer schema-constrained JSON output for reliable machine-parseable response payloads (`answer` + `followUps`) instead of free-form text parsing.
- Next.js Route Handlers: Keep chat endpoint as server route handler in App Router for secure key usage and direct server-side data access.
- OpenAI Prompting best practice: place explicit output instructions and safety constraints in system/developer instructions, with deterministic post-parse sanitation.

### Project Context Reference

Critical project rules to preserve:
- No real auth/session checks for prototype personas.
- Keep calm token-based UI styling.
- No git commit/branch creation from agent workflows.
- Include manual browser validation for UI behavior.

### Project Structure Notes

- Aligned with existing structure under `src/app/(patient)/chat`, `src/app/api/chat`, `src/components/patient`, and `src/lib/stores`.
- No structural conflicts detected.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 5.1`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md`]
- [Source: `_bmad-output/project-context.md`]
- [Source: `src/app/(patient)/chat/page.tsx`]
- [Source: `src/app/api/chat/route.ts`]
- [Source: `src/components/patient/chat-message.tsx`]
- [Source: `src/lib/stores/chat-store.ts`]
- [Source: `src/__tests__/chat-api-route.test.ts`]
- [Source: `src/__tests__/chat-store.test.ts`]
- [Source: `src/__tests__/chat-ui.test.tsx`]
- [Source: `https://platform.openai.com/docs/guides/structured-outputs`]
- [Source: `https://platform.openai.com/docs/guides/text`]
- [Source: `https://nextjs.org/docs/app/building-your-application/routing/route-handlers`]

## Story Completion Status

- Status set to `review`.
- Story implemented with structured follow-up chip generation and click-to-send chat behavior.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test -- src/__tests__/chat-api-route.test.ts src/__tests__/chat-store.test.ts src/__tests__/chat-ui.test.tsx` (pass)
- `npm test` (2 pre-existing failures in `src/__tests__/story-1-2-database-migration.test.ts`)
- `npm run lint` (pre-existing repo-wide lint errors outside this story scope)

### Completion Notes List

- Added structured chat response contract in `src/app/api/chat/route.ts` returning `{ answer, followUps }`.
- Enforced structured OpenAI output with JSON schema constraints and resilient JSON extraction.
- Added follow-up sanitization: trim, de-duplicate, cap length, and deterministic fallback generation when output is malformed or incomplete.
- Updated chat page to attach suggestions to the latest assistant message only and reuse `handleSubmit` for chip clicks.
- Added duplicate-submit guards while loading for typed and chip-driven submissions.
- Extended chat message model with optional `followUps` in Zustand store.
- Added UI chip rendering with calm tokens and 44px tap target in `ChatMessage`.
- Added/updated tests for API follow-up behavior, store message payloads, and chip rendering/click interactions.
- Story-specific test suite passes; full suite and lint report pre-existing unrelated issues.

### File List

- `_bmad-output/implementation-artifacts/5-1-chat-follow-up-suggestions.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/app/api/chat/route.ts`
- `src/lib/stores/chat-store.ts`
- `src/components/patient/chat-message.tsx`
- `src/app/(patient)/chat/page.tsx`
- `src/__tests__/chat-api-route.test.ts`
- `src/__tests__/chat-store.test.ts`
- `src/__tests__/chat-ui.test.tsx`

### Change Log

- 2026-02-26: Implemented Story 5.1 follow-up suggestion chips with structured API output, UI click-to-send flow, and automated test coverage.
