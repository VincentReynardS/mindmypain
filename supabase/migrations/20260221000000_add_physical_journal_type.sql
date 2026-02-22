-- Migration: Add physical_journal to journal_entry_type ENUM
-- Story 4.2: Journal Data Model Accuracy

ALTER TYPE journal_entry_type ADD VALUE 'physical_journal';
