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
