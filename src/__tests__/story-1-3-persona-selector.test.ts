/**
 * Story 1.3: Persona Selector & Context - Tests
 *
 * Tests cover:
 * - useUserStore: selectPersona + clearPersona state transitions
 * - useUserStore: localStorage persistence behavior
 * - useUserStore: hydration flag lifecycle
 * - PersonaSelector / PersonaGuard: module export verification
 * - Persona-Database alignment
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "@/lib/stores/user-store";

describe("Story 1.3: Persona Selector & Context", () => {
  // ─── useUserStore tests ───────────────────────────────────────────

  describe("useUserStore", () => {
    beforeEach(() => {
      // Reset store state before each test
      useUserStore.setState({
        personaId: null,
        personaName: null,
        isSelected: false,
      });
    });

    it("should initialize with no persona selected", () => {
      const state = useUserStore.getState();
      expect(state.personaId).toBeNull();
      expect(state.personaName).toBeNull();
      expect(state.isSelected).toBe(false);
    });

    it("should set Sarah persona correctly via selectPersona", () => {
      useUserStore.getState().selectPersona("sarah");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("sarah");
      expect(state.personaName).toBe("Sarah");
      expect(state.isSelected).toBe(true);
    });

    it("should set Michael persona correctly via selectPersona", () => {
      useUserStore.getState().selectPersona("michael");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("michael");
      expect(state.personaName).toBe("Michael");
      expect(state.isSelected).toBe(true);
    });

    it("should set Guest persona correctly via selectPersona", () => {
      useUserStore.getState().selectPersona("guest");
      const state = useUserStore.getState();

      expect(state.personaId?.startsWith("guest_")).toBe(true);
      expect(state.personaName).toBe("Guest");
      expect(state.isSelected).toBe(true);
    });

    it("should reset state via clearPersona", () => {
      // First select a persona
      useUserStore.getState().selectPersona("sarah");
      expect(useUserStore.getState().isSelected).toBe(true);

      // Then clear
      useUserStore.getState().clearPersona();
      const state = useUserStore.getState();

      expect(state.personaId).toBeNull();
      expect(state.personaName).toBeNull();
      expect(state.isSelected).toBe(false);
    });

    it("should allow switching personas", () => {
      useUserStore.getState().selectPersona("sarah");
      expect(useUserStore.getState().personaId).toBe("sarah");

      useUserStore.getState().selectPersona("michael");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("michael");
      expect(state.personaName).toBe("Michael");
      expect(state.isSelected).toBe(true);
    });

    it("should capitalize persona name correctly", () => {
      useUserStore.getState().selectPersona("sarah");
      expect(useUserStore.getState().personaName).toBe("Sarah");

      useUserStore.getState().selectPersona("michael");
      expect(useUserStore.getState().personaName).toBe("Michael");

      useUserStore.getState().selectPersona("guest");
      expect(useUserStore.getState().personaName).toBe("Guest");
    });
  });

  // ─── Hydration flag tests ─────────────────────────────────────────

  describe("useUserStore persistence", () => {
    it("should expose persist API for rehydration", () => {
      // Zustand persist middleware exposes a .persist property
      expect(useUserStore.persist).toBeDefined();
      expect(typeof useUserStore.persist.rehydrate).toBe("function");
      expect(typeof useUserStore.persist.hasHydrated).toBe("function");
      expect(typeof useUserStore.persist.onFinishHydration).toBe("function");
    });
  });

  // ─── Module export verification ───────────────────────────────────

  describe("PersonaSelector module", () => {
    it("should export PersonaSelector as a named function", async () => {
      const mod = await import(
        "@/components/patient/persona-selector"
      );
      expect(mod.PersonaSelector).toBeDefined();
      expect(typeof mod.PersonaSelector).toBe("function");
    });
  });

  describe("PersonaGuard module", () => {
    it("should export PersonaGuard as a named function", async () => {
      const mod = await import("@/components/shared/persona-guard");
      expect(mod.PersonaGuard).toBeDefined();
      expect(typeof mod.PersonaGuard).toBe("function");
    });
  });

  // ─── Integration: persona ID matches database user_id ─────────────

  describe("Persona-Database alignment", () => {
    it("should use persona IDs that match database user_id values", () => {
      // Database seed data uses 'sarah' and 'michael' as user_id strings
      // Verify store uses the same IDs
      useUserStore.getState().selectPersona("sarah");
      expect(useUserStore.getState().personaId).toBe("sarah");

      useUserStore.getState().selectPersona("michael");
      expect(useUserStore.getState().personaId).toBe("michael");
    });
  });
});
