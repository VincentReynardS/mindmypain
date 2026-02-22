-- Migration: Create journal_entries table
-- Story 1.2: Database Migration & Seed Data
-- Architecture: Single Table with Status Enum (Decision 1)

-- Create custom ENUM types
CREATE TYPE journal_entry_status AS ENUM ('draft', 'pending_review', 'approved');
CREATE TYPE journal_entry_type AS ENUM ('raw_text', 'journal', 'clinical_summary', 'insight_card');

-- Create the journal_entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,                              -- Simulated User ID (no auth.uid())
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  content TEXT NOT NULL,                              -- Raw text or transcribed content
  transcription TEXT,                                 -- Whisper transcription output
  audio_url TEXT,                                     -- Path/URL to audio recording
  status journal_entry_status DEFAULT 'draft' NOT NULL,
  entry_type journal_entry_type DEFAULT 'raw_text' NOT NULL,
  ai_response JSONB,                                  -- AI-generated structured response
  tags TEXT[] DEFAULT '{}',                           -- AI-inferred tags
  metadata JSONB                                      -- Extensible metadata
);

-- Create index on user_id for persona-based queries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);

-- Create index on status for filtering draft/pending/approved
CREATE INDEX idx_journal_entries_status ON journal_entries(status);

-- Create index on created_at for chronological listing
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- Create composite index for common query: user's entries by date
CREATE INDEX idx_journal_entries_user_created ON journal_entries(user_id, created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Prototype/Workshop mode
-- In production, these would use auth.uid(). For the prototype,
-- RLS is enabled but policies are permissive to allow simulated personas.
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Allow all operations for prototype (no auth.uid() available)
CREATE POLICY "Allow all reads for prototype"
  ON journal_entries FOR SELECT
  USING (true);

CREATE POLICY "Allow all inserts for prototype"
  ON journal_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all updates for prototype"
  ON journal_entries FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes for prototype"
  ON journal_entries FOR DELETE
  USING (true);

-- Comment on table for documentation
COMMENT ON TABLE journal_entries IS 'Core journal table implementing the Glass Box pattern. Single-table design with status enum for draft/review/approved workflow.';
COMMENT ON COLUMN journal_entries.user_id IS 'Simulated user ID (sarah, michael, guest). Not linked to auth.uid() in prototype.';
COMMENT ON COLUMN journal_entries.status IS 'Workflow status: draft (initial), pending_review (wizard reviewing), approved (committed to record).';
COMMENT ON COLUMN journal_entries.entry_type IS 'Content type determining Glass Box card rendering.';
COMMENT ON COLUMN journal_entries.ai_response IS 'Structured AI output (agenda items, clinical summary, etc.) as JSON.';
COMMENT ON COLUMN journal_entries.tags IS 'AI-inferred tags like Medication, Sleep, Pain, extracted from multi-intent analysis.';
