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

export async function createJournalEntry(content: string, userId: string) {
  const supabase = await createClient();

  const newEntry: NewJournalEntry = {
    user_id: userId,
    content,
    status: 'draft',
    entry_type: 'raw_text',
  };

  const { error } = await supabase
    .from('journal_entries')
    // TODO: Regenerate types to fix inference - Supabase v2 type mismatch
    .insert(newEntry as any);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/app/journal');
}


export async function updateJournalEntry(id: string, updates: UpdateJournalEntry) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('journal_entries')
    // TODO: Regenerate types to fix inference
    .update(updates as any)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/app/journal');
}

export async function approveJournalEntry(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('journal_entries')
    // TODO: Regenerate types to fix inference
    .update({ status: 'approved' } as any)
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
    .select('content')
    .eq('id', id)
    .single<{ content: string }>();

  if (fetchError || !entry) {
    throw new Error('Entry not found');
  }

  // 2. Call AI Service
  // Note: This might take 1-3 seconds
  try {
    const agendaResponse = await parseAgenda(entry.content);
    
    // 3. Update Entry with "Glass Box" state
    const updatePayload: UpdateJournalEntry = {
      entry_type: 'agendas',
      // @ts-ignore - Supabase type definition mismatch for JSON fields
      ai_response: agendaResponse, 
      content: JSON.stringify(agendaResponse), // For GlassBoxCard compatibility (Story 2.3 pattern)
      status: 'draft' // Keep as draft for user review
    };

    const { error: updateError } = await supabase
      .from('journal_entries')
      // TODO: Regenerate types to fix inference
      .update(updatePayload as any)
      .eq('id', id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath('/app/journal');
    return { success: true };
    
  } catch (err) {
    console.error('Process Entry Failed:', err, (err as Error).stack); // Add stack trace for better debugging
    throw new Error('Failed to process entry with AI');
  }
}
