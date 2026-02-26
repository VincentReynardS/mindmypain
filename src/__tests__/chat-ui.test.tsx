/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import fs from "fs";
import path from "path";

import { ChatMessage } from "@/components/patient/chat-message";
import { ChatInput } from "@/components/patient/chat-input";

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

    it("should display empty state text", () => {
      expect(chatPageSource).toMatch(/no messages|ask|journal|get started/i);
    });

    it("should import ChatMessage and ChatInput components", () => {
      expect(chatPageSource).toContain("ChatMessage");
      expect(chatPageSource).toContain("ChatInput");
    });
  });
});
