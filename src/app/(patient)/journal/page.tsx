"use client";

/**
 * Journal Page - Daily journal view with voice/text input.
 *
 * Primary patient interaction surface. Integrates:
 * - JournalInput: text area for typing or viewing transcriptions
 * - ScribeControls: mic button, stop, processing state
 * - AudioVisualizer: waveform feedback during recording
 *
 * Existing journal entries (Story 2.2) will be rendered below.
 *
 * @see epics.md - Story 2.1 (Journal Entry Input)
 * @see ux-design-specification.md - "Frictionless Dump"
 */

import { JournalInput } from "@/components/patient/journal-input";
import { ScribeControls } from "@/components/patient/scribe-controls";
import { AudioVisualizer } from "@/components/shared/audio-visualizer";

export default function JournalPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-calm-text">Journal</h1>
        <p className="mt-1 text-sm text-calm-text-muted">
          Capture your thoughts by voice or text.
        </p>
      </div>

      {/* Text input -- auto-fills from voice transcription */}
      <JournalInput />

      {/* Audio visualization -- only shown during recording */}
      <AudioVisualizer />

      {/* Recording controls -- mic, stop, processing */}
      <ScribeControls />
    </div>
  );
}
