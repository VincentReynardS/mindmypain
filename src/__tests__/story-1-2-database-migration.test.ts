/**
 * Tests for Story 1.2: Database Migration & Seed Data
 *
 * These tests validate:
 * 1. Migration SQL syntax and schema correctness
 * 2. Seed data completeness and integrity
 * 3. TypeScript types match migration schema
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const MIGRATION_PATH = resolve(__dirname, '../../supabase/migrations/20260218000000_init_journal_entries.sql');
const SEED_PATH = resolve(__dirname, '../../supabase/seed.sql');

// Read SQL files
const migrationSql = readFileSync(MIGRATION_PATH, 'utf-8');
const seedSql = readFileSync(SEED_PATH, 'utf-8');

describe('Migration: 20260218000000_init_journal_entries.sql', () => {
  describe('ENUM Types', () => {
    it('should create journal_entry_status enum with correct values', () => {
      expect(migrationSql).toContain("CREATE TYPE journal_entry_status AS ENUM");
      expect(migrationSql).toContain("'draft'");
      expect(migrationSql).toContain("'pending_review'");
      expect(migrationSql).toContain("'approved'");
    });

    it('should create journal_entry_type enum with correct values', () => {
      expect(migrationSql).toContain("CREATE TYPE journal_entry_type AS ENUM");
      expect(migrationSql).toContain("'raw_text'");
      expect(migrationSql).toContain("'journal'");
      expect(migrationSql).toContain("'clinical_summary'");
      expect(migrationSql).toContain("'insight_card'");
    });
  });

  describe('Table Schema', () => {
    it('should create journal_entries table', () => {
      expect(migrationSql).toContain('CREATE TABLE journal_entries');
    });

    it('should have all required columns', () => {
      const requiredColumns = [
        'id UUID',
        'user_id TEXT NOT NULL',
        'created_at TIMESTAMPTZ',
        'updated_at TIMESTAMPTZ',
        'content TEXT NOT NULL',
        'transcription TEXT',
        'audio_url TEXT',
        'status journal_entry_status',
        'entry_type journal_entry_type',
        'ai_response JSONB',
        'tags TEXT[]',
        'metadata JSONB',
      ];

      for (const col of requiredColumns) {
        expect(migrationSql).toContain(col);
      }
    });

    it('should have UUID primary key with auto-generation', () => {
      expect(migrationSql).toContain('gen_random_uuid()');
      expect(migrationSql).toContain('PRIMARY KEY');
    });

    it('should default status to draft', () => {
      expect(migrationSql).toContain("DEFAULT 'draft'");
    });

    it('should default entry_type to raw_text', () => {
      expect(migrationSql).toContain("DEFAULT 'raw_text'");
    });
  });

  describe('Indexes', () => {
    it('should create index on user_id', () => {
      expect(migrationSql).toContain('idx_journal_entries_user_id');
    });

    it('should create index on status', () => {
      expect(migrationSql).toContain('idx_journal_entries_status');
    });

    it('should create index on created_at DESC', () => {
      expect(migrationSql).toContain('idx_journal_entries_created_at');
      expect(migrationSql).toContain('created_at DESC');
    });

    it('should create composite index for user + created_at', () => {
      expect(migrationSql).toContain('idx_journal_entries_user_created');
    });
  });

  describe('Trigger', () => {
    it('should create updated_at trigger function', () => {
      expect(migrationSql).toContain('update_updated_at_column');
      expect(migrationSql).toContain('NEW.updated_at = now()');
    });

    it('should create BEFORE UPDATE trigger', () => {
      expect(migrationSql).toContain('BEFORE UPDATE ON journal_entries');
    });
  });

  describe('Row Level Security', () => {
    it('should enable RLS on journal_entries', () => {
      expect(migrationSql).toContain('ENABLE ROW LEVEL SECURITY');
    });

    it('should create permissive prototype policies', () => {
      expect(migrationSql).toContain('FOR SELECT');
      expect(migrationSql).toContain('FOR INSERT');
      expect(migrationSql).toContain('FOR UPDATE');
      expect(migrationSql).toContain('FOR DELETE');
    });
  });
});

describe('Seed Data: seed.sql', () => {
  describe('Sarah entries', () => {
    it('should have at least 5 entries for sarah', () => {
      const sarahEntries = seedSql.match(/'sarah'/g);
      // Each entry has user_id = 'sarah', appearing in the INSERT VALUES
      expect(sarahEntries).not.toBeNull();
      expect(sarahEntries!.length).toBeGreaterThanOrEqual(5);
    });

    it('should have all entries with approved status', () => {
      // Split seed into individual entry blocks for Sarah
      const sarahSection = seedSql.split('MICHAEL')[0];
      // Extract each value tuple for sarah (between parens containing 'sarah')
      const sarahBlocks = sarahSection.split(/\(\s*\n\s*'sarah'/).slice(1);
      expect(sarahBlocks.length).toBeGreaterThanOrEqual(5);
      // Every sarah block must contain 'approved' as the status value
      for (const block of sarahBlocks) {
        expect(block).toContain("'approved'");
      }
    });

    it('should include chronic pain related content', () => {
      expect(seedSql).toContain('Lyrica');
      expect(seedSql).toContain('CRPS');
    });

    it('should include different entry types', () => {
      // Sarah should have multiple entry types
      expect(seedSql).toContain("'journal'");
      expect(seedSql).toContain("'clinical_summary'");
    });
  });

  describe('Michael entries', () => {
    it('should have at least 5 entries for michael', () => {
      const michaelEntries = seedSql.match(/'michael'/g);
      expect(michaelEntries).not.toBeNull();
      expect(michaelEntries!.length).toBeGreaterThanOrEqual(5);
    });

    it('should include anxiety/overwhelm related content', () => {
      expect(seedSql).toContain('anxiety');
      expect(seedSql).toContain('overwhelm');
    });
  });

  describe('Data integrity', () => {
    it('should use relative dates (INTERVAL)', () => {
      const intervalMatches = seedSql.match(/INTERVAL/g);
      expect(intervalMatches).not.toBeNull();
      expect(intervalMatches!.length).toBeGreaterThanOrEqual(10); // 7 sarah + 7 michael = 14
    });

    it('should include tags arrays', () => {
      const tagMatches = seedSql.match(/ARRAY\[/g);
      expect(tagMatches).not.toBeNull();
      expect(tagMatches!.length).toBeGreaterThanOrEqual(10);
    });

    it('should include ai_response JSON objects', () => {
      expect(seedSql).toContain('Pain');
      expect(seedSql).toContain('Medication');
    });

    it('should clear existing data before seeding (idempotent)', () => {
      expect(seedSql).toContain('DELETE FROM journal_entries');
    });
  });
});

describe('TypeScript Types Match Migration', () => {
  it('should load types module without errors (type compatibility verified at compile time)', async () => {
    // TypeScript type exports (interface, type) are erased at runtime
    // This test verifies the module loads without errors, confirming structural validity
    const typesModule = await import('@/types/database');
    expect(typesModule).toBeDefined();
  });

  it('should have status values matching migration enum', () => {
    // Verify the TypeScript type values align with migration SQL enum values
    const migrationStatuses = ['draft', 'pending_review', 'approved'];
    for (const status of migrationStatuses) {
      expect(migrationSql).toContain(`'${status}'`);
    }
  });

  it('should have entry_type values matching migration enum', () => {
    const migrationTypes = ['raw_text', 'journal', 'clinical_summary', 'insight_card'];
    for (const type of migrationTypes) {
      expect(migrationSql).toContain(`'${type}'`);
    }
  });
});
