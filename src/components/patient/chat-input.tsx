"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="flex items-end gap-2 border-t border-calm-surface-raised bg-calm-surface p-3">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your journal..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-calm-surface-raised bg-calm-surface px-4 py-2.5 text-sm text-calm-text placeholder:text-calm-text-muted focus:outline-none focus:ring-2 focus:ring-calm-blue disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-calm-blue text-white transition-colors duration-calm hover:bg-calm-blue/80 disabled:opacity-50"
        aria-label="Send message"
      >
        <SendHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}
