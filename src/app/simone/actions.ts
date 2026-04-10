"use server";

export async function verifySimonePassword(password: string): Promise<boolean> {
  const expected = process.env.SIMONE_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
