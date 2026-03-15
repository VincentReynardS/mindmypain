/**
 * Story 7.5: Dedicated Journal Page & Clear Input Functionality - Tests
 *
 * Tests cover:
 * - Clear button: presence in JournalInput, correct behavior (clears text + transcribedText)
 * - Dedicated Journal page: filters entries by _intent, excludes non-journal types
 * - Navigation: /home and /journal routes, bottom nav includes both
 * - Route redirects: persona selector, login pages redirect to /home
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// Pre-load source files for static analysis tests
const journalInputSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/journal-input.tsx"),
  "utf-8"
);
const journalPageSource = fs.readFileSync(
  path.resolve(__dirname, "../app/(patient)/journal/page.tsx"),
  "utf-8"
);
const homePageSource = fs.readFileSync(
  path.resolve(__dirname, "../app/(patient)/home/page.tsx"),
  "utf-8"
);
const bottomNavSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/bottom-nav.tsx"),
  "utf-8"
);
const journalEntryCardSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/journal-entry-card.tsx"),
  "utf-8"
);
const glassBoxCardSource = fs.readFileSync(
  path.resolve(__dirname, "../components/shared/glass-box/glass-box-card.tsx"),
  "utf-8"
);
const personaSelectorSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/persona-selector.tsx"),
  "utf-8"
);

describe("Story 7.5: Dedicated Journal Page & Clear Input", () => {
  describe("Clear button in JournalInput", () => {
    it("should have a Clear button in the input component", () => {
      expect(journalInputSource).toContain("Clear");
      expect(journalInputSource).toContain("handleClear");
    });

    it("should clear both local text state and transcribed text on clear", () => {
      expect(journalInputSource).toContain('setText("")');
      expect(journalInputSource).toContain("resetTranscribedText");
    });

    it("should use a ghost-style button with X icon for Clear", () => {
      expect(journalInputSource).toContain("lucide-react");
      expect(journalInputSource).toContain("aria-label");
      expect(journalInputSource).toContain("Clear input");
    });

    it("should disable Clear button when text is empty", () => {
      expect(journalInputSource).toContain("!text.trim()");
    });
  });

  describe("Home page (/home)", () => {
    it("should export a default function component", async () => {
      const mod = await import("@/app/(patient)/home/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });

    it("should be a client component", () => {
      expect(homePageSource).toContain('"use client"');
    });

    it("should include JournalInput for text entry", () => {
      expect(homePageSource).toContain("JournalInput");
    });

    it("should include ScribeControls for voice input", () => {
      expect(homePageSource).toContain("ScribeControls");
    });

    it("should include AudioVisualizer", () => {
      expect(homePageSource).toContain("AudioVisualizer");
    });

    it("should include JournalEntryList for all entries", () => {
      expect(homePageSource).toContain("JournalEntryList");
    });

    it("should fetch entries using journal store", () => {
      expect(homePageSource).toContain("fetchEntries");
      expect(homePageSource).toContain("useJournalStore");
    });
  });

  describe("Dedicated Journal page (/journal)", () => {
    it("should export a default function component", async () => {
      const mod = await import("@/app/(patient)/journal/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });

    it("should be a client component", () => {
      expect(journalPageSource).toContain('"use client"');
    });

    it("should NOT include JournalInput (no text input on this page)", () => {
      expect(journalPageSource).not.toContain("JournalInput");
    });

    it("should NOT include ScribeControls (no recording on this page)", () => {
      expect(journalPageSource).not.toContain("ScribeControls");
    });

    it("should filter entries to exclude non-journal intents", () => {
      expect(journalPageSource).toContain("isJournalReflectionEntry");
      expect(journalPageSource).toContain('entries.filter(isJournalReflectionEntry)');
    });

    it("should use the shared journal-entry-ai helper for filtering", () => {
      expect(journalPageSource).toContain("@/lib/journal-entry-ai");
    });

    it("should display raw_text entries (unprocessed reflections)", () => {
      expect(journalPageSource).toContain("raw_text");
    });

    it("should use GlassBoxCard for processed journal entries", () => {
      expect(journalPageSource).toContain("GlassBoxCard");
    });

    it("should show empty state directing user to Home", () => {
      expect(journalPageSource).toContain("Home");
    });

    it("should use useMemo for filtered entries", () => {
      expect(journalPageSource).toContain("useMemo");
    });
  });

  describe("Bottom navigation", () => {
    it("should have Home link pointing to /home", () => {
      expect(bottomNavSource).toContain('href: "/home"');
      expect(bottomNavSource).toContain('label: "Home"');
    });

    it("should have Journal link pointing to /journal", () => {
      expect(bottomNavSource).toContain('href: "/journal"');
      expect(bottomNavSource).toContain('label: "Journal"');
    });

    it("should use BookOpen icon for Journal tab", () => {
      expect(bottomNavSource).toContain("BookOpen");
    });

    it("should include all 7 navigation items", () => {
      const hrefMatches = bottomNavSource.match(/href:/g);
      expect(hrefMatches).toHaveLength(7);
    });

    it("should use shortened labels for mobile viewport", () => {
      expect(bottomNavSource).toContain('"Appts"');
      expect(bottomNavSource).toContain('"Meds"');
      expect(bottomNavSource).toContain('"Immun."');
    });
  });

  describe("Entry anchors", () => {
    it("should expose raw entry cards with DOM ids for hash navigation", () => {
      expect(journalEntryCardSource).toContain("id={entry.id}");
    });

    it("should expose glass-box cards with DOM ids for hash navigation", () => {
      expect(glassBoxCardSource).toContain("id={entry.id}");
    });
  });

  describe("Login redirects", () => {
    it("should redirect persona selector to /home after login", () => {
      expect(personaSelectorSource).toContain('"/home"');
      expect(personaSelectorSource).not.toContain('push("/journal")');
    });
  });
});
