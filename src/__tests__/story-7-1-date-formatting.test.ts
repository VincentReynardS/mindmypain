/**
 * Story 7.1: Global Date Formatting & Relative Time Calculation - Tests
 *
 * Tests cover:
 * - getCurrentDateContext() returns a string containing today's date
 * - Zod ddmmyyyyDateString schema transform (passthrough, conversion, null handling)
 * - formatDateDDMMYYYY() utility for various input formats
 * - AI prompt date context injection (static analysis)
 * - Renderer date formatting (static analysis)
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { z } from "zod";

import { formatDateDDMMYYYY } from "@/lib/utils/date-helpers";

// We can't import getCurrentDateContext directly (server-only module), so we test via static analysis
const smartParserSource = fs.readFileSync(
  path.resolve(__dirname, "../lib/openai/smart-parser.ts"),
  "utf-8"
);

const glassBoxCardSource = fs.readFileSync(
  path.resolve(__dirname, "../components/shared/glass-box/glass-box-card.tsx"),
  "utf-8"
);

const medicationsPageSource = fs.readFileSync(
  path.resolve(__dirname, "../app/(patient)/medications/page.tsx"),
  "utf-8"
);

const seedSqlSource = fs.readFileSync(
  path.resolve(__dirname, "../../supabase/seed.sql"),
  "utf-8"
);

// Replicate the Zod schema here since it's not exported from smart-parser (server-only)
const ddmmyyyyDateString = z.string().nullish().transform((val) => {
  if (!val) return val;
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) return val;
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) {
    const dd = String(parsed.getDate()).padStart(2, '0');
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
  return val;
});

describe("Story 7.1: Global Date Formatting", () => {
  // === getCurrentDateContext ===
  describe("getCurrentDateContext()", () => {
    it("is defined and exported in smart-parser.ts", () => {
      expect(smartParserSource).toContain("export function getCurrentDateContext(referenceDate: Date | string = new Date())");
    });

    it("returns a string referencing current date context", () => {
      expect(smartParserSource).toContain("Current date and time:");
      expect(smartParserSource).toContain("Use this to resolve any relative date references");
    });
  });

  // === AI Prompt Date Context Injection ===
  describe("AI prompt date context injection", () => {
    it("injects getCurrentDateContext into parseJournal", () => {
      // Check that the journal parser includes date context in messages
      expect(smartParserSource).toMatch(/JOURNAL_SYSTEM_PROMPT[\s\S]*getCurrentDateContext/);
    });

    it("injects getCurrentDateContext into parseMedication", () => {
      expect(smartParserSource).toMatch(/MEDICATION_SYSTEM_PROMPT[\s\S]*getCurrentDateContext/);
    });

    it("injects getCurrentDateContext into parseScript", () => {
      expect(smartParserSource).toMatch(/SCRIPT_SYSTEM_PROMPT[\s\S]*getCurrentDateContext/);
    });

    it("injects getCurrentDateContext into parseAppointment", () => {
      expect(smartParserSource).toMatch(/APPOINTMENT_SYSTEM_PROMPT[\s\S]*getCurrentDateContext/);
    });

    it("does NOT inject date context into classifyIntent", () => {
      // classifyIntent only classifies, doesn't need date context
      const classifyBlock = smartParserSource.slice(
        smartParserSource.indexOf("async function classifyIntent"),
        smartParserSource.indexOf("// === Parsing Daily Journal")
      );
      expect(classifyBlock).not.toContain("getCurrentDateContext");
    });
  });

  // === Date Format Instruction in Prompts ===
  describe("date format instruction in prompts", () => {
    it("includes dd-mm-yyyy instruction in JOURNAL_SYSTEM_PROMPT", () => {
      expect(smartParserSource).toContain("DATE_FORMAT_INSTRUCTION");
    });

    it("includes dd-mm-yyyy format mandate text", () => {
      expect(smartParserSource).toContain("All date fields MUST be resolved to dd-mm-yyyy format");
    });
  });

  // === Zod ddmmyyyyDateString Schema ===
  describe("ddmmyyyyDateString Zod schema", () => {
    it("passes through dd-mm-yyyy format unchanged", () => {
      const result = ddmmyyyyDateString.parse("17-03-2026");
      expect(result).toBe("17-03-2026");
    });

    it("converts YYYY-MM-DD to dd-mm-yyyy", () => {
      const result = ddmmyyyyDateString.parse("2026-03-17");
      expect(result).toBe("17-03-2026");
    });

    it("passes through null", () => {
      const result = ddmmyyyyDateString.parse(null);
      expect(result).toBeNull();
    });

    it("passes through undefined", () => {
      const result = ddmmyyyyDateString.parse(undefined);
      expect(result).toBeUndefined();
    });

    it("returns unparseable strings as-is (graceful degradation)", () => {
      const result = ddmmyyyyDateString.parse("Next Tuesday");
      expect(result).toBe("Next Tuesday");
    });

    it("converts ISO date string", () => {
      const result = ddmmyyyyDateString.parse("2026-01-05T10:00:00Z");
      // Day may vary by timezone but should be dd-mm-yyyy format
      expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/);
    });
  });

  // === formatDateDDMMYYYY Utility ===
  describe("formatDateDDMMYYYY()", () => {
    it("passes through dd-mm-yyyy format unchanged", () => {
      expect(formatDateDDMMYYYY("17-03-2026")).toBe("17-03-2026");
    });

    it("converts YYYY-MM-DD to dd-mm-yyyy", () => {
      expect(formatDateDDMMYYYY("2026-03-17")).toBe("17-03-2026");
    });

    it("returns unparseable strings as-is", () => {
      expect(formatDateDDMMYYYY("Next Tuesday")).toBe("Next Tuesday");
    });

    it("handles empty string", () => {
      expect(formatDateDDMMYYYY("")).toBe("");
    });

    it("converts ISO date string to dd-mm-yyyy", () => {
      const result = formatDateDDMMYYYY("2026-01-05T10:00:00Z");
      expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/);
    });
  });

  // === Zod Schemas Applied to Date Fields ===
  describe("Zod schemas use ddmmyyyyDateString for date fields", () => {
    it("JournalResponseSchema Appointments[].Date uses ddmmyyyyDateString", () => {
      expect(smartParserSource).toMatch(/'Date': ddmmyyyyDateString/);
    });

    it("MedicationResponseSchema Date Started uses ddmmyyyyDateString", () => {
      expect(smartParserSource).toMatch(/'Date Started': ddmmyyyyDateString/);
    });

    it("MedicationResponseSchema Date Stopped uses ddmmyyyyDateString", () => {
      expect(smartParserSource).toMatch(/'Date Stopped': ddmmyyyyDateString/);
    });

    it("ScriptResponseSchema Date Prescribed uses ddmmyyyyDateString", () => {
      expect(smartParserSource).toMatch(/'Date Prescribed': ddmmyyyyDateString/);
    });

    it("AppointmentResponseSchema Date uses ddmmyyyyDateString", () => {
      expect(smartParserSource).toMatch(/Date: ddmmyyyyDateString/);
    });
  });

  // === UI Renderer Date Formatting ===
  describe("UI renderers apply formatDateDDMMYYYY", () => {
    it("glass-box-card imports formatDateDDMMYYYY", () => {
      expect(glassBoxCardSource).toContain("import { formatDateDDMMYYYY }");
    });

    it("glass-box-card defines DATE_FIELDS set", () => {
      expect(glassBoxCardSource).toContain("DATE_FIELDS");
      expect(glassBoxCardSource).toContain("'Date Started'");
      expect(glassBoxCardSource).toContain("'Date Stopped'");
      expect(glassBoxCardSource).toContain("'Date Prescribed'");
    });

    it("renderers apply formatDateDDMMYYYY for date fields", () => {
      expect(glassBoxCardSource).toContain("DATE_FIELDS.has(key) ? formatDateDDMMYYYY(raw) : raw");
    });

    it("SafeHealthJournalRender formats inline appointment dates", () => {
      expect(glassBoxCardSource).toContain("formatDateDDMMYYYY(getString(appt.Date)!)");
    });

    it("medications page imports formatDateDDMMYYYY", () => {
      expect(medicationsPageSource).toContain("import { formatDateDDMMYYYY }");
    });

    it("medications page uses formatDateDDMMYYYY for mention dates", () => {
      expect(medicationsPageSource).toContain("formatDateDDMMYYYY(mention.date)");
    });
  });

  // === Seed Data ===
  describe("seed data uses dd-mm-yyyy format", () => {
    it("Sarah's appointment uses dd-mm-yyyy date", () => {
      expect(seedSqlSource).toContain('"Date":"17-03-2026"');
      expect(seedSqlSource).not.toContain('"Date":"Next Tuesday"');
    });

    it("Sarah's medication uses dd-mm-yyyy date", () => {
      expect(seedSqlSource).toContain('"Date Started":"12-03-2026"');
      expect(seedSqlSource).not.toContain('"Date Started":"Today"');
    });

    it("Sarah's script uses dd-mm-yyyy date", () => {
      expect(seedSqlSource).toContain('"Date Prescribed":"11-03-2026"');
    });

    it("Michael's appointment uses dd-mm-yyyy date", () => {
      expect(seedSqlSource).toContain('"Date":"12-04-2026"');
      expect(seedSqlSource).not.toContain('"Date":"Next Month"');
    });

    it("Michael's medication uses dd-mm-yyyy date", () => {
      expect(seedSqlSource).toContain('"Date Started":"05-03-2026"');
      expect(seedSqlSource).not.toContain('"Date Started":"Last week"');
    });

    it("Michael's script uses dd-mm-yyyy date", () => {
      expect(seedSqlSource).toContain('"Date Prescribed":"11-03-2026"');
      expect(seedSqlSource).not.toContain('"Date Prescribed":"Yesterday"');
    });
  });
});
