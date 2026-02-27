/**
 * Server Actions for Journal Entries
 * 
 * Implements mutation logic for the "Glass Box" pattern:
 * - Update: Modify draft content
 * - Approve: Commit draft to record
 * - Process: AI Smart Parsing
 * 
 * @see 2-3-glass-box-card-component.md - Task 1
 * @see 2-4-integration-smart-parsing.md - Task 2
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NewJournalEntry, UpdateJournalEntry } from '@/types/database';

export async function createJournalEntry(
  content: string, 
  userId: string, 
  entryType: 'raw_text' | 'clinical_summary' = 'raw_text'
) {
  const supabase = await createClient();
  const { classifyIntent } = await import('@/lib/openai/smart-parser');

  // 1. Classify intent to decide on appending logic
  const intent = await classifyIntent(content);

  // 2. For 'journal' intent, check if a raw_text entry for "today" already exists to append to
  if (intent === 'journal') {
    const today = new Date().toISOString().split('T')[0];

    const { data: existingEntry } = await supabase
      .from('journal_entries')
      .select('id, content, entry_type, ai_response')
      .eq('user_id', userId)
      .in('entry_type', ['raw_text', 'journal'])
      .eq('status', 'draft')
      .filter('created_at', 'gte', `${today}T00:00:00Z`)
      .filter('created_at', 'lte', `${today}T23:59:59Z`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string; content: string; entry_type: string; ai_response: Record<string, unknown> | null }>();

    // Only merge into raw_text (unprocessed) or journal entries with journal-shaped ai_response.
    // Appointments, medications, and scripts also get entry_type='journal' after processing,
    // so we check for the 'Sleep' key to confirm it's actually a daily journal entry.
    const isJournalShaped = existingEntry?.entry_type === 'raw_text' ||
      (existingEntry?.entry_type === 'journal' && (!existingEntry.ai_response || 'Sleep' in existingEntry.ai_response));

    if (existingEntry && isJournalShaped) {
      const updatedContent = `${existingEntry.content}\n\n${content}`;
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({
          content: updatedContent,
          status: 'draft',
          entry_type: 'raw_text',
          ai_response: null,
        } as never)
        .eq('id', existingEntry.id);

      if (updateError) throw new Error(updateError.message);

      revalidatePath('/journal');
      return existingEntry.id;
    }
  }

  // 3. Create new raw_text entry — user will click Organize to classify and parse
  const newEntry: NewJournalEntry = {
    user_id: userId,
    content,
    status: 'draft',
    entry_type: 'raw_text',
  };

  const { data, error } = await supabase
    .from('journal_entries')
    .insert(newEntry as any)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/journal');
  return data.id;
}


export async function updateJournalEntry(id: string, updates: UpdateJournalEntry) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('journal_entries')
    // TODO: Regenerate types to fix inference
    .update(updates as never)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/journal');
}

export async function updateAppointmentEntry(id: string, content: string) {
  await updateJournalEntry(id, { content });
  revalidatePath('/appointments');
}

export async function updateMedicationEntry(id: string, content: string) {
  await updateJournalEntry(id, { content });
  revalidatePath('/medications');
}

export async function approveAppointmentEntry(id: string) {
  await approveJournalEntry(id);
  revalidatePath('/appointments');
}

export async function approveMedicationEntry(id: string) {
  await approveJournalEntry(id);
  revalidatePath('/medications');
}

export async function approveJournalEntry(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('journal_entries')
    // TODO: Regenerate types to fix inference
    .update({ status: 'approved' } as never)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/journal');
}

export async function processJournalEntry(id: string) {
  const supabase = await createClient();

  // 1. Fetch current content
  const { data: entry, error: fetchError } = await supabase
    .from('journal_entries')
    .select('content, entry_type')
    .eq('id', id)
    .single<{ content: string; entry_type: string }>();

  if (fetchError || !entry) {
    throw new Error('Entry not found');
  }

  // 2. Classify intent and call the appropriate parser
  try {
    const { classifyIntent } = await import('@/lib/openai/smart-parser');
    const intent = await classifyIntent(entry.content || '');

    let aiResponse;

    switch (intent) {
      case 'medication': {
        const { parseMedication } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseMedication(entry.content || '');
        break;
      }
      case 'appointment': {
        const { parseAppointment } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseAppointment(entry.content || '');
        break;
      }
      case 'script': {
        const { parseScript } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseScript(entry.content || '');
        break;
      }
      case 'journal':
      default: {
        const { parseJournal } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseJournal(entry.content || '');
        break;
      }
    }

    // 3. Update Entry with "Glass Box" state — all become entry_type='journal'
    const updatePayload: UpdateJournalEntry = {
      entry_type: 'journal',
      // @ts-ignore - Supabase type definition mismatch for JSON fields
      ai_response: aiResponse,
      status: 'draft' // Keep as draft for user review
    };

    const { error: updateError } = await supabase
      .from('journal_entries')
      .update(updatePayload as never)
      .eq('id', id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath('/journal');
    return { success: true };

  } catch (err) {
    console.error('Process Entry Failed:', err, (err as Error).stack);
    // Fallback: create synthetic ai_response so entry never stays as raw_text
    const syntheticResponse = {
      Sleep: null, Pain: null, Feeling: (entry.content || '').substring(0, 500),
      Action: null, Grateful: null, Medication: null, Mood: null,
      Note: entry.content || '', Appointments: null, Scripts: null,
    };
    const { error: fallbackError } = await supabase
      .from('journal_entries')
      .update({ entry_type: 'journal', ai_response: syntheticResponse, status: 'draft' } as never)
      .eq('id', id);
    if (fallbackError) throw new Error(fallbackError.message);
    revalidatePath('/journal');
    return { success: true };
  }
}

export async function updateJournalAiResponse(
  id: string,
  aiResponse: object,
  contentText: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('journal_entries')
    .update({
      ai_response: aiResponse,
      content: contentText,
    } as never)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/journal');
  revalidatePath('/appointments');
  revalidatePath('/medications');
  revalidatePath('/scripts');
}

export async function updateScriptOrReferralEntry(id: string, isFilled: boolean) {
  const supabase = await createClient();

  // Handle virtual IDs from Daily Journal extraction
  if (id.includes('_script_')) {
    const [realId, , indexStr] = id.split('_');
    const index = parseInt(indexStr, 10);

    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .select('ai_response')
      .eq('id', realId)
      .single<{ ai_response: any }>();

    if (entryError || !entry) throw new Error(entryError?.message || 'Entry not found');

    if (entry?.ai_response?.Scripts) {
      const scripts = [...entry.ai_response.Scripts];
      if (scripts[index]) {
        scripts[index] = { ...scripts[index], Filled: isFilled };
        const { error } = await supabase
          .from('journal_entries')
          .update({ ai_response: { ...entry.ai_response, Scripts: scripts } } as never)
          .eq('id', realId);
        
        if (error) throw new Error(error.message);
      }
    }
    revalidatePath('/scripts');
    revalidatePath('/journal');
    return;
  }

  // Legacy/Normal Script Entry Update
  const { data: entry, error: fetchError } = await supabase
    .from('journal_entries')
    .select('content, ai_response')
    .eq('id', id)
    .single<{ content: string; ai_response: any }>();
    
  if (fetchError || !entry) {
    throw new Error('Entry not found');
  }
  
  let parsedContent = {};
  try {
    parsedContent = JSON.parse(entry.content || '{}');
  } catch (e) {
    console.error('Failed to parse script content', e);
  }

  const updatedContent = JSON.stringify({
    ...parsedContent,
    Filled: isFilled
  });

  const updatedAiResponse = entry.ai_response && entry.ai_response.Name ? {
    ...entry.ai_response,
    Filled: isFilled
  } : entry.ai_response;

  const { error } = await supabase
    .from('journal_entries')
    // TODO: Regenerate types to fix inference
    .update({ content: updatedContent, ai_response: updatedAiResponse } as never)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/scripts');
  revalidatePath('/journal');
}
