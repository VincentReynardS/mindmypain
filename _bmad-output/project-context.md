# Project Context

This file contains critical rules and specific architectural deviations from standard web development practices. All AI agents (Developer, Reviewer, Architect) must adhere strictly to these constraints.

## Critical Rules

### 1. Prototype Authentication vs Real Auth

**DO NOT implemented standard session-based user authentication or security checks using `supabase.auth.getUser()`.**

- **Context:** MINDmyPAIN is an MVP prototype. It relies completely on a "Persona Guard" system and Zustand state for context switching between "Sarah" and "Michael".
- **Rule:** Never check `user.id` or `auth.uid()` from Supabase auth inside Server Actions or API routes to prevent IDOR vulnerabilities. The current setup intentionally allows open mutation based strictly on the raw row ID string to facilitate easy demonstration.
- **Why:** Injecting session auth checks will instantly break the application, returning "Unauthorized", as no actual users are ever securely logged in during the demo.

### 2. Styling

- Use Tailwind CSS with the predefined `calm` tokens (e.g., `text-calm-text`, `bg-calm-surface-raised`).
- Patient-facing action colors should follow the established interaction pattern:
  - `bg-calm-blue` for primary actions such as record, save, and send.
  - `bg-calm-green` for positive completion states such as add/approve/filled.
  - `bg-destructive` for destructive or stop actions.
  - `bg-calm-purple-soft` / `text-calm-purple` for processing or assistant-state indicators.
- Do not use `bg-calm-primary`, `text-calm-primary`, `border-calm-primary`, or `focus:ring-calm-primary` for new UI work unless the token is first added to `src/app/globals.css`. That token name is referenced in older code, but it is not currently defined and can make controls invisible.

### 3. Server Actions & Client Components

- When passing functions from Server Components to Client Components, ALWAYS wrap them in a strictly exported async server action rather than using inline async closures inside the Server Component.

### 4. Manual UI Testing Requirement

- **Context:** Passing unit tests and having correct code logic does not guarantee visual correctness or prevent runtime UI bugs (e.g., infinite render loops or invisible elements due to styling mismatches).
- **Rule:** When developing UI features or performing code reviews, AI agents MUST devise a manual test plan and use the browser subagent to spin up a browser and physically inspect the application. Look at what is actually displayed on the UI.
- **Why:** To ensure changes render correctly in the viewport, objects don't display as `[Object object]`, colors provide correct contrast, and interactions behave as expected in a live browser without relying solely on DOM inspection or Javascript execution tricks.

### 5. Git Commit and Branch Management

- **Context:** The developer prefers to manually control version control history and branching to maintain a clean and coherent timeline.
- **Rule:** AI agents MUST NEVER run `git commit`, `git checkout -b`, or create/modify branches automatically. You may run `git status` or `git diff` for situational awareness, but do not alter the repository state.
- **Why:** To prevent fragmented, unintended, or poorly described commits from cluttering the project's git history.

### 6. Glass Box Status Language

- **Rule:** In patient-facing UI, display the completed draft status as **"Added"**.
- **Rule:** Keep persisted/backend status value as **`approved`** (no schema or enum rename).
- **Why:** "Added" is friendlier UX copy, while `approved` remains the stable technical status used by existing data flows and logic.

### 7. Story Development Discipline

- **Context:** Multiple epics have seen developer agents forget to update story markdown checkboxes and the 'File List' after completing tasks, leaving auditability gaps.
- **Rule:** Before marking a story as complete or invoking the code-review process, the Developer agent MUST explicitly check off completed subtasks in the `[ ]` markdown boxes of the story file, AND fully populate the `### File List` section under the Dev Agent Record with all files modified during the story.
- **Why:** To maintain accurate traceability and unblock QA/Review processes.

### 8. Known Technical Debt

- **React Hook Form / Shadcn Forms Debt:** Story specs may call for React Hook Form + Zod + Shadcn form primitives as the preferred patient-form stack, but the current repo does not yet have `react-hook-form` installed and does not have a populated `src/components/ui` form layer for that pattern.
- **Rule:** Do not claim that a form story satisfies the React Hook Form / Shadcn requirement unless those dependencies and primitives are actually added and the form is migrated.
- **Current Expectation:** Small form fixes may continue using the existing local-state approach, but agents must record this as technical debt when a story requested the RHF/Shadcn stack and the implementation does not provide it.
