import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "@/lib/stores/chat-store";

describe("Chat Store", () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      isLoading: false,
      error: null,
    });
  });

  it("should have empty initial state", () => {
    const state = useChatStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should add a message via addMessage", () => {
    useChatStore.getState().addMessage({ role: "user", content: "Hello" });
    expect(useChatStore.getState().messages).toHaveLength(1);
    expect(useChatStore.getState().messages[0]).toEqual({
      role: "user",
      content: "Hello",
    });
  });

  it("should append messages in order", () => {
    const { addMessage } = useChatStore.getState();
    addMessage({ role: "user", content: "Q1" });
    addMessage({
      role: "assistant",
      content: "A1",
      followUps: ["What changed since yesterday?", "Show recent pain entries"],
    });
    addMessage({ role: "user", content: "Q2" });

    const msgs = useChatStore.getState().messages;
    expect(msgs).toHaveLength(3);
    expect(msgs[0].role).toBe("user");
    expect(msgs[1].role).toBe("assistant");
    expect(msgs[1].followUps).toEqual([
      "What changed since yesterday?",
      "Show recent pain entries",
    ]);
    expect(msgs[2].content).toBe("Q2");
  });

  it("should clear chat and reset to initial state", () => {
    useChatStore.getState().addMessage({ role: "user", content: "test" });
    useChatStore.getState().setLoading(true);
    useChatStore.getState().setError("some error");

    useChatStore.getState().clearChat();

    const state = useChatStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should set loading state", () => {
    useChatStore.getState().setLoading(true);
    expect(useChatStore.getState().isLoading).toBe(true);

    useChatStore.getState().setLoading(false);
    expect(useChatStore.getState().isLoading).toBe(false);
  });

  it("should set error state", () => {
    useChatStore.getState().setError("Something went wrong");
    expect(useChatStore.getState().error).toBe("Something went wrong");

    useChatStore.getState().setError(null);
    expect(useChatStore.getState().error).toBeNull();
  });
});
