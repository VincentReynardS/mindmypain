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

  const newEntry: NewJournalEntry = {
    user_id: userId,
    content,
    status: 'draft',
    entry_type: entryType,
  };

  const { data, error } = await supabase
    .from('journal_entries')
    // TODO: Regenerate types to fix inference - Supabase v2 type mismatch
    .insert(newEntry as any)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/app/journal');
  return data?.id;
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

  revalidatePath('/app/journal');
}

export async function updateAppointmentEntry(id: string, content: string) {
  await updateJournalEntry(id, { content });
  revalidatePath('/app/appointments');
}

export async function updateMedicationEntry(id: string, content: string) {
  await updateJournalEntry(id, { content });
  revalidatePath('/app/medications');
}

export async function approveAppointmentEntry(id: string) {
  await approveJournalEntry(id);
  revalidatePath('/app/appointments');
}

export async function approveMedicationEntry(id: string) {
  await approveJournalEntry(id);
  revalidatePath('/app/medications');
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

  revalidatePath('/app/journal');
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

    // Default to agendas if raw_text, unless specified otherwise
    // If it's already clinical_summary (e.g. from "Save as Summary"), process as such
    if (currentType === 'clinical_summary') {
      const { generateClinicalSummary } = await import('@/lib/openai/smart-parser');
      aiResponse = await generateClinicalSummary(entry.content || '');
      nextType = 'clinical_summary';
    } else {
      // Default behavior: Parsing agendas or medication based on keyword heuristic
      const textToAnalyze = entry.content?.toLowerCase() || '';
      
      if (textToAnalyze.includes('taking') || textToAnalyze.includes('mg') || textToAnalyze.includes('lyrica') || textToAnalyze.includes('medication')) {
        const { parseMedication } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseMedication(entry.content || '');
        nextType = 'agendas'; // Keeping agendas to satisfy type restrictions in prototype DB schema
      } else if (textToAnalyze.includes('prescribe') || textToAnalyze.includes('prescription') || textToAnalyze.includes('referral') || textToAnalyze.includes('script') || textToAnalyze.includes('refill')) {
        const { parseScript } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseScript(entry.content || '');
        nextType = 'agendas';
      } else {
        const { parseAgenda } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseAgenda(entry.content || '');
        nextType = 'agendas';
      }
    }
    
    // 3. Update Entry with "Glass Box" state
    const updatePayload: UpdateJournalEntry = {
      entry_type: nextType as any,
      // @ts-ignore - Supabase type definition mismatch for JSON fields
      ai_response: aiResponse, 
      content: JSON.stringify(aiResponse), // For GlassBoxCard compatibility (Story 2.3 pattern)
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
  
  // We fetch the current content first to update the specific JSON payload
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
