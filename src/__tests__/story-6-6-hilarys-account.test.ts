/**
 * Story 6.6: Hilary's Account - Tests
 *
 * Tests cover:
 * - useUserStore: selectPersona("hilary") state transitions
 * - useUserStore: clearPersona resets Hilary's state
 * - Hilary's password verification server action
 * - Module export verification for /hilary page
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUserStore } from "@/lib/stores/user-store";

describe("Story 6.6: Hilary's Account", () => {
  // ─── useUserStore: Hilary persona ──────────────────────────────────

  describe("useUserStore - Hilary persona", () => {
    beforeEach(() => {
      useUserStore.setState({
        personaId: null,
        personaName: null,
        personaIconBg: "bg-calm-surface-raised",
        personaIconText: "text-calm-text-muted",
        isSelected: false,
      });
    });

    it("should set Hilary persona with deterministic ID", () => {
      useUserStore.getState().selectPersona("hilary");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("hilary");
      expect(state.personaName).toBe("Hilary");
      expect(state.isSelected).toBe(true);
    });

    it("should apply purple icon styling for Hilary", () => {
      useUserStore.getState().selectPersona("hilary");
      const state = useUserStore.getState();

      expect(state.personaIconBg).toBe("bg-calm-purple-soft");
      expect(state.personaIconText).toBe("text-calm-purple");
    });

    it("should reset Hilary state via clearPersona", () => {
      useUserStore.getState().selectPersona("hilary");
      expect(useUserStore.getState().isSelected).toBe(true);

      useUserStore.getState().clearPersona();
      const state = useUserStore.getState();

      expect(state.personaId).toBeNull();
      expect(state.personaName).toBeNull();
      expect(state.isSelected).toBe(false);
    });

    it("should allow switching from Hilary to another persona", () => {
      useUserStore.getState().selectPersona("hilary");
      expect(useUserStore.getState().personaId).toBe("hilary");

      useUserStore.getState().selectPersona("sarah");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("sarah");
      expect(state.personaName).toBe("Sarah");
    });
  });

  // ─── Server action: verifyHilaryPassword ───────────────────────────

  describe("verifyPersonaPassword for Hilary", () => {
    it("should accept correct password", async () => {
      vi.stubEnv("HILARYS_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("hilary", "test-secret");
      expect(result).toBe(true);

      vi.unstubAllEnvs();
    });

    it("should reject incorrect password", async () => {
      vi.stubEnv("HILARYS_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("hilary", "wrong-password");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });

    it("should reject when HILARYS_PASSWORD env is not set", async () => {
      vi.stubEnv("HILARYS_PASSWORD", "");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("hilary", "anything");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  // ─── Module export verification ─────────────────────────────────

  describe("Hilary login page module", () => {
    it("should export default HilaryLoginPage component", async () => {
      const mod = await import("@/app/hilary/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });
  });
});
