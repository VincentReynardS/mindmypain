/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import fs from "fs";
import path from "path";

import { ChatMessage } from "@/components/patient/chat-message";
import { ChatInput } from "@/components/patient/chat-input";
import { useAudioStore } from "@/lib/stores/audio-store";

const { startRecordingMock, stopRecordingMock, useTranscriptionMock } =
  vi.hoisted(() => ({
    startRecordingMock: vi.fn(),
    stopRecordingMock: vi.fn(),
    useTranscriptionMock: vi.fn(),
  }));

vi.mock("@/hooks/use-audio-recorder", () => ({
  useAudioRecorder: () => ({
    startRecording: startRecordingMock,
    stopRecording: stopRecordingMock,
  }),
}));

vi.mock("@/hooks/use-transcription", () => ({
  useTranscription: useTranscriptionMock,
}));

const chatPageSource = fs.readFileSync(
  path.resolve(__dirname, "../app/(patient)/chat/page.tsx"),
  "utf-8"
);

const chatMessageSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/chat-message.tsx"),
  "utf-8"
);

const chatInputSource = fs.readFileSync(
  path.resolve(__dirname, "../components/patient/chat-input.tsx"),
  "utf-8"
);

beforeEach(() => {
  useAudioStore.getState().reset();
  startRecordingMock.mockReset();
  stopRecordingMock.mockReset();
  useTranscriptionMock.mockReset();
});

