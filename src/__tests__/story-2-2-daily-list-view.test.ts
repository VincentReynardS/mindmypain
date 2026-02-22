/**
 * Story 2.2: Daily List View - Tests
 *
 * Tests cover:
 * - Date helpers: getDateLabel, formatTime, truncateContent, groupEntriesByDate
 * - Journal store: state, actions, selectors
 * - JournalEntryCard: module export, Calm tokens, badge rendering
 * - DateGroupHeader: module export, sticky behavior, Calm tokens
 * - JournalEntryList: module export, integration with store, loading/empty states
 * - Journal page: JournalEntryList integration, persona-based fetching
 */

import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

import {
  getDateLabel,
  formatTime,
  truncateContent,
  groupEntriesByDate,
} from "@/lib/utils/date-helpers";
import { useJournalStore } from "@/lib/stores/journal-store";
import type { JournalEntry } from "@/types/database";

// Pre-load source files for static analysis tests
const journalEntryCardSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/journal-entry-card.tsx"),
  "utf-8"
);
const dateGroupHeaderSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/date-group-header.tsx"),
  "utf-8"
);
const journalEntryListSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/journal-entry-list.tsx"),
  "utf-8"
);
const journalPageSource = fs.readFileSync(
  path.resolve(__dirname, "../app/(patient)/journal/page.tsx"),
  "utf-8"
);

