/**
 * Server Actions for Journal Entries
 * 
 * Implements mutation logic for the "Glass Box" pattern:
 * - Update: Modify draft content
 * - Approve: Commit draft to record
 * 
 * @see 2-3-glass-box-card-component.md - Task 1
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { JournalEntry } from '@/types/database';

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('journal_entries')
    .update(updates)
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
    .update({ status: 'approved' })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/app/journal');
}
