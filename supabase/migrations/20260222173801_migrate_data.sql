-- Migration to update existing entries from 'agendas' to 'journal'
-- This is split into a separate file because Postgres doesn't allow adding a new enum value 
-- and using it in the same transaction block (SQLSTATE 55P04).

UPDATE journal_entries SET entry_type = 'journal' WHERE entry_type::text = 'agendas';
