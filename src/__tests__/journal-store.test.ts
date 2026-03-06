import { describe, it, expect, beforeEach } from "vitest";
import { useJournalStore } from "@/lib/stores/journal-store";
import type { JournalEntry } from "@/types/database";

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: overrides.id ?? "entry-1",
    user_id: "test-user",
    content: "test content",
    entry_type: "raw_text",
    status: "draft",
    ai_response: null,
    previous_status: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as JournalEntry;
}

describe("Journal Store", () => {
  beforeEach(() => {
    useJournalStore.setState({
      entries: [],
      archivedEntries: [],
      isLoading: false,
      isLoadingArchived: false,
      error: null,
    });
  });

  it("should have empty initial state", () => {
    const state = useJournalStore.getState();
    expect(state.entries).toEqual([]);
    expect(state.archivedEntries).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should prepend entry via addEntry", () => {
    const entry1 = makeEntry({ id: "e1" });
    const entry2 = makeEntry({ id: "e2" });

    useJournalStore.getState().addEntry(entry1);
    useJournalStore.getState().addEntry(entry2);

    const entries = useJournalStore.getState().entries;
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe("e2");
    expect(entries[1].id).toBe("e1");
  });

  it("should update matching entry only via updateEntry", () => {
    const entry1 = makeEntry({ id: "e1", content: "original" });
    const entry2 = makeEntry({ id: "e2", content: "untouched" });
    useJournalStore.setState({ entries: [entry1, entry2] });

    useJournalStore.getState().updateEntry("e1", { content: "updated" });

    const entries = useJournalStore.getState().entries;
    expect(entries[0].content).toBe("updated");
    expect(entries[1].content).toBe("untouched");
  });

  it("should set status to approved via approveEntry", () => {
    const entry = makeEntry({ id: "e1", status: "draft" });
    useJournalStore.setState({ entries: [entry] });

    useJournalStore.getState().approveEntry("e1");

    expect(useJournalStore.getState().entries[0].status).toBe("approved");
  });

  it("should remove entry from entries via archiveEntry", () => {
    const entry1 = makeEntry({ id: "e1" });
    const entry2 = makeEntry({ id: "e2" });
    useJournalStore.setState({ entries: [entry1, entry2] });

    useJournalStore.getState().archiveEntry("e1");

    const entries = useJournalStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe("e2");
  });

  it("should move entry from archived to entries via restoreEntry", () => {
    const archived = makeEntry({ id: "e1", status: "archived", previous_status: "approved" });
    useJournalStore.setState({ entries: [], archivedEntries: [archived] });

    useJournalStore.getState().restoreEntry("e1");

    const state = useJournalStore.getState();
    expect(state.archivedEntries).toHaveLength(0);
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].status).toBe("approved");
  });

  it("should remove entry from both arrays via removeEntry", () => {
    const entry = makeEntry({ id: "e1" });
    const archived = makeEntry({ id: "e2" });
    useJournalStore.setState({ entries: [entry], archivedEntries: [archived] });

    useJournalStore.getState().removeEntry("e1");
    useJournalStore.getState().removeEntry("e2");

    const state = useJournalStore.getState();
    expect(state.entries).toHaveLength(0);
    expect(state.archivedEntries).toHaveLength(0);
  });

  it("should empty everything via clearEntries", () => {
    useJournalStore.setState({
      entries: [makeEntry({ id: "e1" })],
      archivedEntries: [makeEntry({ id: "e2" })],
      error: "some error",
    });

    useJournalStore.getState().clearEntries();

    const state = useJournalStore.getState();
    expect(state.entries).toEqual([]);
    expect(state.archivedEntries).toEqual([]);
    expect(state.error).toBeNull();
  });

  it("should return a deep copy via getEntriesSnapshot that does not affect store when mutated", () => {
    const entry = makeEntry({ id: "e1", content: "original" });
    useJournalStore.setState({ entries: [entry] });

    const snapshot = useJournalStore.getState().getEntriesSnapshot();
    snapshot.entries.push(makeEntry({ id: "e-extra" }));
    snapshot.entries[0].content = "mutated";

    // Store should be unaffected by mutation of snapshot array AND entry objects
    const storeEntries = useJournalStore.getState().entries;
    expect(storeEntries).toHaveLength(1);
    expect(storeEntries[0].id).toBe("e1");
    expect(storeEntries[0].content).toBe("original");
  });

  it("should replace both arrays via restoreSnapshot", () => {
    useJournalStore.setState({
      entries: [makeEntry({ id: "e1" })],
      archivedEntries: [makeEntry({ id: "e2" })],
    });

    const newEntries = [makeEntry({ id: "e3" }), makeEntry({ id: "e4" })];
    const newArchived = [makeEntry({ id: "e5" })];

    useJournalStore.getState().restoreSnapshot({
      entries: newEntries,
      archivedEntries: newArchived,
    });

    const state = useJournalStore.getState();
    expect(state.entries).toHaveLength(2);
    expect(state.entries[0].id).toBe("e3");
    expect(state.archivedEntries).toHaveLength(1);
    expect(state.archivedEntries[0].id).toBe("e5");
  });

  it("should restore original state after optimistic update + rollback", () => {
    const original = makeEntry({ id: "e1", content: "original", status: "draft" });
    useJournalStore.setState({ entries: [original], archivedEntries: [] });

    // Take snapshot
    const snapshot = useJournalStore.getState().getEntriesSnapshot();

    // Apply optimistic update
    useJournalStore.getState().approveEntry("e1");
    expect(useJournalStore.getState().entries[0].status).toBe("approved");

    // Simulate server failure — rollback
    useJournalStore.getState().restoreSnapshot(snapshot);

    const state = useJournalStore.getState();
    expect(state.entries[0].status).toBe("draft");
    expect(state.entries[0].content).toBe("original");
  });
});
