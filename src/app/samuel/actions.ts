"use server";

export async function verifySamuelPassword(password: string): Promise<boolean> {
  const expected = process.env.SAMUEL_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
