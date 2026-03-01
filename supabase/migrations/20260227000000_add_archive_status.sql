-- Add 'archived' status to journal_entry_status enum
-- Uses the enum-recreation pattern (ALTER TYPE ... ADD VALUE cannot run inside a transaction)
-- Must drop the column default first since it depends on the enum type.

BEGIN;

ALTER TABLE journal_entries ALTER COLUMN status DROP DEFAULT;
ALTER TABLE journal_entries ALTER COLUMN status TYPE text;
DROP TYPE IF EXISTS journal_entry_status;
CREATE TYPE journal_entry_status AS ENUM ('draft', 'pending_review', 'approved', 'archived');
ALTER TABLE journal_entries ALTER COLUMN status TYPE journal_entry_status USING status::journal_entry_status;
ALTER TABLE journal_entries ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE journal_entries ADD COLUMN previous_status text;

COMMIT;