// Helper to create a mock JournalEntry
function createMockEntry(
  overrides: Partial<JournalEntry> = {}
): JournalEntry {
  return {
    id: crypto.randomUUID(),
    user_id: "sarah",
    content: "This is a test journal entry with some content",
    transcription: null,
    audio_url: null,
    status: "approved",
    entry_type: "raw_text",
    ai_response: null,
    tags: [],
    metadata: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("Story 2.2: Daily List View", () => {
  // -- Date Helpers --

  describe("getDateLabel", () => {
    it("should return 'Today' for today's date", () => {
      const today = new Date().toISOString();
      const dayName = new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(new Date());
      expect(getDateLabel(today)).toBe(`${dayName}, Today`);
    });

    it("should return 'Yesterday' for yesterday's date", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dayName = new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(yesterday);
      expect(getDateLabel(yesterday.toISOString())).toBe(`${dayName}, Yesterday`);
    });

    it("should return formatted date for older dates in same year", () => {
      const now = new Date();
      // Use a date guaranteed to be far from today/yesterday but in same year (10 days ago)
      const olderDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const label = getDateLabel(olderDate.toISOString());
      // Should contain a month name and day number (locale may vary order)
      expect(label).toMatch(/\d+/);
      expect(label).toMatch(/[A-Z][a-z]+/);
      // Same year should NOT include the year
      expect(label).not.toContain(String(now.getFullYear()));
    });

    it("should include year for dates in a different year", () => {
      const oldDate = new Date(2023, 5, 10);
      const label = getDateLabel(oldDate.toISOString());
      expect(label).toContain("2023");
    });
  });

  describe("formatTime", () => {
    it("should return time in HH:mm format", () => {
      // Create a date with known time
      const date = new Date(2024, 0, 1, 14, 30);
      const result = formatTime(date.toISOString());
      expect(result).toBe("14:30");
    });

    it("should zero-pad single digit hours and minutes", () => {
      const date = new Date(2024, 0, 1, 9, 5);
      const result = formatTime(date.toISOString());
      expect(result).toBe("09:05");
    });
  });

  describe("truncateContent", () => {
    it("should return full text if under max length", () => {
      expect(truncateContent("Short text")).toBe("Short text");
    });

    it("should truncate and add ellipsis when over max length", () => {
      const longText = "A".repeat(100);
      const result = truncateContent(longText, 80);
      expect(result.length).toBeLessThanOrEqual(83); // 80 + "..."
      expect(result).toContain("...");
    });

    it("should use default max length of 80", () => {
      const text81 = "B".repeat(81);
      const result = truncateContent(text81);
      expect(result).toContain("...");
    });

    it("should not truncate text at exactly max length", () => {
      const text80 = "C".repeat(80);
      expect(truncateContent(text80)).toBe(text80);
    });
  });

  describe("groupEntriesByDate", () => {
    it("should return empty array for empty entries", () => {
      expect(groupEntriesByDate([])).toEqual([]);
    });

    it("should group entries under 'Today' for today's entries", () => {
      const entries = [
        createMockEntry({ created_at: new Date().toISOString() }),
        createMockEntry({ created_at: new Date().toISOString() }),
      ];
      const groups = groupEntriesByDate(entries);
      expect(groups.length).toBe(1);
      const dayName = new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(new Date());
      expect(groups[0][0]).toBe(`${dayName}, Today`);
      expect(groups[0][1].length).toBe(2);
    });

    it("should create separate groups for different dates", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const entries = [
        createMockEntry({ created_at: today.toISOString() }),
        createMockEntry({ created_at: yesterday.toISOString() }),
      ];
      const groups = groupEntriesByDate(entries);
      expect(groups.length).toBe(2);
      const todayDayName = new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(new Date());
      const yesterdayDayName = new Intl.DateTimeFormat("en-AU", { weekday: "long" }).format(yesterday);
      expect(groups[0][0]).toBe(`${todayDayName}, Today`);
      expect(groups[1][0]).toBe(`${yesterdayDayName}, Yesterday`);
    });

    it("should preserve order within groups", () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 60000);
      const entry1 = createMockEntry({
        id: "first",
        created_at: now.toISOString(),
      });
      const entry2 = createMockEntry({
        id: "second",
        created_at: earlier.toISOString(),
      });

      const groups = groupEntriesByDate([entry1, entry2]);
      expect(groups[0][1][0].id).toBe("first");
      expect(groups[0][1][1].id).toBe("second");
    });
  });

  // -- Journal Store --

  describe("Journal store", () => {
    beforeEach(() => {
      useJournalStore.setState({
        entries: [],
        isLoading: false,
        error: null,
      });
    });

    it("should initialize with empty entries", () => {
      expect(useJournalStore.getState().entries).toEqual([]);
    });

    it("should initialize with isLoading false", () => {
      expect(useJournalStore.getState().isLoading).toBe(false);
    });

    it("should initialize with error null", () => {
      expect(useJournalStore.getState().error).toBeNull();
    });

    it("should set entries via setEntries", () => {
      const entries = [createMockEntry()];
      useJournalStore.getState().setEntries(entries);
      expect(useJournalStore.getState().entries).toEqual(entries);
    });

    it("should prepend entry via addEntry", () => {
      const existing = createMockEntry({ id: "old" });
      const newEntry = createMockEntry({ id: "new" });
      useJournalStore.setState({ entries: [existing] });

      useJournalStore.getState().addEntry(newEntry);

      const entries = useJournalStore.getState().entries;
      expect(entries.length).toBe(2);
      expect(entries[0].id).toBe("new");
      expect(entries[1].id).toBe("old");
    });

    it("should clear entries via clearEntries", () => {
      useJournalStore.setState({
        entries: [createMockEntry()],
        error: "some error",
      });

      useJournalStore.getState().clearEntries();

      expect(useJournalStore.getState().entries).toEqual([]);
      expect(useJournalStore.getState().error).toBeNull();
    });

    it("should export useJournalStore as a function (Zustand hook)", () => {
      expect(typeof useJournalStore).toBe("function");
    });
  });

  // -- JournalEntryCard component --

  describe("JournalEntryCard component", () => {
    it("should export JournalEntryCard as a named function", async () => {
      const mod = await import("@/components/patient/journal-entry-card");
      expect(mod.JournalEntryCard).toBeDefined();
      expect(typeof mod.JournalEntryCard).toBe("function");
    });

    it("should use Calm design tokens", () => {
      expect(journalEntryCardSource).toContain("bg-calm-surface-raised");
      expect(journalEntryCardSource).toContain("text-calm-text");
      expect(journalEntryCardSource).toContain("text-calm-text-muted");
    });

    it("should use transition-duration-calm for smooth interactions", () => {
      expect(journalEntryCardSource).toContain("transition-duration-calm");
    });

    it("should have min-h touch target for WCAG compliance", () => {
      expect(journalEntryCardSource).toContain("min-h-[2.75rem]");
    });

    it("should have badge config for each entry_type", () => {
      expect(journalEntryCardSource).toContain("raw_text");
      expect(journalEntryCardSource).toContain("journal");
      expect(journalEntryCardSource).toContain("clinical_summary");
      expect(journalEntryCardSource).toContain("insight_card");
    });

    it("should import formatTime and truncateContent from date-helpers", () => {
      expect(journalEntryCardSource).toContain("formatTime");
      expect(journalEntryCardSource).toContain("truncateContent");
      expect(journalEntryCardSource).toContain("@/lib/utils/date-helpers");
    });

    it("should have an aria-label for accessibility", () => {
      expect(journalEntryCardSource).toContain("aria-label");
    });

    it("should have role='article' for semantics", () => {
      expect(journalEntryCardSource).toContain('role="article"');
    });
  });

  // -- DateGroupHeader component --

  describe("DateGroupHeader component", () => {
    it("should export DateGroupHeader as a named function", async () => {
      const mod = await import("@/components/patient/date-group-header");
      expect(mod.DateGroupHeader).toBeDefined();
      expect(typeof mod.DateGroupHeader).toBe("function");
    });

    it("should be sticky positioned", () => {
      expect(dateGroupHeaderSource).toContain("sticky");
    });

    it("should use Calm muted text for subtle appearance", () => {
      expect(dateGroupHeaderSource).toContain("text-calm-text-muted");
    });

    it("should use backdrop-blur for scroll readability", () => {
      expect(dateGroupHeaderSource).toContain("backdrop-blur");
    });

    it("should have role='heading' via h2 element (not redundant role attr)", () => {
      expect(dateGroupHeaderSource).toContain("<h2");
      expect(dateGroupHeaderSource).not.toContain('role="heading"');
    });
  });

  // -- JournalEntryList component --

  describe("JournalEntryList component", () => {
    it("should export JournalEntryList as a named function", async () => {
      const mod = await import("@/components/patient/journal-entry-list");
      expect(mod.JournalEntryList).toBeDefined();
      expect(typeof mod.JournalEntryList).toBe("function");
    });

    it("should import useJournalStore with atomic selectors", () => {
      expect(journalEntryListSource).toContain("useJournalStore");
      expect(journalEntryListSource).toContain("(s) => s.entries");
      expect(journalEntryListSource).toContain("(s) => s.isLoading");
    });

    it("should import groupEntriesByDate", () => {
      expect(journalEntryListSource).toContain("groupEntriesByDate");
    });

    it("should have a loading skeleton state", () => {
      expect(journalEntryListSource).toContain("animate-pulse");
      expect(journalEntryListSource).toContain("Loading");
    });

    it("should have an empty state message", () => {
      expect(journalEntryListSource).toContain("No entries yet");
    });

    it("should have an error state with retry button", () => {
      expect(journalEntryListSource).toContain("Failed to load");
      expect(journalEntryListSource).toContain('role="alert"');
      expect(journalEntryListSource).toContain("Retry");
      expect(journalEntryListSource).toContain("fetchEntries");
    });

    it("should render DateGroupHeader and JournalEntryCard", () => {
      expect(journalEntryListSource).toContain("DateGroupHeader");
      expect(journalEntryListSource).toContain("JournalEntryCard");
    });
  });

  // -- Journal Page Integration --

  describe("Journal page integration (Story 2.2)", () => {
    it("should import JournalEntryList", () => {
      expect(journalPageSource).toContain("JournalEntryList");
      expect(journalPageSource).toContain(
        "@/components/patient/journal-entry-list"
      );
    });

    it("should import useJournalStore for fetching entries", () => {
      expect(journalPageSource).toContain("useJournalStore");
      expect(journalPageSource).toContain("@/lib/stores/journal-store");
    });

    it("should import useUserStore for persona filtering", () => {
      expect(journalPageSource).toContain("useUserStore");
      expect(journalPageSource).toContain("@/lib/stores/user-store");
    });

    it("should use atomic selectors for personaId", () => {
      expect(journalPageSource).toContain("(s) => s.personaId");
    });

    it("should use useEffect to fetch entries on mount", () => {
      expect(journalPageSource).toContain("useEffect");
      expect(journalPageSource).toContain("fetchEntries");
    });

    it("should remain a client component", () => {
      expect(journalPageSource).toContain('"use client"');
    });

    it("should clear entries before fetching on persona change", () => {
      expect(journalPageSource).toContain("clearEntries");
    });
  });
});
