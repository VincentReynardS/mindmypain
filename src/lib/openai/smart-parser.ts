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

export interface ClinicalSummaryResponse {
  chief_complaint: string;
  medication_review: string;
  patient_goal: string;
}

const CLINICAL_SUMMARY_SYSTEM_PROMPT = `
You are an expert, empathetic medical scribe assisting chronic pain patients.
Your task is to analyze unstructured journal entries and create a professional clinical summary for a doctor's review.

Output MUST be valid JSON with the following structure:
{
  "chief_complaint": "The primary pain or symptom concern extracted from the text.",
  "medication_review": "Any mentions of medications, dosages, side effects, or adherence issues.",
  "patient_goal": "What the patient explicitly or implicitly wants from the upcoming appointment."
}

Rules:
- Use professional medical terminology where appropriate but keep the patient's voice.
- If a section cannot be inferred, state "Not reported".
- Be concise and objective.
`;

export async function generateClinicalSummary(text: string): Promise<ClinicalSummaryResponse> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: CLINICAL_SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    const parsed = JSON.parse(content) as ClinicalSummaryResponse;
    return parsed;
  } catch (error) {
    console.error('Error generating clinical summary:', error);
    throw new Error('Failed to generate clinical summary from text');
  }
}
