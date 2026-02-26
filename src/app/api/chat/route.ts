import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";
import type { JournalEntry } from "@/types/database";

const MAX_HISTORY_LENGTH = 50;
const MAX_QUESTION_LENGTH = 2000;
const MAX_CONTENT_LENGTH = 500;

interface ChatRequestBody {
  question: string;
  userId: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

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

const SYSTEM_PROMPT = `You are a warm, empathetic health journal assistant for the MINDmyPAIN app. Your role is to help users recall and understand their journal history.

Rules:
- ONLY answer based on the provided journal data below. Never make up information.
- Cite specific dates when referencing entries.
- Never diagnose, prescribe, or give medical advice.
- If the data doesn't contain the answer, say "I don't have that information in your journal entries."
- Use a warm, supportive tone.
- Keep answers concise but helpful.`;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;

    if (!body.question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (body.question.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { error: `question must be ${MAX_QUESTION_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    if (body.history && body.history.length > MAX_HISTORY_LENGTH) {
      body.history = body.history.slice(-MAX_HISTORY_LENGTH);
    }

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
    });

    const answer = completion.choices[0]?.message?.content || "I wasn't able to generate a response. Please try again.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[chat] Chat completion failed:", err);

    const message = err instanceof Error ? err.message : "Chat failed";

    return NextResponse.json(
      { error: `Chat failed: ${message}` },
      { status: 500 }
    );
  }
}
