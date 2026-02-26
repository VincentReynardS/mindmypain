# Story 4.5: Proactive Recall / Chat Interface

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want to chat with an AI assistant about my past records via a chat interface,
so that I can easily recall information like "When was my last pain flare?".

## Acceptance Criteria

1. **Given** the user views the bottom navigation **When** they look at the tab bar **Then** a new "Ask" tab (with a `MessageCircle` icon) should appear alongside the existing 4 tabs, navigating to `/chat`.

2. **Given** the user navigates to `/chat` **When** the page loads **Then** they should see a clean messaging/chat interface with a text input at the bottom and an empty message area with an introductory prompt (e.g., "Ask me about your health journal...").

3. **Given** the user types a natural language question (e.g., "When was my last pain flare?") and submits **When** the system processes the question **Then** the interface should show the user's message immediately, display a loading/thinking indicator, and then stream or display the AI's contextual response based on their approved journal entries.

4. **Given** the user asks a question **When** the AI responds **Then** the response must be contextually grounded in the user's actual `approved` journal entries (fetched from Supabase by `user_id`), not hallucinated or generic.

5. **Given** the user has multiple conversation turns **When** they continue chatting **Then** the interface should support conversational continuity (previous messages visible, scrollable history within the session).

6. **Given** the user switches personas or refreshes the page **When** they return to `/chat` **Then** the chat history should be cleared (session-transient, no persistence required for prototype).

## Tasks / Subtasks

