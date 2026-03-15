"use client";

/**
 * Home Page - Main patient interaction surface with voice/text input and full entry list.
 *
 * Integrates:
 * - JournalInput: text area for typing or viewing transcriptions
 * - ScribeControls: mic button, stop, processing state
 * - AudioVisualizer: waveform feedback during recording
 * - JournalEntryList: date-grouped list of ALL existing entries
 *
 * @see epics.md - Story 2.1 (Journal Entry Input), Story 2.2 (Daily List View)
 * @see ux-design-specification.md - "Frictionless Dump"
 */

import { useEffect } from "react";
import { JournalInput } from "@/components/patient/journal-input";
import { ScribeControls } from "@/components/patient/scribe-controls";
import { AudioVisualizer } from "@/components/shared/audio-visualizer";
import { JournalEntryList } from "@/components/patient/journal-entry-list";
import { useJournalStore } from "@/lib/stores/journal-store";
import { useUserStore } from "@/lib/stores/user-store";

export default function HomePage() {
  const personaId = useUserStore((s) => s.personaId);
  const fetchEntries = useJournalStore((s) => s.fetchEntries);
  const clearEntries = useJournalStore((s) => s.clearEntries);

  useEffect(() => {
    if (personaId) {
      clearEntries();
      fetchEntries(personaId);
    }
  }, [personaId, fetchEntries, clearEntries]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-calm-text">Home</h1>
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

      {/* Separator between input and history */}
      <hr className="border-border" />

      {/* Date-grouped journal entry list */}
      <JournalEntryList />
    </div>
  );
}
