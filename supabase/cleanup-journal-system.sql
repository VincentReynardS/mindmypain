-- cleanup-journal-system.sql
-- 1. Migrate any remaining 'physical_journal' entries to 'daily_journal'
UPDATE journal_entries 
SET entry_type = 'daily_journal' 
WHERE entry_type = 'physical_journal';

-- 2. Prune transient Guest entries older than 24 hours (Optional, but keeps DB clean)
-- This removes orphaned guest sessions while keeping active ones.
DELETE FROM journal_entries 
WHERE user_id LIKE 'guest_%' 
AND created_at < (NOW() - interval '24 hours');

-- 3. Permanent Cleanup: Remove 'physical_journal' from the ENUM
-- Note: This requires recreating the type as Postgres doesn't support DROP VALUE
ALTER TYPE journal_entry_type RENAME TO journal_entry_type_old;

CREATE TYPE journal_entry_type AS ENUM (
  'raw_text', 
  'agendas', 
  'clinical_summary', 
  'insight_card', 
  'daily_journal'
);

ALTER TABLE journal_entries 
  ALTER COLUMN entry_type TYPE journal_entry_type 
  USING entry_type::text::journal_entry_type;

DROP TYPE journal_entry_type_old;

-- 4. Add index for faster "One per day" lookups
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries (user_id, (created_at::date));
