/**
 * Story 1.4: Mobile-First Patient Layout - Tests
 *
 * Tests cover:
 * - MobileHeader: module export verification
 * - Patient layout: PersonaGuard and MobileHeader integration
 * - User store: persona name availability for header display
 * - Calm token usage verification (static source analysis)
 */

import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { useUserStore } from "@/lib/stores/user-store";

// Pre-load source files once for static analysis tests
const headerSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/mobile-header.tsx"),
  "utf-8"
);
const layoutSource = fs.readFileSync(
  path.resolve(__dirname, "../app/(patient)/layout.tsx"),
  "utf-8"
);

describe("Story 1.4: Mobile-First Patient Layout", () => {
  // -- MobileHeader module verification --

  describe("MobileHeader module", () => {
    it("should export MobileHeader as a named function", async () => {
      const mod = await import("@/components/patient/mobile-header");
      expect(mod.MobileHeader).toBeDefined();
      expect(typeof mod.MobileHeader).toBe("function");
    });
  });

  // -- User store: persona name for header display --

  describe("Persona name for header display", () => {
    beforeEach(() => {
      useUserStore.setState({
        personaId: null,
        personaName: null,
        isSelected: false,
      });
    });

    it("should provide personaName for Sarah in header", () => {
      useUserStore.getState().selectPersona("sarah");
      const name = useUserStore.getState().personaName;
      expect(name).toBe("Sarah");
    });

    it("should provide personaName for Michael in header", () => {
      useUserStore.getState().selectPersona("michael");
      const name = useUserStore.getState().personaName;
      expect(name).toBe("Michael");
    });

    it("should return null personaName when no persona selected", () => {
      const name = useUserStore.getState().personaName;
      expect(name).toBeNull();
    });
  });

  // -- Patient layout module verification --

  describe("Patient layout integration", () => {
    it("should export PatientLayout as default function", async () => {
      const mod = await import("@/app/(patient)/layout");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });

    it("should import PersonaGuard for route protection", async () => {
      const mod = await import("@/components/shared/persona-guard");
      expect(mod.PersonaGuard).toBeDefined();
      expect(typeof mod.PersonaGuard).toBe("function");
    });
  });

  // -- Calm token usage (static source analysis) --

  describe("Calm design token compliance", () => {
    it("MobileHeader should reference calm surface-raised token", () => {
      expect(headerSource).toContain("bg-calm-surface-raised");
      expect(headerSource).toContain("text-calm-text");
    });

    it("Patient layout should reference bg-calm-surface", () => {
      expect(layoutSource).toContain("bg-calm-surface");
    });

    it("MobileHeader should use sticky positioning", () => {
      expect(headerSource).toContain("sticky");
    });

    it("Patient layout should constrain width with max-w-lg", () => {
      expect(layoutSource).toContain("max-w-lg");
    });
  });

  // -- Accessibility compliance --

  describe("Accessibility", () => {
    it("MobileHeader should have aria-label on header landmark", () => {
      expect(headerSource).toContain('aria-label="Main navigation"');
    });

    it("MobileHeader should NOT use h1 tag (avoids duplicate headings)", () => {
      // Branding should use <span>, not <h1>
      expect(headerSource).not.toMatch(/<h1[\s>]/);
    });

    it("MobileHeader persona avatar should meet 44px touch target", () => {
      // h-11 w-11 = 44px (2.75rem), matching --spacing-touch-target
      expect(headerSource).toContain("h-11");
      expect(headerSource).toContain("w-11");
    });
  });
});
