/**
 * Story 6.1: Kim's Account - Tests
 *
 * Tests cover:
 * - useUserStore: selectPersona("kim") state transitions
 * - useUserStore: clearPersona resets Kim's state
 * - Kim's password verification server action
 * - Module export verification for /kim page
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUserStore } from "@/lib/stores/user-store";

describe("Story 6.1: Kim's Account", () => {
  // ─── useUserStore: Kim persona ──────────────────────────────────

  describe("useUserStore - Kim persona", () => {
    beforeEach(() => {
      useUserStore.setState({
        personaId: null,
        personaName: null,
        personaIconBg: "bg-calm-surface-raised",
        personaIconText: "text-calm-text-muted",
        isSelected: false,
      });
    });

    it("should set Kim persona with deterministic ID", () => {
      useUserStore.getState().selectPersona("kim");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("kim");
      expect(state.personaName).toBe("Kim");
      expect(state.isSelected).toBe(true);
    });

    it("should apply teal icon styling for Kim", () => {
      useUserStore.getState().selectPersona("kim");
      const state = useUserStore.getState();

      expect(state.personaIconBg).toBe("bg-calm-teal-soft");
      expect(state.personaIconText).toBe("text-calm-teal");
    });

    it("should reset Kim state via clearPersona", () => {
      useUserStore.getState().selectPersona("kim");
      expect(useUserStore.getState().isSelected).toBe(true);

      useUserStore.getState().clearPersona();
      const state = useUserStore.getState();

      expect(state.personaId).toBeNull();
      expect(state.personaName).toBeNull();
      expect(state.isSelected).toBe(false);
    });

    it("should allow switching from Kim to another persona", () => {
      useUserStore.getState().selectPersona("kim");
      expect(useUserStore.getState().personaId).toBe("kim");

      useUserStore.getState().selectPersona("sarah");
      const state = useUserStore.getState();

      expect(state.personaId).toBe("sarah");
      expect(state.personaName).toBe("Sarah");
    });
  });

  // ─── Server action: verifyKimPassword ───────────────────────────

  describe("verifyPersonaPassword for Kim", () => {
    it("should accept correct password", async () => {
      vi.stubEnv("KIMS_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("kim", "test-secret");
      expect(result).toBe(true);

      vi.unstubAllEnvs();
    });

    it("should reject incorrect password", async () => {
      vi.stubEnv("KIMS_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("kim", "wrong-password");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });

    it("should reject when KIMS_PASSWORD env is not set", async () => {
      vi.stubEnv("KIMS_PASSWORD", "");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("kim", "anything");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  // ─── Module export verification ─────────────────────────────────

  describe("Kim login page module", () => {
    it("should export default KimLoginPage component", async () => {
      const mod = await import("@/app/kim/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });
  });
});
