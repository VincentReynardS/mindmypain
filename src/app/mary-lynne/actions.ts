"use server";

export async function verifyMaryLynnePassword(password: string): Promise<boolean> {
  const expected = process.env.MARY_LYNNES_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
