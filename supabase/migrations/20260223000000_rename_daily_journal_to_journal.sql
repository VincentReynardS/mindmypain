-- Migration: Unify daily_journal → journal entry type
-- PostgreSQL cannot DROP individual enum values, so we recreate the type.

BEGIN;

-- 1. Migrate existing daily_journal rows to journal
UPDATE journal_entries SET entry_type = 'journal' WHERE entry_type = 'daily_journal';

-- 2. Migrate any stale physical_journal rows (if any)
UPDATE journal_entries SET entry_type = 'journal' WHERE entry_type = 'physical_journal';

-- 3. Recreate enum without daily_journal, physical_journal, agendas
ALTER TABLE journal_entries
  ALTER COLUMN entry_type TYPE text;

DROP TYPE IF EXISTS journal_entry_type;

CREATE TYPE journal_entry_type AS ENUM (
  'raw_text',
  'journal',
  'clinical_summary',
  'insight_card'
);

ALTER TABLE journal_entries
  ALTER COLUMN entry_type TYPE journal_entry_type
  USING entry_type::journal_entry_type;

COMMIT;
