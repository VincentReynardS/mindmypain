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

export interface MedicationResponse {
  'Brand Name'?: string;
  'Generic Name'?: string;
  Dosage?: string;
  'Date Started'?: string;
  Reason?: string;
  'Side Effects'?: string;
  Feelings?: string;
  'Date Stopped'?: string;
  'Stop Reason'?: string;
  Notes?: string;
}

const MEDICATION_SYSTEM_PROMPT = `
You are a medical scribe extracting medication data from a journal entry.
Extract the medication details and output valid JSON exactly matching these keys:
"Brand Name", "Generic Name", "Dosage", "Date Started", "Reason", "Side Effects", "Feelings", "Date Stopped", "Stop Reason", "Notes".

Omit keys if not mentioned. Be concise.
`;

export async function parseMedication(text: string): Promise<MedicationResponse> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: MEDICATION_SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    const parsed = JSON.parse(content) as MedicationResponse;
    return parsed;
  } catch (error) {
    console.error('Error parsing medication:', error);
    throw new Error('Failed to parse medication from text');
  }
}

export interface ScriptResponse {
  Name?: string;
  'Date Prescribed'?: string;
  Filled?: boolean;
  Notes?: string;
}

const SCRIPT_SYSTEM_PROMPT = `
You are a medical scribe extracting prescription or referral data from a journal entry.
Extract the script/referral details and output valid JSON exactly matching these keys:
"Name", "Date Prescribed", "Filled" (boolean), "Notes".

- "Name" is the medication or doctor name (e.g., "Physiotherapy Referral", "Lyrica 50mg").
- "Filled" should be false by default unless they explicitly say they picked it up.
Omit keys if not mentioned. Be concise.
`;

export async function parseScript(text: string): Promise<ScriptResponse> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: SCRIPT_SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    const parsed = JSON.parse(content) as ScriptResponse;
    return parsed;
  } catch (error) {
    console.error('Error parsing script:', error);
    throw new Error('Failed to parse script from text');
  }
}
