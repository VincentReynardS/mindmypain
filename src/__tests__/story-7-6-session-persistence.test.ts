/**
 * Story 7.6: Session Persistence Fix - Tests
 *
 * Tests cover:
 * - useUserStore uses localStorage (not sessionStorage) as storage backend
 * - Persona state persists through simulated rehydration
 * - clearPersona properly clears persisted state from localStorage
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// We need a fresh store per test suite since jsdom provides real localStorage.
// Dynamic import after clearing localStorage to avoid stale hydration.
async function createFreshStore() {
  // Clear any cached module so Zustand creates a new store instance
  vi.resetModules();
  const mod = await import("@/lib/stores/user-store");
  return mod.useUserStore;
}

describe("Story 7.6: Session Persistence Fix", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // ─── Storage backend tests ──────────────────────────────────────

  describe("localStorage storage backend", () => {
    it("should persist to localStorage when a persona is selected", async () => {
      const useUserStore = await createFreshStore();

      useUserStore.getState().selectPersona("kim");

      // Wait a tick for persist middleware to flush
      await new Promise((r) => setTimeout(r, 50));

      const stored = localStorage.getItem("mindmypain-persona");
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.personaId).toBe("kim");
      expect(parsed.state.isSelected).toBe(true);
    });

    it("should NOT write to sessionStorage", async () => {
      const useUserStore = await createFreshStore();

      useUserStore.getState().selectPersona("sarah");

      await new Promise((r) => setTimeout(r, 50));

      const sessionStored = sessionStorage.getItem("mindmypain-persona");
      expect(sessionStored).toBeNull();
    });

    it("should use 'mindmypain-persona' as the storage key", async () => {
      const useUserStore = await createFreshStore();

      useUserStore.getState().selectPersona("sarah");

      await new Promise((r) => setTimeout(r, 50));

      const stored = localStorage.getItem("mindmypain-persona");
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.personaId).toBe("sarah");
    });
  });

  // ─── Persistence through rehydration ────────────────────────────

  describe("state persistence", () => {
    it("should persist personaId, personaName, iconBg, iconText, and isSelected", async () => {
      const useUserStore = await createFreshStore();

      useUserStore.getState().selectPersona("kim");

      await new Promise((r) => setTimeout(r, 50));

      const stored = localStorage.getItem("mindmypain-persona");
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.personaId).toBe("kim");
      expect(parsed.state.personaName).toBe("Kim");
      expect(parsed.state.isSelected).toBe(true);
      expect(parsed.state.personaIconBg).toBe("bg-calm-teal-soft");
      expect(parsed.state.personaIconText).toBe("text-calm-teal");
    });

    it("should persist only partialised fields (no functions)", async () => {
      const useUserStore = await createFreshStore();

      useUserStore.getState().selectPersona("hilary");

      await new Promise((r) => setTimeout(r, 50));

      const stored = localStorage.getItem("mindmypain-persona");
      const parsed = JSON.parse(stored!);
      const stateKeys = Object.keys(parsed.state);

      // partialize keeps only these 5 fields
      expect(stateKeys).toContain("personaId");
      expect(stateKeys).toContain("personaName");
      expect(stateKeys).toContain("personaIconBg");
      expect(stateKeys).toContain("personaIconText");
      expect(stateKeys).toContain("isSelected");

      // Functions should NOT be persisted
      expect(stateKeys).not.toContain("selectPersona");
      expect(stateKeys).not.toContain("clearPersona");
    });

    it("should rehydrate persisted state into a new store instance", async () => {
      // First: select a persona and let it persist
      const store1 = await createFreshStore();
      store1.getState().selectPersona("michael");
      await new Promise((r) => setTimeout(r, 50));

      // Verify it was persisted
      const stored = localStorage.getItem("mindmypain-persona");
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).state.personaId).toBe("michael");

      // Second: create a fresh store instance (simulates page reload)
      const store2 = await createFreshStore();

      // Wait for hydration
      await new Promise((r) => setTimeout(r, 50));

      const state = store2.getState();
      expect(state.personaId).toBe("michael");
      expect(state.personaName).toBe("Michael");
      expect(state.isSelected).toBe(true);
    });
  });

  // ─── clearPersona clears storage ────────────────────────────────

  describe("clearPersona clears persisted state", () => {
    it("should reset persisted state in localStorage on clearPersona", async () => {
      const useUserStore = await createFreshStore();

      useUserStore.getState().selectPersona("sarah");
      await new Promise((r) => setTimeout(r, 50));

      // Verify it's stored
      let stored = localStorage.getItem("mindmypain-persona");
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).state.isSelected).toBe(true);

      // Clear persona
      useUserStore.getState().clearPersona();
      await new Promise((r) => setTimeout(r, 50));

      // Verify cleared state is persisted
      stored = localStorage.getItem("mindmypain-persona");
      expect(stored).not.toBeNull(); // key still exists but state is reset
      const parsed = JSON.parse(stored!);
      expect(parsed.state.personaId).toBeNull();
      expect(parsed.state.personaName).toBeNull();
      expect(parsed.state.isSelected).toBe(false);
    });
  });
});
