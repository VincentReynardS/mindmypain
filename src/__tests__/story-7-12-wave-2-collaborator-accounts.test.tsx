/**
 * @vitest-environment jsdom
 *
 * Story 7.12: Wave 2 Collaborator Accounts - Tests
 *
 * Covers Ross, Joanna, and Joanne — three hidden,
 * password-protected persona accounts added via the new
 * reusable HiddenPersonaLogin component.
 *
 * Tests cover:
 * - Generic verifyPersonaPassword server action for new personas
 * - useUserStore: selectPersona(id) state transitions and icon styling
 * - useUserStore: clearPersona resets state
 * - Switching between wave 2 personas and other personas
 * - Module export verification for each new route page
 * - Regression: public persona selector renders no wave 2 personas
 * - Regression: existing refactored persona routes still export correctly
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useUserStore } from "@/lib/stores/user-store";
import { PersonaSelector } from "@/components/patient/persona-selector";
import RossLoginPage from "@/app/ross/page";
import JoannaLoginPage from "@/app/joanna/page";
import JoanneLoginPage from "@/app/joanne/page";
import KimLoginPage from "@/app/kim/page";
import HilaryLoginPage from "@/app/hilary/page";
import MaryLynneLoginPage from "@/app/mary-lynne/page";
import SimoneLoginPage from "@/app/simone/page";
import PeterLoginPage from "@/app/peter/page";
import LucilleLoginPage from "@/app/lucille/page";
import KimberleyLoginPage from "@/app/kimberley/page";
import SamuelLoginPage from "@/app/samuel/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

type Wave2Meta = {
  id: "ross" | "joanna" | "joanne";
  displayName: string;
  iconBg: string;
  iconText: string;
  envVar: string;
};

const wave2Personas: Wave2Meta[] = [
  {
    id: "ross",
    displayName: "Ross",
    iconBg: "bg-calm-teal-soft",
    iconText: "text-calm-teal",
    envVar: "ROSS_PASSWORD",
  },
  {
    id: "joanna",
    displayName: "Joanna",
    iconBg: "bg-calm-purple-soft",
    iconText: "text-calm-purple",
    envVar: "JOANNA_PASSWORD",
  },
  {
    id: "joanne",
    displayName: "Joanne",
    iconBg: "bg-calm-rose-soft",
    iconText: "text-calm-rose",
    envVar: "JOANNE_PASSWORD",
  },
];

describe("Story 7.12: Wave 2 Collaborator Accounts", () => {
  // ─── Generic verifyPersonaPassword server action ─────────────────

  describe("verifyPersonaPassword server action", () => {
    for (const p of wave2Personas) {
      describe(`${p.displayName} (${p.envVar})`, () => {
        it("should accept correct password", async () => {
          vi.stubEnv(p.envVar, "test-secret");
          const { verifyPersonaPassword } = await import(
            "@/app/actions/verify-persona-password"
          );

          const result = await verifyPersonaPassword(p.id, "test-secret");
          expect(result).toBe(true);

          vi.unstubAllEnvs();
        });

        it("should reject incorrect password", async () => {
          vi.stubEnv(p.envVar, "test-secret");
          const { verifyPersonaPassword } = await import(
            "@/app/actions/verify-persona-password"
          );

          const result = await verifyPersonaPassword(p.id, "wrong-password");
          expect(result).toBe(false);

          vi.unstubAllEnvs();
        });

        it(`should reject when ${p.envVar} env is not set`, async () => {
          vi.stubEnv(p.envVar, "");
          const { verifyPersonaPassword } = await import(
            "@/app/actions/verify-persona-password"
          );

          const result = await verifyPersonaPassword(p.id, "anything");
          expect(result).toBe(false);

          vi.unstubAllEnvs();
        });
      });
    }

    it("should reject unknown persona ID", async () => {
      const { verifyPersonaPassword } = await import(
        "@/app/actions/verify-persona-password"
      );

      const result = await verifyPersonaPassword("unknown-user", "anything");
      expect(result).toBe(false);
    });
  });

  // ─── useUserStore: wave 2 persona transitions ───────────────────

  describe("useUserStore - wave 2 personas", () => {
    beforeEach(() => {
      useUserStore.setState({
        personaId: null,
        personaName: null,
        personaIconBg: "bg-calm-surface-raised",
        personaIconText: "text-calm-text-muted",
        isSelected: false,
      });
    });

    for (const p of wave2Personas) {
      it(`should set ${p.displayName} persona with deterministic ID`, () => {
        useUserStore.getState().selectPersona(p.id);
        const state = useUserStore.getState();

        expect(state.personaId).toBe(p.id);
        expect(state.personaName).toBe(p.displayName);
        expect(state.isSelected).toBe(true);
      });

      it(`should apply ${p.iconText} icon styling for ${p.displayName}`, () => {
        useUserStore.getState().selectPersona(p.id);
        const state = useUserStore.getState();

        expect(state.personaIconBg).toBe(p.iconBg);
        expect(state.personaIconText).toBe(p.iconText);
      });

      it(`should reset ${p.displayName} state via clearPersona`, () => {
        useUserStore.getState().selectPersona(p.id);
        expect(useUserStore.getState().isSelected).toBe(true);

        useUserStore.getState().clearPersona();
        const state = useUserStore.getState();

        expect(state.personaId).toBeNull();
        expect(state.personaName).toBeNull();
        expect(state.isSelected).toBe(false);
      });

      it(`should allow switching from ${p.displayName} to another persona`, () => {
        useUserStore.getState().selectPersona(p.id);
        expect(useUserStore.getState().personaId).toBe(p.id);

        useUserStore.getState().selectPersona("sarah");
        const state = useUserStore.getState();

        expect(state.personaId).toBe("sarah");
        expect(state.personaName).toBe("Sarah");
      });
    }
  });

  // ─── Module export verification ──────────────────────────────────

  describe("wave 2 login page modules", () => {
    it("should export default RossLoginPage component", () => {
      expect(typeof RossLoginPage).toBe("function");
    });

    it("should export default JoannaLoginPage component", () => {
      expect(typeof JoannaLoginPage).toBe("function");
    });

    it("should export default JoanneLoginPage component", () => {
      expect(typeof JoanneLoginPage).toBe("function");
    });
  });

  // ─── Regression: refactored persona routes still export correctly ─

  describe("refactored persona route modules", () => {
    const refactoredPages = {
      kim: KimLoginPage,
      hilary: HilaryLoginPage,
      "mary-lynne": MaryLynneLoginPage,
      simone: SimoneLoginPage,
      peter: PeterLoginPage,
      lucille: LucilleLoginPage,
      kimberley: KimberleyLoginPage,
      samuel: SamuelLoginPage,
    } as const;

    for (const [id, Component] of Object.entries(refactoredPages)) {
      it(`should still export default component for /${id}`, () => {
        expect(typeof Component).toBe("function");
      });
    }
  });

  // ─── Regression: public selector hides wave 2 personas ───────────

  describe("public persona selector", () => {
    it("should not render a card for any wave 2 persona", () => {
      render(<PersonaSelector />);

      for (const p of wave2Personas) {
        expect(
          screen.queryByRole("button", { name: `Start as ${p.displayName}` })
        ).toBeNull();
      }
    });
  });
});
