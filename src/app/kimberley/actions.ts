"use server";

export async function verifyKimberleyPassword(password: string): Promise<boolean> {
  const expected = process.env.KIMBERLEY_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
