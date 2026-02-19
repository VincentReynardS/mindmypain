import OpenAI from 'openai';

// Initialize OpenAI client
// Note: This requires OPENAI_API_KEY environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_ID = 'gpt-5.2';

export interface AgendaItem {
  category: string;
  item: string;
}

export interface AgendaResponse {
  agenda_items: AgendaItem[];
  questions?: string[];
}

const SYSTEM_PROMPT = `
You are an expert medical scribe and organizer helping chronic pain patients.
Your task is to analyze unstructured journal entries and organize them into clear, actionable agenda items.

Output MUST be valid JSON with the following structure:
{
  "agenda_items": [
    { "category": "Clinical", "item": "Right knee pain flared up" },
    { "category": "Admin", "item": "Call Dr. Smith for refill" }
  ],
  "questions": [ "Ask about increasing Lyrica dosage" ]
}

Categories can be: Clinical, Admin, Medication, Lifestyle, Question.
Keep items concise.
`;

export async function parseAgenda(text: string): Promise<AgendaResponse> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID, 
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    const parsed = JSON.parse(content) as AgendaResponse;
    return parsed;
  } catch (error) {
    console.error('Error parsing agenda:', error);
    throw new Error('Failed to parse agenda from text');
  }
}
