"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/stores/audio-store";

/**
 * useTranscription - Watches audioBlob from the audio store and sends it
 * to /api/scribe/process for Whisper transcription.
 *
 * Extracted from ScribeControls so both ScribeControls and ChatInput
 * can reuse the same transcription logic.
 */
export function useTranscription() {
  const isRecording = useAudioStore((s) => s.isRecording);
  const audioBlob = useAudioStore((s) => s.audioBlob);
  const transcribedBlobRef = useRef<Blob | null>(null);

  const transcribeAudio = useCallback(async (blob: Blob) => {
    const { setProcessing, setTranscribedText, setError } =
      useAudioStore.getState();

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const response = await fetch("/api/scribe/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Transcription failed";
        const rawBody = await response.text().catch(() => "");
        if (rawBody.trim()) {
          try {
            const data = JSON.parse(rawBody) as { error?: unknown };
            if (typeof data.error === "string" && data.error.trim()) {
              message = data.error;
            } else {
              message = rawBody;
            }
          } catch {
            message = rawBody;
          }
        }
        throw new Error(message);
      }

      const data = await response.json();
      setTranscribedText(data.text);
      // Clear the blob so no other hook instance re-processes it
      useAudioStore.getState().setAudioBlob(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Transcription failed";
      setError(message);
    } finally {
      setProcessing(false);
    }
  }, []);

  // When audioBlob becomes available after recording stops, transcribe it.
  // Guard with ref to prevent duplicate transcription of the same blob.
  useEffect(() => {
    if (audioBlob && !isRecording && audioBlob !== transcribedBlobRef.current) {
      transcribedBlobRef.current = audioBlob;
      transcribeAudio(audioBlob);
    }
  }, [audioBlob, isRecording, transcribeAudio]);
}
