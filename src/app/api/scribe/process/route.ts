import { NextRequest, NextResponse } from "next/server";

/**
 * Audio Upload & Processing Pipeline
 * Receives audio from the Scribe interface, sends to Whisper API,
 * and returns transcribed text.
 * Will be fully implemented in Story 2.1 (Journal Entry Input).
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { message: "Scribe processing endpoint - not yet implemented" },
    { status: 501 }
  );
}
