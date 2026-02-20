# Story 3.4: Scripts and Referrals Table

Status: backlog

## Story

As a patient user,
I want to see a clear checklist of my pending prescriptions and referrals,
So that I can manage my pharmacy visits and admin tasks efficiently.

## Acceptance Criteria

1. **Given** the user navigates to the Scripts & Referrals tab
2. **When** the view loads
3. **Then** it should display a data table or checklist view
4. **And** The table should have columns/states for: Medication/Referral Name, To Be Filled, Filled (checkbox/toggle).

## Tasks / Subtasks

- [ ] Create `ScriptsTable` UI Component
- [ ] Implement checklist toggle states mapping to Supabase mutations
- [ ] Implement view for current active scripts vs archived
