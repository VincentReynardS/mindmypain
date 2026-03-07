import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI client
// Note: This requires OPENAI_API_KEY environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_ID = 'gpt-4o';

// === Intent Classification ===

const INTENT_CLASSIFICATION_PROMPT = `
You are an intelligent medical triage assistant for a chronic pain patient's journal.
Your task is to classify the patient's unstructured journal entry.

Categories:
- "appointment": The user is discussing a doctor's visit, consultation, therapist, or any health practitioner meeting.
- "medication": The user is discussing taking a medication, dosage, or side effect.
- "script": The user is talking about prescriptions or referrals.
- "journal": A multi-topic daily entry, a general narrative, tasks, reminders, or any other content.

Rule: If the entry is PRIMARILY about an appointment, classify it as "appointment".
Rule: For short, social, or ambiguous greetings (e.g., "hi", "hello", "test"), default to "journal".
Rule: When in doubt, always default to "journal".
Output MUST be valid JSON: {"intent": "..."}
`;

export async function classifyIntent(text: string): Promise<'appointment' | 'medication' | 'script' | 'journal'> {
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
    return parsed.intent || 'journal'; // Fallback to journal
  } catch (error) {
    console.error('Error classifying intent:', error);
    return 'journal'; // Safe fallback
  }
}

// === Parsing Daily Journal ===

const MOOD_SCALE = [
  'Excellent', 'Fantastic', 'Happy', 'Great', 'Good', 'Joyful', 
  'Ok', 'Content', 'Grateful', 'Flat', 'Tired', 'Sad', 
  'Annoyed', 'Frustrated', 'Anxious', 'Groggy', 'Sore', 
  'Achy', 'Nauseated', 'Terrible', 'Sick', 'Angry'
] as const;

const JournalResponseSchema = z.object({
  Sleep: z.coerce.string().nullish(),
  Pain: z.coerce.string().nullish(),
  Feeling: z.coerce.string().nullish(),
  Action: z.coerce.string().nullish(),
  Grateful: z.coerce.string().nullish(),
  Medication: z.coerce.string().nullish(),
  Mood: z.string().nullish(), // Relaxed to string to prevent enum mismatch 500s
  Note: z.coerce.string().nullish(),
  // Multi-intent support:
  Appointments: z.array(z.object({
    'Practitioner Name': z.string().nullish(),
    'Visit Type': z.string().nullish(),
    'Profession': z.string().nullish(),
    'Date': z.string().nullish(),
    'Time': z.string().nullish(),
    'Location': z.string().nullish(),
    'Reason': z.string().nullish(),
    'Notes': z.string().nullish(),
  })).nullish(),
  Scripts: z.array(z.object({
    'Name': z.string().nullish(),
    'Details/Context': z.string().nullish(),
    'Filled': z.boolean().nullish().default(false),
  })).nullish(),
});

export type JournalResponse = z.infer<typeof JournalResponseSchema>;

const JOURNAL_SYSTEM_PROMPT = `
You are an expert medical triage assistant helping chronic pain patients record their daily health journal.
MINDmyPAIN users often merge multiple thoughts into one entry. Your task is to perform a comprehensive extraction.

Output MUST be valid JSON with these keys:
"Sleep", "Pain", "Feeling", "Action", "Grateful", "Medication", "Mood", "Note", "Appointments", "Scripts".

Extraction Rules:
1. HEALTH DATA:
   - "Sleep": Hours or quality.
   - "Pain": Score out of 10.
   - "Mood": MUST be one of: ${MOOD_SCALE.join(', ')}.
   - "Feeling", "Action", "Grateful", "Medication": Map relevant text.
   - "Note": Catch-all for ANY portion of the input that doesn't fit the structured fields above (e.g. tasks, reminders, financial notes, general thoughts). IMPORTANT: Even when other fields are populated, any remaining content that wasn't extracted into a specific field MUST go into "Note". Never discard user input.
   - If input contains multiple note-like fragments (e.g. prior daily note + new update), merge them into ONE coherent "Note" that reads naturally, without duplication, while preserving important details.

2. APPOINTMENTS (If mentioned):
   - Extract into "Appointments" array. Use keys: "Practitioner Name", "Visit Type", "Profession", "Date", "Time", "Location", "Reason", "Notes".

3. SCRIPTS (If mentioned):
   - Extract prescription refills or referrals into "Scripts" array. Use keys: "Name" (e.g. "Panadol Script"), "Details/Context", "Filled" (default false).

If a field or array is empty/not mentioned, set it to null or an empty array []. Be concise.
`;

export async function parseJournal(text: string): Promise<JournalResponse> {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text cannot be empty');
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: JOURNAL_SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    const parsed = JSON.parse(content);
    const result = JournalResponseSchema.parse(parsed);

    // Fallback: if AI returned semantically empty data, preserve raw text in Note.
    // This treats empty strings/arrays/objects and false booleans as non-meaningful.
    const hasMeaningfulData = (value: unknown): boolean => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return true;
      if (typeof value === 'boolean') return value;
      if (Array.isArray(value)) return value.some(hasMeaningfulData);
      if (typeof value === 'object') {
        return Object.values(value as Record<string, unknown>).some(hasMeaningfulData);
      }
      return false;
    };

    if (!hasMeaningfulData(result)) {
      result.Note = text;
    }

    return result;
  } catch (error) {
    console.error('Error parsing journal:', error);
    // Fallback: preserve raw text in Feeling + Note instead of throwing
    return JournalResponseSchema.parse({
      Sleep: null, Pain: null, Feeling: text.substring(0, 500),
      Action: null, Grateful: null, Medication: null, Mood: null,
      Note: text, Appointments: null, Scripts: null,
    });
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
