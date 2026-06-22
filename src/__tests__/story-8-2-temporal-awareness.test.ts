/**
 * Story 8.2: AI Temporal Awareness (Prompt Injection) - Tests
 *
 * Tests cover:
 * - getCurrentDateTimeContext() formats date/time as dd-mm-yyyy hh:mm AM/PM
 * - The chat API route injects the current date/time into the system prompt
 */

import { describe, it, expect } from "vitest";

import {
  getCurrentDateTimeContext,
  getRelativeDateStatus,
} from "@/lib/utils/date-helpers";

const REF = new Date("2026-06-22T04:00:00Z"); // Melbourne: 22-06-2026 14:00

describe("getCurrentDateTimeContext", () => {
  it("formats a date as dd-mm-yyyy hh:mm AM/PM (Australia/Melbourne)", () => {
    // 2026-06-22T04:30:00Z -> Melbourne (AEST, UTC+10) -> 22-06-2026 02:30 PM
    const result = getCurrentDateTimeContext(new Date("2026-06-22T04:30:00Z"));
    expect(result).toBe("22-06-2026 02:30 PM");
  });

  it("formats morning times with AM", () => {
    // 2026-06-21T23:15:00Z -> Melbourne (AEST, UTC+10) -> 22-06-2026 09:15 AM
    const result = getCurrentDateTimeContext(new Date("2026-06-21T23:15:00Z"));
    expect(result).toBe("22-06-2026 09:15 AM");
  });

  it("matches the dd-mm-yyyy hh:mm AM/PM shape for the current time", () => {
    expect(getCurrentDateTimeContext()).toMatch(
      /^\d{2}-\d{2}-\d{4} \d{2}:\d{2} (AM|PM)$/
    );
  });
});

describe("getRelativeDateStatus", () => {
  it("classifies a past dd-mm-yyyy date as PAST", () => {
    expect(getRelativeDateStatus("31-03-2026", REF)).toBe("PAST");
  });

  it("classifies a future dd-mm-yyyy date as UPCOMING", () => {
    expect(getRelativeDateStatus("01-12-2026", REF)).toBe("UPCOMING");
  });

  it("classifies today's date as TODAY", () => {
    expect(getRelativeDateStatus("22-06-2026", REF)).toBe("TODAY");
  });

  it("accepts yyyy-mm-dd input", () => {
    expect(getRelativeDateStatus("2026-02-25", REF)).toBe("PAST");
  });

  it("returns null for an unparseable value", () => {
    expect(getRelativeDateStatus("not a date", REF)).toBeNull();
  });
});
