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
import { parseAgenda } from '@/lib/openai/smart-parser';

export async function createJournalEntry(
  content: string, 
  userId: string, 
  entryType: 'raw_text' | 'clinical_summary' = 'raw_text'
) {
  const supabase = await createClient();
  const { classifyIntent } = await import('@/lib/openai/smart-parser');

  // 1. Classify intent first to decide on appending logic
  const intent = await classifyIntent(content);

  // If specialized intent, ALWAYS create a new entry
  if (intent === 'appointment' || intent === 'medication' || intent === 'script') {
    const newEntry: NewJournalEntry = {
      user_id: userId,
      content,
      status: 'approved',
      entry_type: 'raw_text',
    };

    const { data, error } = await supabase
      .from('journal_entries')
      .insert(newEntry as any)
      .select('id')
      .single<{ id: string }>();

    if (error) throw new Error(error.message);
    revalidatePath('/journal');
    return data.id;
  }

  // 2. For 'journal' intent, check if an entry for "today" already exists
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existingEntry } = await supabase
    .from('journal_entries')
    .select('id, content, entry_type')
    .eq('user_id', userId)
    .eq('entry_type', 'journal')
    .filter('created_at', 'gte', `${today}T00:00:00Z`)
    .filter('created_at', 'lte', `${today}T23:59:59Z`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string; content: string; entry_type: string }>();

  if (existingEntry) {
    // 3. Update existing 'journal' entry
    const updatedContent = `${existingEntry.content}\n\n${content}`;
    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({ 
        content: updatedContent,
        status: 'draft',
        entry_type: 'journal',
        ai_response: null,
      } as never)
      .eq('id', existingEntry.id);

    if (updateError) throw new Error(updateError.message);
    
    revalidatePath('/journal');
    return existingEntry.id;
  }

  // 4. Create new entry if intent is journal but no existing journal entry for today
  const newEntry: NewJournalEntry = {
    user_id: userId,
    content,
    status: 'draft',
    entry_type: intent === 'journal' || intent === 'agenda' ? 'journal' : entryType,
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

  // 2. Call AI Service
  // Note: This might take 1-3 seconds
  try {
    let aiResponse;
    const currentType = entry.entry_type;
    let nextType = currentType;

    // Use LLM to classify intent
    const { classifyIntent } = await import('@/lib/openai/smart-parser');
    const intent = await classifyIntent(entry.content || '');

    switch (intent) {
      case 'journal': {
        const { parseDailyJournal } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseDailyJournal(entry.content || '');
        nextType = 'daily_journal';
        break;
      }
      case 'medication': {
        const { parseMedication } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseMedication(entry.content || '');
        nextType = 'journal'; 
        break;
      }
      case 'script': {
        const { parseScript } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseScript(entry.content || '');
        nextType = 'journal';
        break;
      }
      case 'appointment': {
        const { parseAppointment } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseAppointment(entry.content || '');
        nextType = 'journal';
        break;
      }
      case 'agenda':
      default: {
        const { parseAgenda } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseAgenda(entry.content || '');
        nextType = 'journal';
        break;
      }
    }
    
    // 3. Update Entry with "Glass Box" state
    const updatePayload: UpdateJournalEntry = {
      entry_type: nextType as any,
      // @ts-ignore - Supabase type definition mismatch for JSON fields
      ai_response: aiResponse, 
      status: 'draft' // Keep as draft for user review
    };

    const { error: updateError } = await supabase
      .from('journal_entries')
      // TODO: Regenerate types to fix inference
      .update(updatePayload as never)
      .eq('id', id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath('/journal');
    return { success: true };
    
  } catch (err) {
    console.error('Process Entry Failed:', err, (err as Error).stack); // Add stack trace for better debugging
    throw new Error('Failed to process entry with AI');
  }
}

export async function updateScriptOrReferralEntry(id: string, isFilled: boolean) {
  const supabase = await createClient();

  // Handle virtual IDs from Daily Journal extraction
  if (id.includes('_script_')) {
    const [realId, , indexStr] = id.split('_');
    const index = parseInt(indexStr, 10);

    const { data: entry } = await supabase
      .from('journal_entries')
      .select('ai_response')
      .eq('id', realId)
      .single<{ ai_response: any }>();

    if (entry?.ai_response?.Scripts) {
      const scripts = [...entry.ai_response.Scripts];
      if (scripts[index]) {
        scripts[index].Filled = isFilled;
        const { error } = await supabase
          .from('journal_entries')
          .update({ ai_response: { ...entry.ai_response, Scripts: scripts } } as never)
          .eq('id', realId);
        
        if (error) throw new Error(error.message);
      }
    }
    revalidatePath('/scripts');
    return;
  }

  // Legacy/Normal Script Entry Update
  const { data: entry, error: fetchError } = await supabase
    .from('journal_entries')
    .select('content')
    .eq('id', id)
    .single<{ content: string }>();
    
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

  const { error } = await supabase
    .from('journal_entries')
    // TODO: Regenerate types to fix inference
    .update({ content: updatedContent } as never)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/scripts');
}
