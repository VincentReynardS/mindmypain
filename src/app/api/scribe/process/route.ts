import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

/**
 * Audio Upload & Processing Pipeline
 *
 * Receives audio from the Scribe interface via multipart form data,
 * sends to OpenAI Whisper API for transcription, and returns text.
 *
 * @see architecture.md - Voice-to-Text Strategy (Decision 3)
 * @see epics.md - Story 2.1 AC: 4, 5
 */
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB - Whisper API limit
const ALLOWED_MIME_PREFIXES = ["audio/", "video/webm"]; // video/webm covers webm containers with audio

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file size (Whisper API max = 25MB)
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Audio file exceeds 25MB limit" },
        { status: 413 }
      );
    }

    // Validate MIME type
    const isAllowedType = ALLOWED_MIME_PREFIXES.some((prefix) =>
      audioFile.type.startsWith(prefix)
    );
    if (!isAllowedType) {
      return NextResponse.json(
        { error: `Unsupported file type: ${audioFile.type}` },
        { status: 415 }
      );
    }

    const openai = getOpenAIClient();

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err) {
    console.error("[scribe/process] Whisper transcription failed:", err);

    const message =
      err instanceof Error ? err.message : "Transcription failed";

    return NextResponse.json(
      { error: `Transcription failed: ${message}` },
      { status: 500 }
    );
  }
}
