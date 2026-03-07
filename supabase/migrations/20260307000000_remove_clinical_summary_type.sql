-- Remove clinical_summary from journal_entry_type enum
-- Follows the proven enum-recreation pattern from 20260223000000_rename_daily_journal_to_journal.sql

BEGIN;

-- 1. Convert any existing clinical_summary rows to journal
UPDATE journal_entries SET entry_type = 'journal' WHERE entry_type = 'clinical_summary';

-- 2. Drop the default (it references the enum type) and convert to text
ALTER TABLE journal_entries ALTER COLUMN entry_type DROP DEFAULT;
ALTER TABLE journal_entries ALTER COLUMN entry_type TYPE text;

-- 3. Drop and recreate the enum without clinical_summary
DROP TYPE IF EXISTS journal_entry_type;
CREATE TYPE journal_entry_type AS ENUM ('raw_text', 'journal', 'insight_card');

-- 4. Cast back to the new enum and restore the default
ALTER TABLE journal_entries ALTER COLUMN entry_type TYPE journal_entry_type USING entry_type::journal_entry_type;
ALTER TABLE journal_entries ALTER COLUMN entry_type SET DEFAULT 'raw_text';

COMMIT;
