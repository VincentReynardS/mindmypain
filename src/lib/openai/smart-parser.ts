import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI client
// Note: This requires OPENAI_API_KEY environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_ID = 'gpt-5.2';

// === Intent Classification ===

const INTENT_CLASSIFICATION_PROMPT = `
You are an intelligent medical triage assistant for a chronic pain patient's journal.
Your task is to classify the patient's unstructured journal entry into one of the following categories:
- "appointment": The user is talking about a current or upcoming doctor's visit, consultation, or health practitioner appointment.
- "medication": The user is discussing taking a medication, changing a dosage, or noting a side effect.
- "script": The user is specifically talking about a prescription to be filled, a referral to be given, or a script they received.
- "agenda": A general entry about their pain, feelings, or questions that don't fit the above categories.

Output MUST be valid JSON with the following structure:
{
  "intent": "<appointment | medication | script | agenda>"
}
`;

export async function classifyIntent(text: string): Promise<'appointment' | 'medication' | 'script' | 'agenda'> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: INTENT_CLASSIFICATION_PROMPT },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    const parsed = JSON.parse(content);
    return parsed.intent || 'agenda';
  } catch (error) {
    console.error('Error classifying intent:', error);
    throw new Error(`Failed to classify intent from text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// === Parsing Agendas ===

const AgendaItemSchema = z.object({
  category: z.string(),
  item: z.string()
});

export type AgendaItem = z.infer<typeof AgendaItemSchema>;

const AgendaResponseSchema = z.object({
  agenda_items: z.array(AgendaItemSchema),
  questions: z.array(z.string()).optional()
});

export type AgendaResponse = z.infer<typeof AgendaResponseSchema>;

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

    const parsed = JSON.parse(content);
    return AgendaResponseSchema.parse(parsed);
  } catch (error) {
    console.error('Error parsing agenda:', error);
    throw new Error(`Failed to parse agenda from text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// === Parsing Clinical Summaries ===

const ClinicalSummaryResponseSchema = z.object({
  chief_complaint: z.string(),
  medication_review: z.string(),
  patient_goal: z.string()
});

export type ClinicalSummaryResponse = z.infer<typeof ClinicalSummaryResponseSchema>;

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

    const parsed = JSON.parse(content);
    return ClinicalSummaryResponseSchema.parse(parsed);
  } catch (error) {
    console.error('Error generating clinical summary:', error);
    throw new Error(`Failed to generate clinical summary from text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// === Parsing Medications ===

const MedicationResponseSchema = z.object({
  'Brand Name': z.string().optional(),
  'Generic Name': z.string().optional(),
  Dosage: z.string().optional(),
  'Date Started': z.string().optional(),
  Reason: z.string().optional(),
  'Side Effects': z.string().optional(),
  Feelings: z.string().optional(),
  'Date Stopped': z.string().optional(),
  'Stop Reason': z.string().optional(),
  Notes: z.string().optional()
});

export type MedicationResponse = z.infer<typeof MedicationResponseSchema>;

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

    const parsed = JSON.parse(content);
    return MedicationResponseSchema.parse(parsed);
  } catch (error) {
    console.error('Error parsing medication:', error);
    throw new Error(`Failed to parse medication from text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// === Parsing Scripts ===

const ScriptResponseSchema = z.object({
  Name: z.string().optional(),
  'Date Prescribed': z.string().optional(),
  Filled: z.boolean().default(false).optional(),
  Notes: z.string().optional()
});

export type ScriptResponse = z.infer<typeof ScriptResponseSchema>;

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

    const parsed = JSON.parse(content);
    return ScriptResponseSchema.parse(parsed);
  } catch (error) {
    console.error('Error parsing script:', error);
    throw new Error(`Failed to parse script from text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// === Parsing Appointments ===

const AppointmentResponseSchema = z.object({
  Date: z.string().optional(),
  Profession: z.string().optional(),
  'Practitioner Name': z.string().optional(),
  'Visit Type': z.string().optional(),
  Location: z.string().optional(),
  Reason: z.string().optional(),
  'Admin Needs': z.array(z.enum(['Referral', 'Prescription', 'Medical Certificate', 'Imaging Request', 'Blood Test'])).optional(),
  Questions: z.string().optional(),
  Outcomes: z.string().optional(),
  'Follow-up Questions': z.string().optional(),
  Notes: z.string().optional()
});

export type AppointmentData = z.infer<typeof AppointmentResponseSchema>;

const APPOINTMENT_SYSTEM_PROMPT = `
You are a medical scribe extracting appointment data from a journal entry.
Extract the appointment details and output valid JSON exactly matching these keys:
"Date", "Profession", "Practitioner Name", "Visit Type", "Location", "Reason", "Admin Needs" (array of strings), "Questions", "Outcomes", "Follow-up Questions", "Notes".

Omit keys if not mentioned. Be concise. For "Admin Needs", allowed values are: 'Referral', 'Prescription', 'Medical Certificate', 'Imaging Request', 'Blood Test'.
`;

export async function parseAppointment(text: string): Promise<AppointmentData> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: APPOINTMENT_SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    const parsed = JSON.parse(content);
    return AppointmentResponseSchema.parse(parsed);
  } catch (error) {
    console.error('Error parsing appointment:', error);
    throw new Error(`Failed to parse appointment from text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

