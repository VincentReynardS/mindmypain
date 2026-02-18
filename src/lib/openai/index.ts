import "server-only";
import OpenAI from "openai";

/**
 * OpenAI client singleton for Whisper API access.
 * Used for voice-to-text transcription in the Scribe feature.
 *
 * The "server-only" import ensures this module can never be
 * accidentally imported in a Client Component, which would
 * leak the OPENAI_API_KEY.
 *
 * Architecture: lib/openai/index.ts
 * @see architecture.md - Voice-to-Text Strategy (Decision 3)
 */

let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it to .env.local (see .env.local.example)."
      );
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}
