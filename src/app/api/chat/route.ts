import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";
import type { JournalEntry } from "@/types/database";

const MAX_HISTORY_LENGTH = 50;
const MAX_QUESTION_LENGTH = 2000;
const MAX_HISTORY_CONTENT_LENGTH = 2000;
const MAX_CONTENT_LENGTH = 500;
const MAX_FOLLOW_UP_LENGTH = 90;
const MAX_FOLLOW_UPS = 2;
const MIN_FOLLOW_UPS = 2;

interface ChatRequestBody {
  question: string;
  userId: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

const chatHistoryItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(MAX_HISTORY_CONTENT_LENGTH),
});

const chatRequestSchema = z.object({
  question: z.string().trim().min(1).max(MAX_QUESTION_LENGTH),
  userId: z.string().trim().min(1),
  history: z.array(chatHistoryItemSchema).optional(),
});

const chatResponseSchema = z.object({
  answer: z.string().min(1),
  followUps: z.array(z.string()),
});

function serializeEntries(entries: JournalEntry[]): string {
  if (entries.length === 0) return "No journal entries found.";

  return entries
    .map((e) => {
      const date = new Date(e.created_at).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const ai = e.ai_response as Record<string, unknown> | null;
      const truncatedContent = e.content && e.content.length > MAX_CONTENT_LENGTH
        ? e.content.slice(0, MAX_CONTENT_LENGTH) + "…"
        : e.content;
      let details = `[${date}] ${e.entry_type}: ${truncatedContent}`;

      if (ai) {
        const scalarFields = ["Sleep", "Pain", "Mood", "Feeling", "Action", "Grateful", "Medication", "Note"]
          .filter((k) => ai[k])
          .map((k) => `${k}: ${ai[k]}`)
          .join(", ");
        if (scalarFields) details += ` | ${scalarFields}`;

        const arrayFields = ["Appointments", "Scripts"]
          .filter((k) => Array.isArray(ai[k]) && (ai[k] as unknown[]).length > 0)
          .map((k) => `${k}: ${JSON.stringify(ai[k])}`)
          .join(", ");
        if (arrayFields) details += ` | ${arrayFields}`;
      }

      return details;
    })
    .join("\n");
}

function extractJsonFromModelContent(content: string): unknown {
  const trimmed = content.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // keep trying
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch && fencedMatch[1]) {
    try {
      return JSON.parse(fencedMatch[1].trim());
    } catch {
      // keep trying
    }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  return null;
}

function getFallbackFollowUps(question: string, answer: string): string[] {
  const corpus = `${question} ${answer}`.toLowerCase();

  if (corpus.includes("sleep")) {
    return [
      "What dates mention sleep changes?",
      "How did pain compare on low-sleep days?",
      "Can you summarize my recent sleep trend?",
    ];
  }

  if (corpus.includes("pain")) {
    return [
      "Which dates had the highest pain notes?",
      "What journal details appeared around those pain flares?",
      "Has my pain pattern changed recently?",
    ];
  }

  if (corpus.includes("medication") || corpus.includes("meds")) {
    return [
      "Which entries mention medication updates?",
      "What side effects were recorded in those entries?",
      "Can you list medication notes by date?",
    ];
  }

  return [
    "Can you point to the exact dates for that?",
    "What related details appear in those same entries?",
    "Can you summarize the last week on this topic?",
  ];
}

function toQuestion(text: string): string {
  let cleaned = text.replace(/\s+/g, " ").trim();
  cleaned = cleaned.replace(/^[-*•\d\.\)\s]+/, "");
  cleaned = cleaned.replace(/[.!\s]+$/, "");
  if (!cleaned) return "";

  const startsLikeQuestion = /^(can|could|would|should|what|when|where|which|who|whom|whose|why|how|is|are|do|did|does|has|have|was|were)\b/i.test(cleaned);

  if (!cleaned.endsWith("?")) {
    if (startsLikeQuestion) {
      cleaned = `${cleaned}?`;
    } else {
      const lowerFirst = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
      cleaned = `Can you ${lowerFirst}?`;
    }
  }

  return (
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  ).slice(0, MAX_FOLLOW_UP_LENGTH).trim();
}

