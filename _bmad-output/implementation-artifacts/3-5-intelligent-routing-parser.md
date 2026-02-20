# Story 3.5: Intelligent Routing Parser

Status: backlog

## Story

As a patient user,
I want the AI to automatically file my "messy dumps" into the correct journal tabs,
So that I don't have to manually fill out the complex forms.

## Acceptance Criteria

1. **Given** the user submits a voice/text entry
2. **When** the system parses the input
3. **Then** the `smart-parser.ts` logic should identify if the input represents an Appointment, Medication change, Script task, or general Agenda
4. **And** The AI should attempt to populate the corresponding JSON schema for that specific category
5. **And** The backend should set the `entry_type` correctly so it appears in the right tab's list view.

## Tasks / Subtasks

- [ ] Expand `smart-parser.ts` system prompt to route text input
- [ ] Map output structure to form definitions for new types
- [ ] Enhance schema validation rules
