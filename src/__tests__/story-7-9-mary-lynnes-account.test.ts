/**
 * Story 7.9: Mary-Lynne's Account - Tests
 *
 * Tests cover:
 * - useUserStore: selectPersona("mary-lynne") state transitions
 * - useUserStore: clearPersona resets Mary-Lynne's state
 * - Mary-Lynne's password verification server action
 * - Module export verification for /mary-lynne page
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUserStore } from "@/lib/stores/user-store";

describe("Story 7.9: Mary-Lynne's Account", () => {
  // ─── useUserStore: Mary-Lynne persona ──────────────────────────────

  describe("useUserStore - Mary-Lynne persona", () => {
    beforeEach(() => {
      useUserStore.setState({
        personaId: null,
        personaName: null,
        personaIconBg: "bg-calm-surface-raised",
        personaIconText: "text-calm-text-muted",
        isSelected: false,
      });
    });

    it("should set Mary-Lynne persona with deterministic ID", () => {
      useUserStore.getState().selectPersona("mary-lynne");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("mary-lynne");
      expect(state.personaName).toBe("Mary-Lynne");
      expect(state.isSelected).toBe(true);
    });

    it("should apply rose icon styling for Mary-Lynne", () => {
      useUserStore.getState().selectPersona("mary-lynne");
      const state = useUserStore.getState();

      expect(state.personaIconBg).toBe("bg-calm-rose-soft");
      expect(state.personaIconText).toBe("text-calm-rose");
    });

    it("should reset Mary-Lynne state via clearPersona", () => {
      useUserStore.getState().selectPersona("mary-lynne");
      expect(useUserStore.getState().isSelected).toBe(true);

      useUserStore.getState().clearPersona();
      const state = useUserStore.getState();

      expect(state.personaId).toBeNull();
      expect(state.personaName).toBeNull();
      expect(state.isSelected).toBe(false);
    });

    it("should allow switching from Mary-Lynne to another persona", () => {
      useUserStore.getState().selectPersona("mary-lynne");
      expect(useUserStore.getState().personaId).toBe("mary-lynne");

      useUserStore.getState().selectPersona("sarah");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("sarah");
      expect(state.personaName).toBe("Sarah");
    });
  });

  // ─── Server action: verifyMaryLynnePassword ───────────────────────

  describe("verifyPersonaPassword for Mary-Lynne", () => {
    it("should accept correct password", async () => {
      vi.stubEnv("MARY_LYNNES_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("mary-lynne", "test-secret");
      expect(result).toBe(true);

      vi.unstubAllEnvs();
    });

    it("should reject incorrect password", async () => {
      vi.stubEnv("MARY_LYNNES_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("mary-lynne", "wrong-password");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });

    it("should reject when MARY_LYNNES_PASSWORD env is not set", async () => {
      vi.stubEnv("MARY_LYNNES_PASSWORD", "");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("mary-lynne", "anything");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  // ─── Module export verification ─────────────────────────────────

  describe("Mary-Lynne login page module", () => {
    it("should export default MaryLynneLoginPage component", async () => {
      const mod = await import("@/app/mary-lynne/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });
  });
});
