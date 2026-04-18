/**
 * Story 7.10: Additional Collaborator Accounts - Tests
 *
 * Covers Simone, Peter, Lucille, and Kimberley — four hidden,
 * password-protected persona accounts.
 *
 * Tests cover:
 * - useUserStore: selectPersona(id) state transitions and icon styling
 * - useUserStore: clearPersona resets state
 * - Switching between the new collaborator personas and other personas
 * - verifyXPassword server actions (accept / reject / env unset)
 * - Module export verification for each /<id> page
 * - Regression: public persona selector excludes all 4 new IDs
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUserStore } from "@/lib/stores/user-store";

type CollaboratorMeta = {
  id: "simone" | "peter" | "lucille" | "kimberley";
  displayName: string;
  iconBg: string;
  iconText: string;
};

const collaborators: CollaboratorMeta[] = [
  {
    id: "simone",
    displayName: "Simone",
    iconBg: "bg-calm-teal-soft",
    iconText: "text-calm-teal",
  },
  {
    id: "peter",
    displayName: "Peter",
    iconBg: "bg-calm-purple-soft",
    iconText: "text-calm-purple",
  },
  {
    id: "lucille",
    displayName: "Lucille",
    iconBg: "bg-calm-rose-soft",
    iconText: "text-calm-rose",
  },
  {
    id: "kimberley",
    displayName: "Kimberley",
    iconBg: "bg-calm-blue-soft",
    iconText: "text-calm-blue",
  },
];

describe("Story 7.10: Additional Collaborator Accounts", () => {
  // ─── useUserStore: collaborator persona transitions ───────────────

  describe("useUserStore - collaborator personas", () => {
    beforeEach(() => {
      useUserStore.setState({
        personaId: null,
        personaName: null,
        personaIconBg: "bg-calm-surface-raised",
        personaIconText: "text-calm-text-muted",
        isSelected: false,
      });
    });

    for (const c of collaborators) {
      it(`should set ${c.displayName} persona with deterministic ID`, () => {
        useUserStore.getState().selectPersona(c.id);
        const state = useUserStore.getState();

        expect(state.personaId).toBe(c.id);
        expect(state.personaName).toBe(c.displayName);
        expect(state.isSelected).toBe(true);
      });

      it(`should apply ${c.iconText} icon styling for ${c.displayName}`, () => {
        useUserStore.getState().selectPersona(c.id);
        const state = useUserStore.getState();

        expect(state.personaIconBg).toBe(c.iconBg);
        expect(state.personaIconText).toBe(c.iconText);
      });

      it(`should reset ${c.displayName} state via clearPersona`, () => {
        useUserStore.getState().selectPersona(c.id);
        expect(useUserStore.getState().isSelected).toBe(true);

        useUserStore.getState().clearPersona();
        const state = useUserStore.getState();

        expect(state.personaId).toBeNull();
        expect(state.personaName).toBeNull();
        expect(state.isSelected).toBe(false);
      });

      it(`should allow switching from ${c.displayName} to another persona`, () => {
        useUserStore.getState().selectPersona(c.id);
        expect(useUserStore.getState().personaId).toBe(c.id);

        useUserStore.getState().selectPersona("sarah");
        const state = useUserStore.getState();

        expect(state.personaId).toBe("sarah");
        expect(state.personaName).toBe("Sarah");
      });
    }
  });

  // ─── Server actions: verifyXPassword ──────────────────────────────

  describe("verifyPersonaPassword for Simone", () => {
    it("should accept correct password", async () => {
      vi.stubEnv("SIMONE_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("simone", "test-secret");
      expect(result).toBe(true);

      vi.unstubAllEnvs();
    });

    it("should reject incorrect password", async () => {
      vi.stubEnv("SIMONE_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("simone", "wrong-password");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });

    it("should reject when SIMONE_PASSWORD env is not set", async () => {
      vi.stubEnv("SIMONE_PASSWORD", "");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("simone", "anything");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  describe("verifyPersonaPassword for Peter", () => {
    it("should accept correct password", async () => {
      vi.stubEnv("PETER_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("peter", "test-secret");
      expect(result).toBe(true);

      vi.unstubAllEnvs();
    });

    it("should reject incorrect password", async () => {
      vi.stubEnv("PETER_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("peter", "wrong-password");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });

    it("should reject when PETER_PASSWORD env is not set", async () => {
      vi.stubEnv("PETER_PASSWORD", "");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("peter", "anything");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  describe("verifyPersonaPassword for Lucille", () => {
    it("should accept correct password", async () => {
      vi.stubEnv("LUCILLE_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("lucille", "test-secret");
      expect(result).toBe(true);

      vi.unstubAllEnvs();
    });

    it("should reject incorrect password", async () => {
      vi.stubEnv("LUCILLE_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("lucille", "wrong-password");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });

    it("should reject when LUCILLE_PASSWORD env is not set", async () => {
      vi.stubEnv("LUCILLE_PASSWORD", "");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("lucille", "anything");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  describe("verifyPersonaPassword for Kimberley", () => {
    it("should accept correct password", async () => {
      vi.stubEnv("KIMBERLEY_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("kimberley", "test-secret");
      expect(result).toBe(true);

      vi.unstubAllEnvs();
    });

    it("should reject incorrect password", async () => {
      vi.stubEnv("KIMBERLEY_PASSWORD", "test-secret");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("kimberley", "wrong-password");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });

    it("should reject when KIMBERLEY_PASSWORD env is not set", async () => {
      vi.stubEnv("KIMBERLEY_PASSWORD", "");
      const { verifyPersonaPassword } = await import("@/app/actions/verify-persona-password");

      const result = await verifyPersonaPassword("kimberley", "anything");
      expect(result).toBe(false);

      vi.unstubAllEnvs();
    });
  });

  // ─── Module export verification ───────────────────────────────────

  describe("collaborator login page modules", () => {
    it("should export default SimoneLoginPage component", async () => {
      const mod = await import("@/app/simone/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });

    it("should export default PeterLoginPage component", async () => {
      const mod = await import("@/app/peter/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });

    it("should export default LucilleLoginPage component", async () => {
      const mod = await import("@/app/lucille/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });

    it("should export default KimberleyLoginPage component", async () => {
      const mod = await import("@/app/kimberley/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });
  });

  // ─── Regression: public selector hides collaborator personas ──────

  describe("public persona selector", () => {
    it("should not expose collaborator personas on the landing page", () => {
      const selectorSource = readFileSync(
        resolve(__dirname, "../components/patient/persona-selector.tsx"),
        "utf-8"
      );

      for (const c of collaborators) {
        expect(selectorSource).not.toContain(`id: "${c.id}"`);
        expect(selectorSource).not.toContain(`Start as ${c.displayName}`);
      }
    });
  });
});
