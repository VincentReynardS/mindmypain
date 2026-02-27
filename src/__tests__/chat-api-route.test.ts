import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}));

const mockChatCreate = vi.fn();

vi.mock("@/lib/openai", () => ({
  getOpenAIClient: vi.fn(() => ({
    chat: {
      completions: {
        create: mockChatCreate,
      },
    },
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ getAll: () => [], set: vi.fn() })),
}));

import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/chat", () => {
  const mockChain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const hybridMock = () => {
      const p = Promise.resolve({ data: [], error: null });
      return Object.assign(p, mockChain);
    };

    mockChain.select.mockImplementation(hybridMock);
    mockChain.eq.mockImplementation(hybridMock);
    mockChain.order.mockImplementation(hybridMock);

    mockFrom.mockReturnValue({
      select: mockChain.select,
    });
    mockChain.select.mockImplementation(hybridMock);

    mockChatCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              answer: "Test answer",
              followUps: [
                "Can you show the most recent entries?",
                "What changed since last week?",
              ],
            }),
          },
        },
      ],
    });
  });

  it("should return 400 if question is missing", async () => {
    const res = await POST(makeRequest({ userId: "sarah" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("question");
  });

  it("should return 400 if userId is missing", async () => {
    const res = await POST(makeRequest({ question: "How is my pain?" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("userId");
  });

  it("should return 400 if question exceeds max length", async () => {
    const res = await POST(
      makeRequest({ question: "x".repeat(2001), userId: "sarah" })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("2000");
  });

  it("should trim history to last 50 messages", async () => {
    const history = Array.from({ length: 60 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Message ${i}`,
    }));

    await POST(
      makeRequest({ question: "Follow up", userId: "sarah", history })
    );

    const messages = mockChatCreate.mock.calls[0][0].messages;
    // system + 50 history + 1 user question = 52
    expect(messages.length).toBe(52);
  });

  it("should query Supabase with correct user_id and status filters", async () => {
    await POST(
      makeRequest({ question: "How did I sleep?", userId: "sarah" })
    );

    expect(mockFrom).toHaveBeenCalledWith("journal_entries");
    expect(mockChain.eq).toHaveBeenCalledWith("user_id", "sarah");
    expect(mockChain.eq).toHaveBeenCalledWith("status", "approved");
  });

  it("should include journal context in system prompt", async () => {
    const entries = [
      {
        id: "1",
        content: "Slept 6 hours",
        entry_type: "journal",
        created_at: "2026-02-20T10:00:00Z",
        ai_response: { Sleep: "6 hours", Pain: "5/10", Mood: "tired" },
      },
    ];

    const hybridWithData = () => {
      const p = Promise.resolve({ data: entries, error: null });
      return Object.assign(p, mockChain);
    };
    mockChain.select.mockImplementation(hybridWithData);
    mockChain.eq.mockImplementation(hybridWithData);
    mockChain.order.mockImplementation(hybridWithData);

    await POST(
      makeRequest({ question: "How did I sleep?", userId: "sarah" })
    );

    expect(mockChatCreate).toHaveBeenCalledTimes(1);
    const messages = mockChatCreate.mock.calls[0][0].messages;
    const systemMsg = messages.find(
      (m: { role: string }) => m.role === "system"
    );
    expect(systemMsg.content).toContain("Slept 6 hours");
  });

  it("should include conversation history in messages", async () => {
    const history = [
      { role: "user", content: "Previous question" },
      { role: "assistant", content: "Previous answer" },
    ];

    await POST(
      makeRequest({
        question: "Follow up",
        userId: "sarah",
        history,
      })
    );

    const messages = mockChatCreate.mock.calls[0][0].messages;
    expect(messages).toContainEqual({
      role: "user",
      content: "Previous question",
    });
    expect(messages).toContainEqual({
      role: "assistant",
      content: "Previous answer",
    });
  });

  it("should return 400 for invalid history role", async () => {
    const res = await POST(
      makeRequest({
        question: "Follow up",
        userId: "sarah",
        history: [{ role: "system", content: "invalid role" }],
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("history");
  });

  it("should return 400 for invalid history content shape", async () => {
    const res = await POST(
      makeRequest({
        question: "Follow up",
        userId: "sarah",
        history: [{ role: "user", content: "" }],
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("history");
  });

  it("should return a successful answer", async () => {
    mockChatCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              answer: "Your pain has been improving.",
              followUps: [
                "What dates show improvement?",
                "How did sleep trend in the same period?",
              ],
            }),
          },
        },
      ],
    });

    const res = await POST(
      makeRequest({ question: "How is my pain?", userId: "sarah" })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.answer).toBe("Your pain has been improving.");
    expect(body.followUps).toEqual([
      "What dates show improvement?",
      "How did sleep trend in the same period?",
    ]);
  });

  it("should return 500 when OpenAI fails", async () => {
    mockChatCreate.mockRejectedValue(new Error("API timeout"));

    const res = await POST(
      makeRequest({ question: "How is my pain?", userId: "sarah" })
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("should handle empty journal entries gracefully", async () => {
    // Default mock already returns empty array
    const res = await POST(
      makeRequest({ question: "How is my pain?", userId: "sarah" })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.answer).toBeDefined();
    expect(Array.isArray(body.followUps)).toBe(true);
    expect(body.followUps.length).toBe(2);
  });

  it("should fall back to deterministic followUps when model output is malformed", async () => {
    mockChatCreate.mockResolvedValue({
      choices: [{ message: { content: "not-json" } }],
    });

    const res = await POST(
      makeRequest({
        question: "How is my sleep?",
        userId: "sarah",
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.answer).toBeDefined();
    expect(Array.isArray(body.followUps)).toBe(true);
    expect(body.followUps.length).toBe(2);
  });

  it("should trim and deduplicate followUps from model output", async () => {
    mockChatCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              answer: "You noted higher pain on two recent dates.",
              followUps: [
                "   What happened on those dates?   ",
                "What happened on those dates?",
                "Can you compare sleep and pain that week?",
                "This suggestion is intentionally far too long to be displayed as a chip in the chat interface and should be trimmed down",
              ],
            }),
          },
        },
      ],
    });

    const res = await POST(
      makeRequest({
        question: "Show pain pattern",
        userId: "sarah",
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.followUps.length).toBe(2);
    expect(body.followUps[0]).toBe("What happened on those dates?");
    expect(body.followUps.every((s: string) => s.length <= 90)).toBe(true);
  });
});
