"use client";

/**
 * ScribeControls - Voice recording interface for journal input.
 *
 * Provides a large mic button to start recording, a stop button,
 * and a processing indicator. On stop, sends audio to /api/scribe/process
 * for Whisper transcription.
 *
 * Touch targets are >=44px per WCAG / NFR_ACC2.
 * Uses "Calm" design tokens for soothing aesthetic.
 *
 * @see architecture.md - Audio Pipeline
 * @see ux-design-specification.md - "Frictionless Dump" (<2s to record)
 */

import { Mic, Square, Loader2 } from "lucide-react";
import { useAudioStore } from "@/lib/stores/audio-store";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useTranscription } from "@/hooks/use-transcription";

/** Format seconds into mm:ss */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ScribeControls() {
  const isRecording = useAudioStore((s) => s.isRecording);
  const isProcessing = useAudioStore((s) => s.isProcessing);
  const duration = useAudioStore((s) => s.duration);
  const error = useAudioStore((s) => s.error);

  const { startRecording, stopRecording } = useAudioRecorder();
  useTranscription();

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Duration display */}
      {isRecording && (
        <span
          className="font-mono text-sm text-calm-text-muted"
          aria-live="polite"
          aria-label={`Recording duration: ${formatDuration(duration)}`}
        >
          {formatDuration(duration)}
        </span>
      )}

      {/* Recording controls */}
      <div className="flex items-center gap-4">
        {!isRecording && !isProcessing && (
          <button
            onClick={startRecording}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-calm-blue text-white shadow-md transition-all duration-[--transition-duration-calm] hover:bg-calm-blue/90 hover:shadow-lg active:scale-95"
            aria-label="Start recording"
          >
            <Mic className="h-6 w-6" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive text-white shadow-md transition-all duration-[--transition-duration-calm] hover:bg-destructive/90 active:scale-95"
            aria-label="Stop recording"
          >
            <Square className="h-5 w-5" />
          </button>
        )}

        {isProcessing && (
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-calm-purple-soft"
            role="status"
            aria-label="Processing audio"
          >
            <Loader2 className="h-6 w-6 animate-spin text-calm-purple" />
          </div>
        )}
      </div>

      {/* Status text */}
      {isRecording && (
        <p className="text-sm text-calm-text-muted" aria-live="polite">
          Listening... tap stop when done
        </p>
      )}
      {isProcessing && (
        <p className="text-sm text-calm-purple" aria-live="polite">
          Looking for patterns...
        </p>
      )}

      {/* Error display */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
