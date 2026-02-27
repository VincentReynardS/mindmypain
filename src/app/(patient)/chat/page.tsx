"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/patient/chat-message";
import { ChatInput } from "@/components/patient/chat-input";
import { useChatStore } from "@/lib/stores/chat-store";
import { useUserStore } from "@/lib/stores/user-store";

const EXAMPLE_QUESTIONS = [
  "How has my pain been this week?",
  "What patterns do you see in my sleep?",
  "Summarize my recent journal entries",
];

export default function ChatPage() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const setError = useChatStore((s) => s.setError);
  const clearChat = useChatStore((s) => s.clearChat);
  const personaId = useUserStore((s) => s.personaId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const lastAssistantIndex = [...messages]
    .map((msg, idx) => ({ msg, idx }))
    .filter(({ msg }) => msg.role === "assistant")
    .at(-1)?.idx ?? -1;

  // Clear chat when persona changes
  useEffect(() => {
    clearChat();
  }, [personaId, clearChat]);

  // Auto-scroll on new messages or loading change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSubmit(text: string) {
    if (isSubmittingRef.current || isLoading) return;
    if (!personaId) return;

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    addMessage({ role: "user", content: text });
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          userId: personaId,
          history,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get response");
      }

      const data = await res.json();
      addMessage({
        role: "assistant",
        content: data.answer,
        followUps: Array.isArray(data.followUps) ? data.followUps : undefined,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  }

  function handleSuggestionClick(suggestion: string) {
    if (isSubmittingRef.current || isLoading) return;
    void handleSubmit(suggestion);
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      <div className="mb-3">
        <h1 className="text-2xl font-semibold text-calm-text">Ask</h1>
        <p className="mt-1 text-sm text-calm-text-muted">
          Ask questions about your journal history.
        </p>
      </div>

      {/* Scrollable message area */}
      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-calm-surface p-3">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-calm-text-muted">
              Ask a question to get started with your journal insights.
            </p>
            <div className="flex flex-col gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="rounded-xl border border-calm-surface-raised px-4 py-2.5 text-left text-sm text-calm-text transition-colors duration-calm hover:bg-calm-surface-raised"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLastAssistant =
            msg.role === "assistant" && i === lastAssistantIndex;

          return (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              followUps={isLastAssistant ? msg.followUps : undefined}
              onSuggestionClick={
                isLastAssistant ? handleSuggestionClick : undefined
              }
            />
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 rounded-2xl bg-calm-blue-soft px-4 py-3 rounded-bl-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-calm-text-muted" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-calm-text-muted [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-calm-text-muted [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Fixed input at bottom */}
      <ChatInput onSubmit={handleSubmit} disabled={isLoading} />
    </div>
  );
}
