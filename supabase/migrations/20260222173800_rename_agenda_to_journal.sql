-- Migration to add 'journal' to journal_entry_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'journal_entry_type' AND e.enumlabel = 'journal') THEN
        ALTER TYPE journal_entry_type ADD VALUE 'journal';
    END IF;
END
$$;