function sanitizeFollowUps(
  followUps: unknown,
  question: string,
  answer: string
): string[] {
  const base = Array.isArray(followUps) ? followUps : [];
  const normalized = base
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .map((item) => toQuestion(item))
    .filter(Boolean);

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const item of normalized) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  const fallback = getFallbackFollowUps(question, answer);
  for (const item of fallback) {
    if (deduped.length >= MIN_FOLLOW_UPS) break;
    const cleaned = toQuestion(item);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(cleaned);
    }
  }

  return deduped.slice(0, MAX_FOLLOW_UPS);
}

const SYSTEM_PROMPT = `You are a warm, empathetic health journal assistant for the MINDmyPAIN app. Your role is to help users recall and understand their journal history.

Rules:
- ONLY answer based on the provided journal data below. Never make up information.
- Cite specific dates when referencing entries.
- Never diagnose, prescribe, or give medical advice.
- If the data doesn't contain the answer, say "I don't have that information in your journal entries."
- Use a warm, supportive tone.
- Keep answers concise but helpful.
- Return valid JSON ONLY with this shape:
  {
    "answer": "string",
    "followUps": ["string", "string"]
  }
- followUps must contain exactly 2 distinct, context-grounded next questions based on your answer and journal evidence.
- Each follow-up must be phrased as a direct user question they can click and send immediately (like "How has my pain been this week?"), not a statement or instruction.`;

export async function POST(request: NextRequest) {
  try {
    const rawBody = (await request.json()) as unknown;

    if (
      rawBody &&
      typeof rawBody === "object" &&
      "question" in rawBody &&
      !(rawBody as Record<string, unknown>).question
    ) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }

    if (
      rawBody &&
      typeof rawBody === "object" &&
      "userId" in rawBody &&
      !(rawBody as Record<string, unknown>).userId
    ) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const parsedBody = chatRequestSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      const questionIssue = parsedBody.error.issues.find(
        (issue) => issue.path[0] === "question"
      );
      if (questionIssue?.code === "too_big") {
        return NextResponse.json(
          { error: `question must be ${MAX_QUESTION_LENGTH} characters or less` },
          { status: 400 }
        );
      }

      if (questionIssue || !rawBody || typeof rawBody !== "object" || !("question" in rawBody)) {
        return NextResponse.json(
          { error: "question is required" },
          { status: 400 }
        );
      }

      const userIdIssue = parsedBody.error.issues.find(
        (issue) => issue.path[0] === "userId"
      );
      if (userIdIssue || !("userId" in (rawBody as Record<string, unknown>))) {
        return NextResponse.json(
          { error: "userId is required" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error:
            "history must be an array of { role: 'user' | 'assistant', content: string }",
        },
        { status: 400 }
      );
    }

    const body: ChatRequestBody = {
      ...parsedBody.data,
      history: (parsedBody.data.history ?? []).slice(-MAX_HISTORY_LENGTH),
    };

    const supabase = await createClient();
    const { data: entries, error: dbError } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", body.userId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("[chat] Supabase query failed:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch journal entries" },
        { status: 500 }
      );
    }

    const context = serializeEntries(entries || []);

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\n--- Journal Data ---\n${context}`,
      },
      ...(body.history || []),
      { role: "user", content: body.question },
    ];

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.3,
      max_tokens: 1024,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "chat_answer_with_followups",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              answer: { type: "string" },
              followUps: {
                type: "array",
                minItems: MIN_FOLLOW_UPS,
                maxItems: MAX_FOLLOW_UPS,
                items: { type: "string" },
              },
            },
            required: ["answer", "followUps"],
          },
        },
      },
    });

    const rawContent =
      completion.choices[0]?.message?.content ||
      "I wasn't able to generate a response. Please try again.";
    const jsonPayload = extractJsonFromModelContent(rawContent);
    const parsed = chatResponseSchema.safeParse(jsonPayload);

    const answer = parsed.success
      ? parsed.data.answer.trim() || "I wasn't able to generate a response. Please try again."
      : rawContent.trim() || "I wasn't able to generate a response. Please try again.";
    const followUps = sanitizeFollowUps(
      parsed.success ? parsed.data.followUps : [],
      body.question,
      answer
    );

    return NextResponse.json({ answer, followUps });
  } catch (err) {
    console.error("[chat] Chat completion failed:", err);

    const message = err instanceof Error ? err.message : "Chat failed";

    return NextResponse.json(
      { error: `Chat failed: ${message}` },
      { status: 500 }
    );
  }
}
