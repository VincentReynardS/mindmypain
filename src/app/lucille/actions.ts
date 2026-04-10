"use server";

export async function verifyLucillePassword(password: string): Promise<boolean> {
  const expected = process.env.LUCILLE_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
