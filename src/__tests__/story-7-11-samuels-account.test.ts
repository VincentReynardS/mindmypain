/**
 * Story 7.11: Samuel Hamilton-Smith's Account - Tests
 *
 * Tests cover:
 * - useUserStore: selectPersona("samuel") state transitions
 * - useUserStore: clearPersona resets Samuel's state
 * - Samuel's password verification server action
 * - Module export verification for /samuel page
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUserStore } from "@/lib/stores/user-store";

describe("Story 7.11: Samuel Hamilton-Smith's Account", () => {
  // ─── useUserStore: Samuel persona ──────────────────────────────

  describe("useUserStore - Samuel persona", () => {
    beforeEach(() => {
      useUserStore.setState({
        personaId: null,
        personaName: null,
        personaIconBg: "bg-calm-surface-raised",
        personaIconText: "text-calm-text-muted",
        isSelected: false,
      });
    });

    it("should set Samuel persona with deterministic ID", () => {
      useUserStore.getState().selectPersona("samuel");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("samuel");
      expect(state.personaName).toBe("Samuel");
      expect(state.isSelected).toBe(true);
    });

    it("should apply green icon styling for Samuel", () => {
      useUserStore.getState().selectPersona("samuel");
      const state = useUserStore.getState();

      expect(state.personaIconBg).toBe("bg-calm-green-soft");
      expect(state.personaIconText).toBe("text-calm-green");
    });

    it("should reset Samuel state via clearPersona", () => {
      useUserStore.getState().selectPersona("samuel");
      expect(useUserStore.getState().isSelected).toBe(true);

      useUserStore.getState().clearPersona();
      const state = useUserStore.getState();

      expect(state.personaId).toBeNull();
      expect(state.personaName).toBeNull();
      expect(state.isSelected).toBe(false);
    });

    it("should allow switching from Samuel to another persona", () => {
      useUserStore.getState().selectPersona("samuel");
      expect(useUserStore.getState().personaId).toBe("samuel");

      useUserStore.getState().selectPersona("sarah");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("sarah");
      expect(state.personaName).toBe("Sarah");
    });
  });

  // ─── Server action: verifySamuelPassword ───────────────────────

  describe("verifyPersonaPassword for Samuel", () => {
    it("should accept correct password", async () => {
      vi.stubEnv("SAMUEL_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("samuel", "test-secret");
      expect(result).toBe(true);

      vi.unstubAllEnvs();
    });

    it("should reject incorrect password", async () => {
      vi.stubEnv("SAMUEL_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("samuel", "wrong-password");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });

    it("should reject when SAMUEL_PASSWORD env is not set", async () => {
      vi.stubEnv("SAMUEL_PASSWORD", "");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("samuel", "anything");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  // ─── Module export verification ─────────────────────────────────

  describe("Samuel login page module", () => {
    it("should export default SamuelLoginPage component", async () => {
      const mod = await import("@/app/samuel/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });
  });
});
