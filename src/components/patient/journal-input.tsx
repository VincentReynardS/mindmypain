"use client";

/**
 * JournalInput - Text input area for journal entries.
 *
 * Auto-fills with transcribed text from the audio store.
 * Allows manual text editing for direct-typing input flow.
 * Uses "Calm" design tokens for soft, accessible styling.
 *
 * @see epics.md - Story 2.1 AC: 5, 6
 * @see ux-design-specification.md - "Calm Confidence" principle
 */

import { useState, useEffect } from "react";
import { useAudioStore } from "@/lib/stores/audio-store";

export function JournalInput() {
  const transcribedText = useAudioStore((s) => s.transcribedText);
  const isProcessing = useAudioStore((s) => s.isProcessing);
  const [text, setText] = useState("");

  // Sync transcribed text from store into local state
  useEffect(() => {
    if (transcribedText) {
      setText((prev) => {
        // Append transcribed text to existing content with separator
        if (prev.trim()) {
          return `${prev}\n${transcribedText}`;
        }
        return transcribedText;
      });
    }
  }, [transcribedText]);

  return (
    <div className="w-full">
      <label htmlFor="journal-input" className="sr-only">
        Journal entry
      </label>
      <textarea
        id="journal-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          isProcessing
            ? "Transcribing your thoughts..."
            : "What's on your mind? Type or use the mic..."
        }
        disabled={isProcessing}
        className="min-h-30 w-full resize-y rounded-xl border border-border/60 bg-calm-surface-raised p-4 text-base text-calm-text placeholder:text-calm-text-muted/60 transition-all duration-[--transition-duration-calm] focus:border-calm-blue focus:outline-none focus:ring-2 focus:ring-calm-blue/20 disabled:opacity-50"
        rows={4}
        aria-label="Journal entry text input"
      />
    </div>
  );
}
