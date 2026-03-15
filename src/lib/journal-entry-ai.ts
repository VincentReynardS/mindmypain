import type { JsonObject, JournalEntry } from "@/types/database";
import { normalizeOptionalDateDDMMYYYY } from "@/lib/utils/date-helpers";

export type EntryIntent = "appointment" | "medication" | "script" | "immunisation" | "journal";

type BackfillIntent = { id: string; intent: EntryIntent };
const ENTRY_INTENTS = new Set<EntryIntent>(["appointment", "medication", "script", "immunisation", "journal"]);

const JOURNAL_KEYS = new Set([
  "Sleep",
  "Pain",
  "Feeling",
  "Action",
  "Grateful",
  "Medication",
  "Mood",
  "Note",
  "Appointments",
  "Scripts",
]);
const NON_JOURNAL_INTENTS = new Set<EntryIntent>(["appointment", "medication", "script", "immunisation"]);
const RAW_TEXT_MEDICAL_PATTERNS = [
  /\b(appointment|appt|consult|follow-up|doctor|dr\.?|specialist|physio|clinic|visit|referral)\b/i,
  /\b(medication|medicine|meds|tablet|capsule|dosage|dose|prescription|script|refill|repeat|pharmacy|chemist)\b/i,
  /\b(vaccine|vaccination|immuni[sz]ation|booster|flu shot|covid shot|tetanus)\b/i,
];

function getNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function detectLegacyIntent(aiResponse: Record<string, unknown>): EntryIntent | null {
  if (getNonEmptyString(aiResponse["Practitioner Name"]) || getNonEmptyString(aiResponse["Visit Type"])) {
    return "appointment";
  }
  if (getNonEmptyString(aiResponse["Vaccine Name"])) return "immunisation";
  if (
    getNonEmptyString(aiResponse["Brand Name"]) ||
    getNonEmptyString(aiResponse["Generic Name"]) ||
    getNonEmptyString(aiResponse.Dosage)
  ) {
    return "medication";
  }
  if (getNonEmptyString(aiResponse.Name) && typeof aiResponse.Filled === "boolean") {
    return "script";
  }
  return "journal";
}

function isLikelyMedicalRawText(content: string): boolean {
  return RAW_TEXT_MEDICAL_PATTERNS.some((pattern) => pattern.test(content));
}

export function isJournalDisplayShape(response: Record<string, unknown>): boolean {
  const keys = Object.keys(response);
  if (keys.length === 0) return false;
  const hasKnownJournalKey = keys.some((key) => JOURNAL_KEYS.has(key));
  const hasForeignKey = keys.some((key) => !JOURNAL_KEYS.has(key));
  return hasKnownJournalKey && !hasForeignKey;
}

export function getPersistedIntent(intent: EntryIntent, usedJournalSafetyNet: boolean): EntryIntent {
  return usedJournalSafetyNet ? "journal" : intent;
}

export function isEntryIntent(value: unknown): value is EntryIntent {
  return typeof value === "string" && ENTRY_INTENTS.has(value as EntryIntent);
}

export function isJournalReflectionEntry(entry: JournalEntry): boolean {
  const ai = asObject(entry.ai_response);
  const persistedIntent = ai ? ai._intent : null;

  if (isEntryIntent(persistedIntent)) {
    return !NON_JOURNAL_INTENTS.has(persistedIntent);
  }

  if (entry.entry_type === "raw_text") {
    return !isLikelyMedicalRawText(entry.content);
  }

  if (ai) {
    return detectLegacyIntent(ai) === "journal";
  }

  return entry.entry_type === "journal";
}

export function withPersistedIntent(aiResponse: Record<string, unknown>, intent: EntryIntent): JsonObject {
  return {
    ...aiResponse,
    _intent: intent,
  } as JsonObject;
}

export function normalizeImmunisationAiResponse(aiResponse: Record<string, unknown>): JsonObject {
  const normalizedDate = normalizeOptionalDateDDMMYYYY(getNonEmptyString(aiResponse["Date Given"]));
  if (getNonEmptyString(aiResponse["Date Given"]) && !normalizedDate) {
    throw new Error("Date Given must be a valid dd-mm-yyyy date");
  }

  return {
    ...aiResponse,
    "Date Given": normalizedDate,
  } as JsonObject;
}

export function selectImmunisationEntries(entries: JournalEntry[]): {
  immunisations: JournalEntry[];
  toBackfill: BackfillIntent[];
} {
  const immunisations: JournalEntry[] = [];
  const toBackfill: BackfillIntent[] = [];

  for (const entry of entries) {
    const ai = asObject(entry.ai_response);
    if (!ai) continue;

    if (typeof ai._intent === "string") {
      if (ai._intent === "immunisation") {
        immunisations.push(entry);
      }
      continue;
    }

    if (getNonEmptyString(ai["Vaccine Name"])) {
      immunisations.push(entry);
      toBackfill.push({ id: entry.id, intent: "immunisation" });
    }
  }

  return { immunisations, toBackfill };
}
