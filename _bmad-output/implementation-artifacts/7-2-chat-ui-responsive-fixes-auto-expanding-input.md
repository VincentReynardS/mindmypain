# Story 7.2: Chat UI Responsive Fixes & Auto-expanding Input

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a patient user,
I want my typing space in Chat to expand as I write on mobile and the placeholder text to wrap,
so that I can compose longer entries without text getting cut off.

## Acceptance Criteria

1. **Given** the mobile chat interface
2. **When** I type multiple lines
3. **Then** the text area vertically expands to show the active text
4. **And** the default chat prompt wraps naturally on small screens instead of truncating

## Tasks / Subtasks

- [x] Task 1: Auto-Expanding Textarea
  - [x] Update `ChatInput` component to support auto-expanding height as the user types.
  - [x] Use a `useEffect` triggered by `text` changes to set the height dynamically (`el.style.height = "auto"`, then `scrollHeight`).
- [x] Task 2: Placeholder Text Wrapping
  - [x] Verified textarea has no `text-overflow` or `whitespace-nowrap` — placeholder wraps naturally by default.
- [x] Task 3: Max-Height Constrain
  - [x] Added `max-h-32 overflow-y-auto` to textarea className for internal scrolling when text exceeds max height.

## Dev Notes

### Technical Requirements
- Modifying the existing `src/components/patient/chat-input.tsx` is the primary action.
- The `textarea` currently has `rows={1}` and `resize-none`. Modify these in conjunction with the dynamic height logic.
- Ensure the input doesn't push the chat messages entirely off-screen when expanded.

### Architecture Compliance
- The component must retain its strict separation as a Client Component.
- This UI responsiveness task fits directly inside the patient layout boundary.

### Library / Framework Requirements
- Do not add new third-party dependencies if you can achieve this using standard React refs and Vanilla JS height assignment. Keep the footprint small!
- Next.js 14 and Tailwind CSS are already in use. Try to use Tailwind utilities (`max-h-x`, `overflow-y-auto`) to solve CSS requirements.

### File Structure Requirements
- `src/components/patient/chat-input.tsx` - this is where the `ChatInput` component lives.

### Testing Requirements
- Confirm that entering multiple line breaks expands the textarea.
- Confirm that typing beyond the max-height triggers internal scrolling.
- Run a browser window and visually inspect it on a simulated mobile viewport. 

### Project Context Reference
- **Rule 4**: Manual UI Testing Requirement. The developer agent MUST spin up the browser subagent to visually inspect the chat input expansion and placeholder wrapping.
- **Rule 7**: Story Development Discipline. Check off the `[ ]` subtasks and fill the `### File List` before completion.

### Previous Story Intelligence
- Story 6.5 updated the chat input to include native voice-to-text. Be extremely careful not to break the transcription piping logic (the `useEffect` that updates `text` state) when modifying the textarea's properties or event handlers.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.2]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- Added `resizeTextarea` callback + `useEffect` keyed on `text` to auto-expand the textarea
- Added `max-h-32 overflow-y-auto` to textarea className for max-height constraint with internal scrolling
- Placeholder wrapping works by default — no CSS changes needed
- Replaced source guardrail checks with runtime textarea auto-expand and resize-response tests in `chat-ui.test.tsx`
- Updated existing transcription pipe test to use `waitFor` for proper async handling with the new resize effect

### File List
- `src/components/patient/chat-input.tsx` — auto-expand logic + max-height classes
- `src/__tests__/chat-ui.test.tsx` — 4 new source guardrail tests + 1 test fix
