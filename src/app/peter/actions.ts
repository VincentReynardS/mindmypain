"use server";

export async function verifyPeterPassword(password: string): Promise<boolean> {
  const expected = process.env.PETER_PASSWORD;
  if (!expected) return false;
  return password === expected;
}
