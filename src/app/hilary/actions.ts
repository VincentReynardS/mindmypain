"use server";

import { headers } from "next/headers";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;

interface AttemptState {
  count: number;
  windowStart: number;
  blockedUntil: number;
}

const attemptsByClient = new Map<string, AttemptState>();

function getClientKey(headerStore: Headers): string {
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headerStore.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function getAttemptState(clientKey: string, now: number): AttemptState {
  const existing = attemptsByClient.get(clientKey);
  if (!existing) {
    return { count: 0, windowStart: now, blockedUntil: 0 };
  }

  if (now - existing.windowStart >= WINDOW_MS) {
    return { count: 0, windowStart: now, blockedUntil: 0 };
  }

  return existing;
}

export async function __resetHilaryLoginRateLimitForTests() {
  attemptsByClient.clear();
}

export async function verifyHilaryPassword(password: string): Promise<boolean> {
  const expected = process.env.HILARYS_PASSWORD;
  if (!expected) return false;

  let clientKey = "unknown";
  try {
    const headerStore = await headers();
    clientKey = getClientKey(headerStore);
  } catch {
    // In isolated unit tests, request headers might be unavailable.
  }

  const now = Date.now();
  const state = getAttemptState(clientKey, now);
  if (state.blockedUntil > now) {
    return false;
  }

  const isValid = password === expected;
  if (isValid) {
    attemptsByClient.delete(clientKey);
    return true;
  }

  const nextCount = state.count + 1;
  const blockedUntil = nextCount >= MAX_ATTEMPTS ? now + WINDOW_MS : 0;

  attemptsByClient.set(clientKey, {
    count: nextCount,
    windowStart: state.windowStart,
    blockedUntil,
  });

  return false;
}
