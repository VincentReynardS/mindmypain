-- Migration: Create profiles table
-- Story 7.3: The My Detail Profile Page
-- Stores static demographics for patient personas

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,                              -- Simulated persona ID (e.g., 'sarah', 'michael')
  full_name TEXT,
  dob TEXT,                                         -- dd-mm-yyyy format (Story 7.1 convention)
  address_line_1 TEXT,
  address_line_2 TEXT,
  email TEXT,
  mobile_phone TEXT,
  home_phone TEXT,
  medicare_irn TEXT,
  medicare_valid_to TEXT,                            -- dd-mm-yyyy format
  phi_name TEXT,
  phi_number TEXT,
  is_organ_donor BOOLEAN DEFAULT false,
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_mobile TEXT,
  languages_spoken TEXT,                             -- Comma-separated or free text
  is_aboriginal BOOLEAN DEFAULT false,
  is_torres_strait_islander BOOLEAN DEFAULT false,
  allergies TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Reuse the existing update_updated_at_column() trigger
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security — permissive for prototype (same as journal_entries)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all reads for prototype"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow all inserts for prototype"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all updates for prototype"
  ON profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes for prototype"
  ON profiles FOR DELETE
  USING (true);

COMMENT ON TABLE profiles IS 'Patient demographic profiles. ID matches simulated persona IDs from useUserStore.';
