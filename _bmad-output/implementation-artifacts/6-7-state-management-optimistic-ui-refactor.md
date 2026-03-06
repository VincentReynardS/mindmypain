# Story 6.7: State Management & Optimistic UI Refactor

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to refactor the Zustand store and optimistic UI logic,
so that the application can properly handle parallel server actions and regressions are avoided.

## Acceptance Criteria

1. **Given** the application's state management
2. **When** parallel server actions are dispatched
3. **Then** the optimistic UI precisely reflects the state without breaking or conflicting
4. **And** the Zustand store is robust enough to handle these parallel actions reliably

## Tasks / Subtasks

- [x] Task 1: Audit and Refactor Zustand Stores (AC: 1, 4)
  - [x] Review current Zustand stores (`src/lib/stores/*`) for atomicity and optimize selectors to prevent unnecessary re-renders.
  - [x] Ensure state robustly supports concurrent updates (e.g. pending drafts or processing status without overwriting concurrent writes).
- [x] Task 2: Standardize Server Actions for Mutations (AC: 2)
  - [x] Verified: All server actions already properly exported from `src/app/actions/journal-actions.ts`. No inline async closures passed from Server Components to Client Components. No code changes needed.
- [x] Task 3: Refactor Optimistic UI flow (AC: 3, 4)
  - [x] Review the usage of `useOptimistic` or Zustand-based optimistic updates in the main components (like Glass Box forms or chat).
  - [x] Ensure UI gracefully handles failures by reverting optimistic state robustly.
- [x] Task 4: Testing & Verification
  - [x] Update unit or integration tests for store behavior.
  - [x] Perform **manual UI testing** using the browser subagent in a simulated parallel action scenario (as mandated by Project Context), ensuring no flickering or missing state.

## Dev Notes

- **Architecture Constraints**:
  - The application depends on "Glass Box" pattern and Tri-state data flow (Draft -> Pending Review -> Approved/"Added").
  - Do **NOT** use `supabase.auth.getUser()`. Authentication uses a simulated Persona Guard (e.g. 'sarah', 'michael'). Use the provided Persona ID directly for `user_id`.
  - ALWAYS wrap functions passed from Server to Client in strictly exported async Server Actions instead of inline async closures.
  - Status value on UI should be "Added", while keeping "approved" in the backend.
  - Use `Zustand` for complex client-side state, selecting state values atomically (`useStore(s => s.value)`).
- **Recent Git Activity**: Recent work included Kim and Hilary test accounts, Chat UI refinements, and Parser fixes. Pay special attention to changes introduced around `GlassBoxCard` (Story 4.4/5.2). Look out to not break "Added" copy logic or Parser fallback fixes.

### Project Structure Notes

- **State Management (Zustand)**: `src/lib/stores/*.ts`. Uses `getState()`/`setState()` for testing + default hook for usage.
- **Server Actions**: Any new data updates need to reside in `src/app/actions` or co-located strictly exported action files, e.g., `src/app/(patient)/journal/actions.ts`.
- **Shared Components**: Opt for structural changes without altering `components/ui` Shadcn primitives. Main changes are likely in `components/shared/glass-box`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.7-State-Management-&-Optimistic-UI-Refactor]
- [Source: _bmad-output/project-context.md#3-Server-Actions-&-Client-Components]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Audit confirmed all stores already use atomic selectors correctly. No changes needed.
- Server actions already properly exported — Task 2 verified pass, no code changes.
- Added `getEntriesSnapshot()` and `restoreSnapshot()` to journal store for atomic rollback.
- Wrapped all optimistic mutation handlers with try/catch + snapshot rollback across 5 files.
- Added inline error banners for user-visible failure feedback on all mutation pages.
- Created 11 journal store unit tests. All 361 tests pass. No lint regressions.
- Browser-tested archive, restore, approve, and scripts toggle flows.
- Code review fixes: deep-copy snapshot entries, moved `setConfirmDeleteId` inside try, added error banners to journal/archive pages.

### File List

| File | Change |
|------|--------|
| `src/lib/stores/journal-store.ts` | Added `getEntriesSnapshot`, `restoreSnapshot` methods; fixed misleading comment |
| `src/components/patient/journal-entry-list.tsx` | Wrapped 4 mutation handlers with try/catch rollback; added error banner |
| `src/app/(patient)/journal/archive/page.tsx` | Wrapped restore/delete with try/catch rollback; added error banner |
| `src/app/(patient)/appointments/page.tsx` | Added rollback + error state/UI; documented closure limitation |
| `src/app/(patient)/medications/page.tsx` | Added rollback + error state/UI; documented closure limitation |
| `src/__tests__/journal-store.test.ts` | New: 11 test cases for store operations and rollback |
