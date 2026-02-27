"use server";

export async function verifyKimPassword(password: string): Promise<boolean> {
  const expected = process.env.KIMS_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