describe("Chat UI Components", () => {
  describe("ChatMessage component — source guardrails", () => {
    it("should use calm design tokens", () => {
      expect(chatMessageSource).toContain("bg-calm-surface-raised");
      expect(chatMessageSource).toContain("bg-calm-blue-soft");
    });

    it("should constrain max width to 80%", () => {
      expect(chatMessageSource).toContain("max-w-[80%]");
    });

    it("should use 300ms transitions", () => {
      expect(chatMessageSource).toMatch(/transition|duration-calm/);
    });
  });

  describe("ChatMessage component — behavioral", () => {
    it("should render message content", () => {
      render(<ChatMessage role="user" content="Hello there" />);
      expect(screen.getByText("Hello there")).toBeDefined();
    });

    it("should right-align user messages", () => {
      const { container } = render(
        <ChatMessage role="user" content="User msg" />
      );
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).toContain("justify-end");
    });

    it("should left-align assistant messages", () => {
      const { container } = render(
        <ChatMessage role="assistant" content="Bot msg" />
      );
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).toContain("justify-start");
    });

    it("should apply user styling for user messages", () => {
      const { container } = render(
        <ChatMessage role="user" content="User msg" />
      );
      const bubble = container.querySelector("[class*='bg-calm-surface-raised']");
      expect(bubble).not.toBeNull();
    });

    it("should apply assistant styling for assistant messages", () => {
      const { container } = render(
        <ChatMessage role="assistant" content="Bot msg" />
      );
      const bubble = container.querySelector("[class*='bg-calm-blue-soft']");
      expect(bubble).not.toBeNull();
    });

    it("should render follow-up chips for assistant messages", () => {
      render(
        <ChatMessage
          role="assistant"
          content="Bot msg"
          followUps={["What changed?", "Show recent entries"]}
        />
      );

      expect(screen.getByRole("button", { name: "What changed?" })).toBeDefined();
      expect(
        screen.getByRole("button", { name: "Show recent entries" })
      ).toBeDefined();
    });

    it("should not render follow-up chips for user messages", () => {
      render(
        <ChatMessage
          role="user"
          content="User msg"
          followUps={["Should not appear"]}
        />
      );

      expect(
        screen.queryByRole("button", { name: "Should not appear" })
      ).toBeNull();
    });

    it("should call suggestion click callback when chip is clicked", () => {
      const onSuggestionClick = vi.fn();
      render(
        <ChatMessage
          role="assistant"
          content="Bot msg"
          followUps={["Ask about sleep"]}
          onSuggestionClick={onSuggestionClick}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Ask about sleep" }));
      expect(onSuggestionClick).toHaveBeenCalledWith("Ask about sleep");
    });
  });

  describe("ChatInput component — source guardrails", () => {
    it("should have a 44px minimum touch target", () => {
      expect(chatInputSource).toMatch(/h-11|min-h-\[44px\]|h-12/);
    });

    it("should import SendHorizontal icon", () => {
      expect(chatInputSource).toContain("SendHorizontal");
    });

    it("should accept onSubmit and disabled props", () => {
      expect(chatInputSource).toContain("onSubmit");
      expect(chatInputSource).toContain("disabled");
    });

    it("should import Mic icon for voice recording", () => {
      expect(chatInputSource).toContain("Mic");
    });

    it("should import useAudioStore for audio state", () => {
      expect(chatInputSource).toContain("useAudioStore");
    });

    it("should import useAudioRecorder for recording", () => {
      expect(chatInputSource).toContain("useAudioRecorder");
    });

    it("should import useTranscription hook", () => {
      expect(chatInputSource).toContain("useTranscription");
    });

    it("should have a >44px mic button touch target", () => {
      // Mic button uses h-12 w-12 = 48px
      expect(chatInputSource).toMatch(/h-12\s+w-12/);
    });

    it("should show stop button during recording", () => {
      expect(chatInputSource).toContain("Stop recording");
      expect(chatInputSource).toContain("Square");
    });

    it("should show processing state", () => {
      expect(chatInputSource).toContain("Processing audio");
      expect(chatInputSource).toContain("Loader2");
    });

    it("should have dynamic placeholder for voice states", () => {
      expect(chatInputSource).toContain("Listening...");
      expect(chatInputSource).toContain("Transcribing...");
    });
  });

  describe("ChatInput component — behavioral", () => {
    it("should disable send button when text is empty", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={false} />);
      const button = screen.getByRole("button", { name: /send message/i });
      expect(button).toHaveProperty("disabled", true);
    });

    it("should disable textarea when disabled prop is true", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={true} />);
      const textarea = screen.getByPlaceholderText(/ask about your journal/i);
      expect(textarea).toHaveProperty("disabled", true);
    });

    it("should call onSubmit with trimmed text on Enter", () => {
      const onSubmit = vi.fn();
      render(<ChatInput onSubmit={onSubmit} disabled={false} />);
      const textarea = screen.getByPlaceholderText(/ask about your journal/i);

      fireEvent.change(textarea, { target: { value: "  Hello  " } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

      expect(onSubmit).toHaveBeenCalledWith("Hello");
    });

    it("should NOT submit on Shift+Enter", () => {
      const onSubmit = vi.fn();
      render(<ChatInput onSubmit={onSubmit} disabled={false} />);
      const textarea = screen.getByPlaceholderText(/ask about your journal/i);

      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should clear text after submit", () => {
      const onSubmit = vi.fn();
      render(<ChatInput onSubmit={onSubmit} disabled={false} />);
      const textarea = screen.getByPlaceholderText(
        /ask about your journal/i
      ) as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

      expect(textarea.value).toBe("");
    });

    it("should submit on send button click", () => {
      const onSubmit = vi.fn();
      render(<ChatInput onSubmit={onSubmit} disabled={false} />);
      const textarea = screen.getByPlaceholderText(/ask about your journal/i);
      const button = screen.getByRole("button", { name: /send message/i });

      fireEvent.change(textarea, { target: { value: "Click submit" } });
      fireEvent.click(button);

      expect(onSubmit).toHaveBeenCalledWith("Click submit");
    });
  });

  describe("ChatInput component — voice behavioral", () => {
    it("should render mic button in idle state", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={false} />);
      expect(
        screen.getByRole("button", { name: /start voice recording/i })
      ).toBeDefined();
    });

    it("should show stop button when recording", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={false} />);
      // Set state after mount (reset() runs on mount)
      act(() => {
        useAudioStore.setState({ isRecording: true });
      });
      expect(
        screen.getByRole("button", { name: /stop recording/i })
      ).toBeDefined();
      expect(
        screen.queryByRole("button", { name: /start voice recording/i })
      ).toBeNull();
    });

    it("should call startRecording when mic button is clicked", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={false} />);
      fireEvent.click(
        screen.getByRole("button", { name: /start voice recording/i })
      );
      expect(startRecordingMock).toHaveBeenCalledTimes(1);
    });

    it("should call stopRecording when stop button is clicked", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={false} />);
      act(() => {
        useAudioStore.setState({ isRecording: true });
      });
      fireEvent.click(screen.getByRole("button", { name: /stop recording/i }));
      expect(stopRecordingMock).toHaveBeenCalledTimes(1);
    });

    it("should show processing spinner when processing", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={false} />);
      act(() => {
        useAudioStore.setState({ isProcessing: true });
      });
      expect(screen.getByRole("status", { name: /processing audio/i })).toBeDefined();
    });

    it("should disable textarea during recording", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={false} />);
      act(() => {
        useAudioStore.setState({ isRecording: true });
      });
      const textarea = screen.getByPlaceholderText("Listening...");
      expect(textarea).toHaveProperty("disabled", true);
    });

    it("should show Transcribing placeholder during processing", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={false} />);
      act(() => {
        useAudioStore.setState({ isProcessing: true });
      });
      expect(screen.getByPlaceholderText("Transcribing...")).toBeDefined();
    });

    it("should display audio error", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={false} />);
      act(() => {
        useAudioStore.setState({ error: "Mic denied" });
      });
      expect(screen.getByRole("alert").textContent).toBe("Mic denied");
    });

    it("should pipe transcribed text into the chat input", () => {
      render(<ChatInput onSubmit={vi.fn()} disabled={false} />);
      act(() => {
        useAudioStore.setState({ transcribedText: "Voice text" });
      });
      const textarea = screen.getByDisplayValue("Voice text");
      expect(textarea).toBeDefined();
      expect(useAudioStore.getState().transcribedText).toBe("");
    });
  });

  describe("Chat page — source guardrails", () => {
    it('should be a client component with "use client"', () => {
      expect(chatPageSource).toContain('"use client"');
    });

    it("should use atomic selectors for stores", () => {
      expect(chatPageSource).toMatch(/useChatStore\(\(s\) =>/);
      expect(chatPageSource).toMatch(/useUserStore\(\(s\) =>/);
    });

    it("should use calm design tokens", () => {
      expect(chatPageSource).toMatch(/calm-/);
    });

    it("should implement auto-scroll via scrollIntoView", () => {
      expect(chatPageSource).toContain("scrollIntoView");
    });

    it("should fetch from /api/chat", () => {
      expect(chatPageSource).toContain("/api/chat");
    });

    it("should include a synchronous in-flight submit guard", () => {
      expect(chatPageSource).toContain("isSubmittingRef");
      expect(chatPageSource).toMatch(/isSubmittingRef\.current \|\| isLoading/);
    });

    it("should display empty state text", () => {
      expect(chatPageSource).toMatch(/no messages|ask|journal|get started/i);
    });

    it("should import ChatMessage and ChatInput components", () => {
      expect(chatPageSource).toContain("ChatMessage");
      expect(chatPageSource).toContain("ChatInput");
    });
  });
});
