-- Migration: Rename physical_journal to daily_journal (alignment with user feedback)
-- Story 4.2: Journal Data Model Accuracy

-- Note: In a prototype, we'll just add the new value. 
-- In production, we might rename the value or the type.
ALTER TYPE journal_entry_type ADD VALUE 'daily_journal';
