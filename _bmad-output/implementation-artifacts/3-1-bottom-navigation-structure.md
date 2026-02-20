# Story 3.1: Bottom Navigation Structure

Status: backlog

## Story

As a patient user,
I want to navigate between different sections of my journal (Home, Appointment, Medication, Scripts & Referrals),
So that I can organize and find my health records logically.

## Acceptance Criteria

1. **Given** the user is viewing the `/app/(patient)` layout
2. **When** they look at the bottom of the screen
3. **Then** they should see a fixed tab bar with icons for: Home, Appointment, Medication, Scripts
4. **And** Tap interactions should route to respective views (`/app/journal`, `/app/appointments`, `/app/medications`, `/app/scripts`)

## Tasks / Subtasks

- [ ] Create BottomNavigation root component
- [ ] Connect tabs to Next.js router
- [ ] Ensure mobile-friendly styling according to constraints
- [ ] Implement layout shell integrating navigation
