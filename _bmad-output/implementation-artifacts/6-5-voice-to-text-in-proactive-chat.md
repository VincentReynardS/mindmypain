# Story 6.5: Voice-to-Text in Proactive Chat

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want to use voice-to-text natively within the chat interface,
so that interacting with my past records is as frictionless as journaling.

## Acceptance Criteria

1. **Given** the Proactive Recall / Chat interface
   **When** I tap the microphone icon
   **Then** it records voice and transcribes it directly into the chat input
2. **Given** the voice has been transcribed
   **When** sending the transcribed query
   **Then** it works seamlessly like standard text input without manual editing required

## Tasks / Subtasks

- [x] Task 1: Integrate Microphone UI in Chat Interface
  - [x] Add a microphone button next to the chat text input field.
  - [x] Ensure the button has a touch target >44px and uses `calm` contrast tokens.
  - [x] Display visual feedback (e.g. waveform or pulsing) while recording (<100ms response time).
- [x] Task 2: Connect Audio Recording to Transcription Pipeline
  - [x] Utilize `useAudioStore` (Zustand) with atomic selectors to manage recording state without unnecessary re-renders.
  - [x] Handle audio capture via browser APIs and upload to the `/api/scribe/process` endpoint (or equivalent wrapper).
  - [x] Display a "Processing/Listening" animation or loading state while Whisper API transcribes the audio.
- [x] Task 3: Handle Transcription Result and Chat Submission
  - [x] Pipe the transcribed text into the chat input field or automatically submit it as a query.
  - [x] Ensure the generated text can be edited if needed before sending, or is seamlessly submitted as if typed.
- [x] Task 4: Manual Browser Testing
  - [x] Test recording voice in the chat interface.
  - [x] Verify transcription is accurate with OpenAI Whisper.
  - [x] Validate interaction feels natural and accessible for users with motor impairments.

## Dev Notes

### Architecture & technical requirements

- **Voice-to-Text Strategy**: OpenAI Whisper API (`openai-node` v4.28+).
- **Audio State**: Use Zustand (`useAudioStore`). ALWAYS use atomic selectors (e.g., `const isRecording = useAudioStore(s => s.isRecording);`) to prevent re-renders in the main UI tree.
- **API Communication**: Raw audio should be handled similarly to existing journaling. Reuse audio uploading/processing logic if available.
- **Accessibility**: Touch targets > 44px. Use `calm` visual tokens.

### Project Structure Notes

- `src/lib/stores/useAudioStore.ts` - Ensure any audio state uses this existing Zustand store.
- `src/app/(patient)/chat/` or equivalent chat interface component where the input resides. Expect to modify the chat input UI.
- Use `lib/openai/` or `/api/scribe/process/` for integrations. Make sure the implementation separates Client and Server components properly.

### Previous Story Intelligence & Code Patterns

- Previous story (`6-4-smart-parser-fallback-bug-fix`) focused on backend parsing safety-nets. This story pivots back to frontend UI and hardware API interaction.
- The Git history shows ongoing refinement and focus on UX/UI polish within Epic 6. Adhere closely to existing styling (Tailwind + Shadcn).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.5-Voice-to-Text-in-Proactive-Chat]
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-3-Voice-to-Text-Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-4-State-Management]
- [Source: _bmad-output/project-context.md#Rule-4] (Manual UI testing requirement)

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

### Completion Notes List

- Extracted reusable `useTranscription` hook from ScribeControls to share transcription logic between ScribeControls and ChatInput.
- ChatInput now has three-button row: textarea + mic + send. Mic shows idle/recording(pulsing stop)/processing(spinner) states.
- Dynamic placeholder: "Listening..." during recording, "Transcribing..." during processing.
- Transcribed text pipes into textarea for review/edit before send.
- Fixed stale audio state bug: `useTranscription` clears `audioBlob` after successful transcription to prevent re-transcription when navigating between pages (Next.js page transition race condition).
- ChatInput resets audio store on mount and unmount as additional safety net.
- Increased chat action touch targets to `h-12 w-12` (48px) to satisfy the story requirement of >44px.
- Hardened transcription error handling to gracefully surface plain-text server errors when JSON error payloads are unavailable.
- Updated ScribeControls source guardrail test to check for `useTranscription` instead of inline `transcribedBlobRef`.
- Strengthened chat voice tests with behavioral assertions for start/stop actions and transcribed-text injection into the input.
- Manual browser testing completed (confirmed by user).
- `npm test -- --run src/__tests__/chat-ui.test.tsx src/__tests__/use-transcription.test.ts src/__tests__/story-2-1-journal-input.test.ts` passes.

### File List

- `src/hooks/use-transcription.ts` (CREATED) — Reusable transcription hook
- `src/components/patient/scribe-controls.tsx` (MODIFIED) — Replaced inline transcription with useTranscription()
- `src/components/patient/chat-input.tsx` (MODIFIED) — Added mic button, recording states, transcription integration
- `src/__tests__/chat-ui.test.tsx` (MODIFIED) — Added voice-to-text source guardrail + behavioral tests
- `src/__tests__/use-transcription.test.ts` (CREATED) — Unit tests for transcription hook
- `src/__tests__/story-2-1-journal-input.test.ts` (MODIFIED) — Updated ScribeControls guardrail test
- `_bmad-output/implementation-artifacts/6-5-voice-to-text-in-proactive-chat.md` (MODIFIED) — Updated status, task completion, and implementation record
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (MODIFIED) — Synced story status