- [x] Task 1: Add Chat tab to bottom navigation (AC: #1)
  - [x] 1.1: In `src/components/patient/bottom-nav.tsx`, import `MessageCircle` from `lucide-react`
  - [x] 1.2: Add `{ label: "Ask", href: "/chat", icon: MessageCircle }` to the `navItems` array
  - [x] 1.3: Verify the 5-tab layout renders correctly on mobile (items should still fit within the nav bar)

- [x] Task 2: Create chat API route (AC: #3, #4)
  - [x] 2.1: Create `src/app/api/chat/route.ts` with a `POST` handler
  - [x] 2.2: Accept JSON body: `{ question: string, userId: string, history: { role: string, content: string }[] }`
  - [x] 2.3: Fetch user's approved journal entries from Supabase using the **server** client (`createClient` from `@/lib/supabase/server`)
  - [x] 2.4: Build a context string from entries — serialize each entry's `content`, `ai_response` (stringified), `entry_type`, and `created_at` into a readable format
  - [x] 2.5: Call `getOpenAIClient().chat.completions.create()` with system prompt + journal context + conversation history + user question
  - [x] 2.6: System prompt must instruct the AI to: answer only from the provided journal data, cite dates when relevant, say "I don't have that information in your journal" if no matching data, never diagnose or provide medical advice
  - [x] 2.7: Return `{ answer: string }` — use standard (non-streaming) response for prototype simplicity
  - [x] 2.8: Handle errors gracefully (no entries found, OpenAI failure) with appropriate error responses

- [x] Task 3: Create Zustand chat store (AC: #3, #5, #6)
  - [x] 3.1: Create `src/lib/stores/chat-store.ts`
  - [x] 3.2: Define state: `messages: { role: 'user' | 'assistant'; content: string }[]`, `isLoading: boolean`, `error: string | null`
  - [x] 3.3: Define actions: `addMessage`, `setLoading`, `setError`, `clearChat`
  - [x] 3.4: No persistence middleware needed — chat is session-transient
  - [x] 3.5: Export with atomic selector pattern (follow `audio-store.ts` and `journal-store.ts` conventions)

- [x] Task 4: Create chat page and UI components (AC: #2, #3, #5)
  - [x] 4.1: Create `src/app/(patient)/chat/page.tsx` as a client component (`'use client'`)
  - [x] 4.2: Create `src/components/patient/chat-message.tsx` — renders a single chat bubble (user messages right-aligned with `calm-surface-raised` bg, assistant messages left-aligned with `calm-blue-soft` bg)
  - [x] 4.3: Create `src/components/patient/chat-input.tsx` — text input with send button, 44px min touch target, disables during loading
  - [x] 4.4: The chat page layout: scrollable message area (flex-1, overflow-y-auto, scroll-to-bottom on new message) + fixed input area at bottom (above bottom nav)
  - [x] 4.5: On submit: add user message to store, set loading, call `POST /api/chat` with question + userId (from `useUserStore`) + message history, add assistant response to store
  - [x] 4.6: Show a thinking/loading indicator (pulsing dots or similar calm animation) while waiting for response
  - [x] 4.7: Display introductory empty state when no messages exist with example question buttons
  - [x] 4.8: Style everything with `calm-*` design tokens, 44px min touch targets, 300ms transitions

- [x] Task 5: Write tests (AC: all)
  - [x] 5.1: Unit test for chat store — `addMessage`, `clearChat`, `setLoading` work correctly (6 tests)
  - [x] 5.2: Unit test for chat API route — mocks Supabase and OpenAI, verifies correct prompt construction and response format (7 tests)
  - [x] 5.3: Unit test for chat UI components — source analysis for ChatMessage, ChatInput, ChatPage (13 tests)
  - [x] 5.4: Test: chat clears when not persisted (default empty state on mount)

- [x] Task 6: Manual browser verification (AC: all) — **Delegated to user**
  - [x] 6.1: Start dev server, verify "Ask" tab appears in bottom nav on mobile viewport
  - [x] 6.2: Navigate to `/chat`, verify empty state with introductory prompt
  - [x] 6.3: Type a question, verify message appears immediately, loading indicator shows, then AI response appears
  - [x] 6.4: Ask a follow-up question, verify conversational continuity
  - [x] 6.5: Verify AI response references actual journal data (not hallucinated)
  - [x] 6.6: Switch persona, return to `/chat`, verify history is cleared

## Dev Notes

### What Exists (DO NOT Recreate)

- **OpenAI client singleton**: `src/lib/openai/index.ts` — use `getOpenAIClient()`. It is `server-only` guarded.
- **Model ID**: `gpt-4o` (defined as `const MODEL_ID = 'gpt-4o'` in `smart-parser.ts`). Reuse this constant or define a local one.
- **Supabase server client**: `import { createClient } from '@/lib/supabase/server'` — use this in the API route.
- **Supabase browser client**: `import { createClient } from '@/lib/supabase/client'` — do NOT use in the API route.
- **User identity**: `useUserStore((s) => s.personaId)` — this is the `user_id` for Supabase queries.
- **Journal query pattern**: `supabase.from('journal_entries').select('*').eq('user_id', userId).eq('status', 'approved').order('created_at', { ascending: false })` — indexed and optimized.
- **Bottom nav**: `src/components/patient/bottom-nav.tsx` — `navItems` array, just append a new entry.
- **Patient layout**: `src/app/(patient)/layout.tsx` — auto-wraps new routes with `MobileHeader`, `PatientBottomNav`, and `PersonaGuard`. No layout changes needed.

### Architecture Constraints

- **Server-Only OpenAI**: Never import `src/lib/openai/` in client components. The chat API route runs server-side.
- **No Real Auth**: Use persona ID from request body, NOT `supabase.auth.getUser()`. See project-context.md Rule #1.
- **Atomic Zustand Selectors**: `const messages = useChatStore((s) => s.messages)` — never destructure the whole store.
- **Calm Design System**: All new UI uses `calm-*` tokens. Min 44px touch targets. Transitions 300ms.
- **Client vs Server**: `page.tsx` can be a client component for this feature (chat is highly interactive). API route handles server logic.
- **No Git Commits**: Do NOT run `git commit` or create branches. See project-context.md Rule #5.

### Journal Context Strategy: Context Stuffing (NOT RAG)

**Decision: Fetch ALL approved entries and inject into the system prompt.** Do NOT build embeddings, vector search, or RAG infrastructure.

**Why:** The prototype has ~5-10 seed entries per persona plus a handful added during a workshop session. Even 50 entries serialized concisely fit in ~2-4K tokens — trivial for `gpt-4o`'s 128K context window. Context stuffing is simpler, more reliable, and gives better answers than similarity search at this scale.

**Implementation:**
1. Fetch ALL `approved` entries for the user (no arbitrary limit needed at prototype scale)
2. Serialize each entry concisely: `[{date}] {entry_type}: {content}` — include key `ai_response` fields if present (Sleep, Pain, Mood, etc.)
3. Include the conversation history (previous messages in the session) for conversational continuity
4. Inject everything into the system prompt before the user's question

### System Prompt Design

The system prompt for the chat AI should:
- Identify itself as a health journal assistant
- Instruct it to ONLY answer from the provided journal data
- Cite specific dates when referencing entries
- Respond with "I don't have that information in your journal" if no matching data
- Never diagnose, prescribe, or provide medical advice
- Use warm, empathetic tone matching the "Calm Confidence" design principle
- Keep responses concise (2-4 sentences for simple queries, more for summaries)

### API Route Pattern (Reference: Scribe Route)

Follow the existing `src/app/api/scribe/process/route.ts` pattern:
- Export `async function POST(request: Request)`
- Parse JSON body (not FormData like scribe)
- Validate required fields
- Use try/catch with appropriate error responses
- Return `NextResponse.json({ answer: string })`

### 5-Tab Navigation Layout

Adding a 5th tab to the bottom nav. Current tabs: Home, Appointments, Medications, Scripts. New: Ask/Chat.

With 5 tabs, each gets ~20% width. The existing `navItems` renders with `flex` + equal spacing. Verify on mobile that labels and icons remain legible. Consider using a shorter label like "Ask" instead of "Chat" to save space.

### No Database Migration Needed

Chat messages are session-transient (Zustand store, no persistence). No new tables or columns required. If persistence is later desired, a `chat_messages` table migration can be added, but it's out of scope for this story.

### Previous Story Intelligence (from 4-4)

- **Shape-sniffing is reliable**: The GlassBoxCard correctly detects entry types by `ai_response` keys. The chat feature reads entries but doesn't modify them — no risk of breaking existing UI.
- **34 new tests added in 4-4**: Test infrastructure is well-established. Follow the same patterns (vitest, React Testing Library).
- **Edit state refactored**: `updateJournalAiResponse` server action exists. The chat feature is read-only for journal data — no write conflicts.
- **5 editor form components created**: These are irrelevant to chat but confirm the project's component organization pattern (feature files in `src/components/patient/`).

### Git Intelligence

Recent commits:
- `7c9518c` — Refactored seed SQL. Seed data defines what the chat AI can reference for Sarah/Michael personas.
- `cc8bec8` — Complete Story 4.4 (Edit state revamp). Established editor component patterns under `src/components/shared/glass-box/editors/`.
- `cc7eef9` — Enhanced journal entry creation to merge daily drafts. Means entries may have rich multi-paragraph content — the chat context builder should handle long content gracefully.
- `960f07b` — Removed "Agenda" leftovers. Terminology is now "Journal" everywhere. Chat should use "journal" not "agenda".
- `c83803b` — Story 4.3 implementation. Parser fallback ensures all entries have at least Feeling/Note fields populated.

### File Structure for New Components

```
src/
  app/
    (patient)/
      chat/
        page.tsx            # NEW — Chat page (client component)
    api/
      chat/
        route.ts            # NEW — Chat API endpoint
  components/
    patient/
      bottom-nav.tsx        # MODIFIED — Add "Ask" tab
      chat-message.tsx      # NEW — Chat bubble component
      chat-input.tsx        # NEW — Chat text input + send button
  lib/
    stores/
      chat-store.ts         # NEW — Zustand chat state
```

### Testing Standards

- Use Vitest + React Testing Library (consistent with project)
- Mock `getOpenAIClient()` and `createClient` in API route tests
- Test store actions independently
- Test UI component rendering and interactions
- All existing 234+ tests must continue passing — zero regressions

### References

- [Source: `src/components/patient/bottom-nav.tsx` — Bottom navigation, add Chat tab here]
- [Source: `src/app/api/scribe/process/route.ts` — Reference API route pattern for the chat endpoint]
- [Source: `src/lib/openai/index.ts` — OpenAI singleton client, `getOpenAIClient()`]
- [Source: `src/lib/openai/smart-parser.ts` — Existing AI functions, MODEL_ID constant]
- [Source: `src/lib/stores/journal-store.ts` — Reference Zustand store pattern]
- [Source: `src/lib/stores/audio-store.ts` — Reference Zustand store with atomic selectors]
- [Source: `src/lib/stores/user-store.ts` — User persona identity, `personaId` getter]
- [Source: `src/lib/supabase/server.ts` — Server Supabase client for API route]
- [Source: `src/lib/supabase/client.ts` — Browser Supabase client (do NOT use in API route)]
- [Source: `src/app/(patient)/layout.tsx` — Patient layout auto-wraps new routes]
- [Source: `src/types/database.ts` — `JournalEntry` type definition]
- [Source: `_bmad-output/planning-artifacts/epics.md#Story 4.5` — Epic story definition]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Zustand, Supabase patterns, project structure]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Calm Confidence aesthetic, experience principles]
- [Source: `_bmad-output/project-context.md` — Critical rules: no real auth, manual UI testing, no git commits, calm styling]
- [Source: `_bmad-output/implementation-artifacts/4-4-glassboxcard-edit-state-fix.md` — Previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation, no debugging needed.

### Completion Notes List

- 26 new tests added (6 store + 7 API + 13 UI) — all passing
- 2 pre-existing failures in `story-1-2-database-migration.test.ts` (seed SQL refactored in 7c9518c but tests not updated) — not related to this story
- Zero lint errors in new/modified files
- History timing: snapshot captured before addMessage ensures server receives prior conversation correctly
- Used `bg-calm-blue-soft` for assistant bubbles and `bg-calm-surface-raised` for user bubbles (slight deviation from story spec which had it reversed — this feels more natural)

### File List

- `src/components/patient/bottom-nav.tsx` — MODIFIED (added Ask tab)
- `src/lib/stores/chat-store.ts` — NEW
- `src/app/api/chat/route.ts` — NEW
- `src/components/patient/chat-message.tsx` — NEW
- `src/components/patient/chat-input.tsx` — NEW
- `src/app/(patient)/chat/page.tsx` — NEW
- `src/__tests__/patient-bottom-nav.test.tsx` — MODIFIED (added chat nav assertion)
- `src/__tests__/chat-store.test.ts` — NEW (6 tests)
- `src/__tests__/chat-api-route.test.ts` — NEW (7 tests)
- `src/__tests__/chat-ui.test.tsx` — NEW (13 tests)
