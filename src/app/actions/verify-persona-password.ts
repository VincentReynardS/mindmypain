"use server";

import { HIDDEN_PERSONAS, type HiddenPersonaId } from "@/lib/persona-config";

function isHiddenPersonaId(id: string): id is HiddenPersonaId {
  return Object.prototype.hasOwnProperty.call(HIDDEN_PERSONAS, id);
}

export async function verifyPersonaPassword(
  personaId: string,
  password: string
): Promise<boolean> {
  if (!isHiddenPersonaId(personaId)) return false;
  const expected = process.env[HIDDEN_PERSONAS[personaId].envVarName];
  if (!expected) return false;
  return password === expected;
}
