# 🧪 Manual Test Plan: Story 2.4 - Smart Parsing

## Pre-requisites

- App running (`npm run dev`)
- Logged in as a patient (e.g., "Sarah")
- `OPENAI_API_KEY` set in `.env` (restart server if you just added it)

## Test Cases

### 1. Happy Path (Messy Dump -> Agenda)

1.  **Action**: Create a new journal entry with messy text:
    > "My knee hurts a lot today since 2pm. I need to call Dr. Smith to ask about the refill. Also need to buy more ice packs."
2.  **Action**: Click the **✨ Organize** button on the new card.
3.  **Observation**:
    - [ ] Button changes to "Organizing..." with a spinner.
    - [ ] After 1-3s, the card automatically updates (flips) to the "Glass Box" view.
    - [ ] **Verify Content**:
      - **Clinical**: "Knee pain flared up (since 2pm)" (or similar)
      - **Admin**: "Call Dr. Smith for refill"
      - **Admin/Lifestyle**: "Buy ice packs"
    - [ ] **Verify Metadata**: Badge changes from nothing to **Agenda**.

### 2. UI State & Latency

1.  **Action**: Create another entry: "Just testing the speed."
2.  **Action**: Click **✨ Organize**.
3.  **Observation**:
    - [ ] The "Organizing..." state remains visible until the operation completes.
    - [ ] The UI does _not_ freeze (you can scroll or click other things).

### 3. Persistence

1.  **Action**: Refresh the page after Test Case 1 is complete.
2.  **Observation**:
    - [ ] The entry from Test Case 1 is _still_ displayed as an **Agenda** (Glass Box).
    - [ ] It does _not_ revert to raw text.

### 4. Integration with Story 2.3 (Edit & Approve)

1.  **Action**: On the generated Agenda from Test Case 1, click **Edit**.
2.  **Action**: Change "Buy ice packs" to "Buy ice cream". Click **Save**.
3.  **Observation**: The list updates to show "Buy ice cream".
4.  **Action**: Click **Approve**.
5.  **Observation**:
    - [ ] Status changes to **Approved** (Green).
    - [ ] Edit/Approve buttons disappear (or behave as per approved state).

### 5. Empty/Short Input (Edge Case)

1.  **Action**: Create an entry with very little context: "Hello".
2.  **Action**: Click **✨ Organize**.
3.  **Observation**:
    - [ ] AI should likely return an empty agenda or a single item depending on interpretation, but it **should not crash**.
    - [ ] Result should be valid JSON and render without white-screening.
