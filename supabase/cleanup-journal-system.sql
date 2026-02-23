-- cleanup-journal-system.sql
-- Standalone cleanup script (not a migration). Safe to run ad-hoc.

-- 1. Prune transient Guest entries older than 24 hours
DELETE FROM journal_entries
WHERE user_id LIKE 'guest_%'
AND created_at < (NOW() - interval '24 hours');

-- 2. Add index for faster "One per day" lookups
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries (user_id, (created_at::date));
