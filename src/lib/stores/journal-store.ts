/**
 * Journal Store - Manages journal entries for the current persona
 *
 * Architecture: Zustand store following the pattern:
 * - Export raw store creator for testing
 * - Export default hook for usage
 * - ALWAYS use atomic selectors to prevent re-renders
 *
 * @see architecture.md - State Management (Decision 4)
 * @see 2-2-daily-list-view.md - Task 1
 */

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/types/database";

export interface JournalState {
  entries: JournalEntry[];
  archivedEntries: JournalEntry[];
  isLoading: boolean;
  isLoadingArchived: boolean;
  error: string | null;
  fetchEntries: (userId: string) => Promise<void>;
  fetchArchivedEntries: (userId: string) => Promise<void>;
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  approveEntry: (id: string) => void;
  archiveEntry: (id: string) => void;
  restoreEntry: (id: string) => void;
  removeEntry: (id: string) => void;
  setEntries: (entries: JournalEntry[]) => void;
  clearEntries: () => void;
}

export const useJournalStore = create<JournalState>()((set, get) => ({
  entries: [],
  archivedEntries: [],
  isLoading: false,
  isLoadingArchived: false,
  error: null,

  fetchEntries: async (userId: string) => {
    // Prevent duplicate fetches
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .neq("status", "archived")
        .order("created_at", { ascending: false });

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      set({ entries: data ?? [], isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch entries",
        isLoading: false,
      });
    }
  },

  fetchArchivedEntries: async (userId: string) => {
    set({ isLoadingArchived: true });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "archived")
        .order("created_at", { ascending: false });

      if (error) {
        set({ isLoadingArchived: false });
        return;
      }

      set({ archivedEntries: data ?? [], isLoadingArchived: false });
    } catch {
      set({ isLoadingArchived: false });
    }
  },

  addEntry: (entry: JournalEntry) => {
    set((state) => ({
      entries: [entry, ...state.entries],
    }));
  },

  updateEntry: (id: string, updates: Partial<JournalEntry>) => {
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  approveEntry: (id: string) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, status: "approved" as const } : e
      ),
    }));
  },

  archiveEntry: (id: string) => {
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }));
  },

  restoreEntry: (id: string) => {
    set((state) => {
      const entry = state.archivedEntries.find((e) => e.id === id);
      return {
        archivedEntries: state.archivedEntries.filter((e) => e.id !== id),
        entries: entry
          ? [{ ...entry, status: entry.previous_status || "draft" } as JournalEntry, ...state.entries]
          : state.entries,
      };
    });
  },

  removeEntry: (id: string) => {
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
      archivedEntries: state.archivedEntries.filter((e) => e.id !== id),
    }));
  },

  setEntries: (entries: JournalEntry[]) => {
    set({ entries });
  },

  clearEntries: () => {
    set({ entries: [], archivedEntries: [], error: null });
  },
}));
