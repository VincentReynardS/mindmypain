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
