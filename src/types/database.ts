/**
 * Database Types - Auto-generated from Supabase schema
 *
 * IMPORTANT: In production, these types should be generated using:
 *   supabase gen types typescript --project-id <project-id> > src/types/database.ts
 *
 * For now, this defines the expected schema structure for development.
 * All AI agents MUST use Database['public']['Tables'][...] types.
 *
 * @see architecture.md - Data Architecture (Decision 1)
 */

export type JournalEntryStatus = "draft" | "pending_review" | "approved" | "archived";

export type JournalEntryType =
  | "raw_text"
  | "journal"
  | "insight_card";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export interface Database {
  public: {
    Tables: {
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          content: string;
          transcription: string | null;
          audio_url: string | null;
          status: JournalEntryStatus;
          entry_type: JournalEntryType;
          ai_response: JsonObject | null;
          tags: string[];
          metadata: JsonObject | null;
          previous_status: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          content: string;
          transcription?: string | null;
          audio_url?: string | null;
          status?: JournalEntryStatus;
          entry_type?: JournalEntryType;
          ai_response?: JsonObject | null;
          tags?: string[];
          metadata?: JsonObject | null;
          previous_status?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          content?: string;
          transcription?: string | null;
          audio_url?: string | null;
          status?: JournalEntryStatus;
          entry_type?: JournalEntryType;
          ai_response?: JsonObject | null;
          tags?: string[];
          metadata?: JsonObject | null;
          previous_status?: string | null;
        };
      };
    };
    Enums: {
      journal_entry_status: JournalEntryStatus;
      journal_entry_type: JournalEntryType;
    };
  };
}

/**
 * Convenience type aliases for common usage
 */
export type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
export type NewJournalEntry =
  Database["public"]["Tables"]["journal_entries"]["Insert"];
export type UpdateJournalEntry =
  Database["public"]["Tables"]["journal_entries"]["Update"];
