import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  followUps?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatMessage({
  role,
  content,
  followUps,
  onSuggestionClick,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className="max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm transition-all duration-calm",
            isUser
              ? "bg-calm-surface-raised text-calm-text rounded-br-sm"
              : "bg-calm-blue-soft text-calm-text rounded-bl-sm"
          )}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
        {!isUser && followUps && followUps.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {followUps.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="min-h-11 rounded-full border border-calm-surface-raised bg-calm-surface px-3 py-2 text-left text-xs text-calm-text transition-colors duration-calm hover:bg-calm-surface-raised"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
