"use client";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { SendHorizontal, Mic, Square, Loader2 } from "lucide-react";
import { useAudioStore } from "@/lib/stores/audio-store";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useTranscription } from "@/hooks/use-transcription";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    resizeTextarea();
  }, [text, resizeTextarea]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        resizeTextarea();
      });
      observer.observe(el);
      return () => observer.disconnect();
    }

    const handleWindowResize = () => {
      resizeTextarea();
    };
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [resizeTextarea]);

  const isRecording = useAudioStore((s) => s.isRecording);
  const isProcessing = useAudioStore((s) => s.isProcessing);
  const transcribedText = useAudioStore((s) => s.transcribedText);
  const audioError = useAudioStore((s) => s.error);
  const resetTranscribedText = useAudioStore((s) => s.resetTranscribedText);

  const { startRecording, stopRecording } = useAudioRecorder();
  useTranscription();

  // Reset audio store on mount and unmount to avoid stale state leaking between pages
  useEffect(() => {
    useAudioStore.getState().reset();
    return () => {
      useAudioStore.getState().reset();
    };
  }, []);

  // Pipe transcribed text into textarea
  useEffect(() => {
    if (transcribedText) {
      const timeoutId = window.setTimeout(() => {
        setText((prev) => {
          if (prev.trim()) {
            return `${prev}\n${transcribedText}`;
          }
          return transcribedText;
        });
        resetTranscribedText();
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [transcribedText, resetTranscribedText]);

  const voiceBusy = isRecording || isProcessing;

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setText("");
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const placeholder = isRecording
    ? "Listening..."
    : isProcessing
      ? "Transcribing..."
      : "Ask about your journal...";

  return (
    <div className="flex flex-col border-t border-calm-surface-raised bg-calm-surface">
      <div className="flex items-end gap-2 p-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || voiceBusy}
          rows={1}
          className="max-h-32 flex-1 resize-none overflow-y-auto rounded-xl border border-calm-surface-raised bg-calm-surface px-4 py-2.5 text-sm text-calm-text placeholder:text-calm-text-muted focus:outline-none focus:ring-2 focus:ring-calm-blue disabled:opacity-50"
        />

        {/* Mic / Stop / Processing button */}
        {!isRecording && !isProcessing && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-calm-surface-raised text-calm-text transition-colors duration-calm hover:bg-calm-blue hover:text-white disabled:opacity-50"
            aria-label="Start voice recording"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive text-white animate-pulse transition-colors duration-calm"
            aria-label="Stop recording"
          >
            <Square className="h-5 w-5" />
          </button>
        )}

        {isProcessing && (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-calm-purple-soft"
            role="status"
            aria-label="Processing audio"
          >
            <Loader2 className="h-5 w-5 animate-spin text-calm-purple" />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={disabled || !text.trim() || voiceBusy}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-calm-blue text-white transition-colors duration-calm hover:bg-calm-blue/80 disabled:opacity-50"
          aria-label="Send message"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>

      {audioError && (
        <p className="px-3 pb-2 text-sm text-destructive" role="alert">
          {audioError}
        </p>
      )}
    </div>
  );
}
