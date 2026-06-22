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
const MEDICATION_KEYS = [
  "Brand Name",
  "Generic Name",
  "Dosage",
  "Date Started",
  "Side Effects",
  "Feelings",
  "Date Stopped",
  "Stop Reason",
] as const;
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

function hasMedicationStructuredFields(value: Record<string, unknown>): boolean {
  return MEDICATION_KEYS.some((key) => getNonEmptyString(value[key]));
}

function parseLegacyJsonContent(content: string): Record<string, unknown> | null {
  try {
    return asObject(JSON.parse(content));
  } catch {
    return null;
  }
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

export type MedicationCategory = "prescription" | "supplement";

export interface IncomingMedication {
  "Brand Name"?: unknown;
  "Generic Name"?: unknown;
  [key: string]: unknown;
}

function medicationAi(entry: JournalEntry): Record<string, unknown> | null {
  return asObject(entry.ai_response);
}

/**
 * Reads a medication entry's category. Defaults to "prescription" when unset
 * so legacy medication entries continue to appear in the prescription summary.
 */
export function getMedicationCategory(entry: JournalEntry): MedicationCategory {
  const ai = medicationAi(entry);
  return ai?.Category === "supplement" ? "supplement" : "prescription";
}

/**
 * A medication is considered inactive when it has been explicitly flagged
 * (`Is Active === false`) or when a stop date has been recorded.
 */
export function isMedicationActive(entry: JournalEntry): boolean {
  const ai = medicationAi(entry);
  if (!ai) return true;
  if (ai["Is Active"] === false) return false;
  if (getNonEmptyString(ai["Date Stopped"])) return false;
  return true;
}

/**
 * Builds the patient-facing label: `Brand Name Dosage (Generic Name)`.
 * Parts that are missing are omitted so the label always reads naturally.
 */
export function formatMedicationLabel(entry: JournalEntry): string {
  const ai = medicationAi(entry) ?? {};
  const brand = getNonEmptyString(ai["Brand Name"]);
  const dosage = getNonEmptyString(ai.Dosage);
  const generic = getNonEmptyString(ai["Generic Name"]);

  const head = [brand, dosage].filter(Boolean).join(" ");
  if (head && generic) return `${head} (${generic})`;
  if (head) return head;
  if (generic) return generic;
  return getNonEmptyString(entry.content) ?? "Medication";
}

/**
 * Groups dedicated medication entries into the three Active Summary sections.
 */
export function groupMedicationEntries(medications: JournalEntry[]): {
  activePrescriptions: JournalEntry[];
  activeSupplements: JournalEntry[];
  inactive: JournalEntry[];
} {
  const activePrescriptions: JournalEntry[] = [];
  const activeSupplements: JournalEntry[] = [];
  const inactive: JournalEntry[] = [];

  for (const entry of medications) {
    if (!isMedicationActive(entry)) {
      inactive.push(entry);
    } else if (getMedicationCategory(entry) === "supplement") {
      activeSupplements.push(entry);
    } else {
      activePrescriptions.push(entry);
    }
  }

  return { activePrescriptions, activeSupplements, inactive };
}

function normalizeMedicationName(value: unknown): string | null {
  const name = getNonEmptyString(value);
  return name ? name.toLowerCase().replace(/\s+/g, " ") : null;
}

/**
 * Deduplication helper: finds an existing ACTIVE medication entry that matches
 * the incoming parsed medication by brand or generic name (case-insensitive).
 * Returns null when there is no name to match or no active match exists.
 */
export function findDuplicateActiveMedication(
  incoming: IncomingMedication,
  existing: JournalEntry[]
): JournalEntry | null {
  const incomingBrand = normalizeMedicationName(incoming["Brand Name"]);
  const incomingGeneric = normalizeMedicationName(incoming["Generic Name"]);
  if (!incomingBrand && !incomingGeneric) return null;

  for (const entry of existing) {
    if (!isMedicationActive(entry)) continue;
    const ai = medicationAi(entry);
    if (!ai) continue;

    const brand = normalizeMedicationName(ai["Brand Name"]);
    const generic = normalizeMedicationName(ai["Generic Name"]);

    if (incomingBrand && (incomingBrand === brand || incomingBrand === generic)) return entry;
    if (incomingGeneric && (incomingGeneric === brand || incomingGeneric === generic)) return entry;
  }

  return null;
}

/**
 * Merges a re-mentioned medication into an existing active record (deduplication).
 * Meaningful incoming fields overwrite the existing values - this is how a "stopped"
 * mention propagates `Is Active: false` / `Date Stopped` onto the original entry so it
 * moves to the Inactive section, rather than silently being discarded. Empty incoming
 * strings never clobber existing data. Always stamps `Last Mentioned`.
 */
export function mergeMedicationMention(
  existingAi: Record<string, unknown>,
  incoming: Record<string, unknown>,
  mentionDate: string
): JsonObject {
  const merged: Record<string, unknown> = { ...existingAi };

  for (const [key, value] of Object.entries(incoming)) {
    if (key === "_intent") continue;
    if (typeof value === "string") {
      if (value.trim().length > 0) merged[key] = value;
    } else if (typeof value === "boolean") {
      merged[key] = value;
    }
  }

  merged["Last Mentioned"] = mentionDate;
  return withPersistedIntent(merged, "medication");
}

export function selectMedicationEntries(entries: JournalEntry[]): {
  medications: JournalEntry[];
  mentions: { entryId: string; date: string; medication: string }[];
  toBackfill: BackfillIntent[];
} {
  const medications: JournalEntry[] = [];
  const mentions: { entryId: string; date: string; medication: string }[] = [];
  const toBackfill: BackfillIntent[] = [];

  for (const entry of entries) {
    const ai = asObject(entry.ai_response);

    if (ai) {
      if (typeof ai._intent === "string") {
        if (ai._intent === "medication") {
          medications.push(entry);
        }
        if (ai._intent === "journal") {
          const mention = getNonEmptyString(ai.Medication);
          if (mention) mentions.push({ entryId: entry.id, date: entry.created_at, medication: mention });
        }
        continue;
      }

      if (hasMedicationStructuredFields(ai)) {
        medications.push(entry);
        toBackfill.push({ id: entry.id, intent: "medication" });
        continue;
      }

      const mention = getNonEmptyString(ai.Medication);
      if (mention) {
        mentions.push({ entryId: entry.id, date: entry.created_at, medication: mention });
      }
      continue;
    }

    const legacyContent = parseLegacyJsonContent(entry.content);
    if (legacyContent && hasMedicationStructuredFields(legacyContent)) {
      medications.push(entry);
      toBackfill.push({ id: entry.id, intent: "medication" });
    }
  }

  return { medications, mentions, toBackfill };
}
