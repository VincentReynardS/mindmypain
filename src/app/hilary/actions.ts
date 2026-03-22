"use server";

export async function verifyHilaryPassword(password: string): Promise<boolean> {
  const expected = process.env.HILARYS_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
