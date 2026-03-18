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
import { JournalEntry, JsonObject, NewJournalEntry, UpdateJournalEntry } from '@/types/database';
import { getPersistedIntent, isEntryIntent, isJournalDisplayShape, normalizeImmunisationAiResponse, withPersistedIntent } from '@/lib/journal-entry-ai';

type JournalMergeCandidate = Pick<JournalEntry, 'id' | 'content' | 'status' | 'ai_response' | 'created_at'>;
type ScriptAiResponse = JsonObject & { Scripts?: Array<JsonObject> };

export async function createJournalEntry(
  content: string, 
  userId: string, 
  entryType: 'raw_text' = 'raw_text'
) {
  const supabase = await createClient();

  // 1. For raw input, append only to an existing same-day RAW draft.
  // Do not merge into already-organized journal entries here; journal-to-journal
  // consolidation is handled at organize-time after final shape is known.
  if (entryType === 'raw_text') {
    const today = new Date().toISOString().split('T')[0];

    const { data: existingRawDraft, error: findError } = await supabase
      .from('journal_entries')
      .select('id, content')
      .eq('user_id', userId)
      .eq('entry_type', 'raw_text')
      .eq('status', 'draft')
      .filter('created_at', 'gte', `${today}T00:00:00Z`)
      .filter('created_at', 'lte', `${today}T23:59:59Z`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string; content: string }>();

    if (findError) throw new Error(findError.message);

    if (existingRawDraft) {
      const updatedContent = `${existingRawDraft.content}\n\n${content}`;
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({
          content: updatedContent,
          status: 'draft',
          entry_type: 'raw_text',
        } as never)
        .eq('id', existingRawDraft.id);

      if (updateError) throw new Error(updateError.message);

      revalidatePath('/journal');
      return existingRawDraft.id;
    }
  }

  // 2. Create new raw_text entry — user will click Organize to classify and parse
  const newEntry: NewJournalEntry = {
    user_id: userId,
    content,
    status: 'draft',
    entry_type: 'raw_text',
  };

  const { data, error } = await supabase
    .from('journal_entries')
    .insert(newEntry as never)
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

export async function updateImmunisationEntry(id: string, content: string) {
  await updateJournalEntry(id, { content });
  revalidatePath('/immunisations');
}

export async function approveImmunisationEntry(id: string) {
  await approveJournalEntry(id);
  revalidatePath('/immunisations');
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
  let mergeTargetUpdated = false;

  // 1. Fetch current content
  const { data: entry, error: fetchError } = await supabase
    .from('journal_entries')
    .select('id, user_id, created_at, status, content, entry_type')
    .eq('id', id)
    .single<{ id: string; user_id: string; created_at: string; status: string; content: string; entry_type: string }>();

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
        aiResponse = await parseMedication(entry.content || '', entry.created_at);
        break;
      }
      case 'appointment': {
        const { parseAppointment } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseAppointment(entry.content || '', entry.created_at);
        break;
      }
      case 'script': {
        const { parseScript } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseScript(entry.content || '', entry.created_at);
        break;
      }
      case 'immunisation': {
        const { parseImmunisation } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseImmunisation(entry.content || '', entry.created_at);
        break;
      }
      case 'journal':
      default: {
        const { parseJournal } = await import('@/lib/openai/smart-parser');
        aiResponse = await parseJournal(entry.content || '', entry.created_at);
        break;
      }
    }

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

    // Safety net: if the parser returned mostly-empty data, ensure raw text is preserved.
    // This handles misclassification (e.g. intent='appointment' but parseAppointment returns
    // sparse data that won't render in any card renderer).
    let usedJournalSafetyNet = false;
    if (aiResponse && typeof aiResponse === 'object') {
      if (!hasMeaningfulData(aiResponse)) {
        aiResponse = {
          Sleep: null, Pain: null, Feeling: null,
          Action: null, Grateful: null, Medication: null, Mood: null,
          Note: entry.content || '', Appointments: null, Scripts: null,
        };
        usedJournalSafetyNet = true;
      }
    }

    // Optional merge-on-organize: if this resolves to a Journal shape, merge into an
    // existing same-day Journal draft instead of creating another Journal card.
    const shouldAttemptJournalMerge =
      (intent === 'journal' || usedJournalSafetyNet) &&
      aiResponse &&
      typeof aiResponse === 'object' &&
      isJournalDisplayShape(aiResponse as Record<string, unknown>);

    if (shouldAttemptJournalMerge) {
      if (entry.user_id && entry.created_at) {
        const entryDay = new Date(entry.created_at).toISOString().split('T')[0];

        const { data: sameDayJournalDrafts, error: sameDayError } = await supabase
          .from('journal_entries')
          .select('id, content, status, ai_response, created_at')
          .eq('user_id', entry.user_id)
          .in('status', ['draft', 'approved'])
          .eq('entry_type', 'journal')
          .neq('id', id)
          .filter('created_at', 'gte', `${entryDay}T00:00:00Z`)
          .filter('created_at', 'lte', `${entryDay}T23:59:59Z`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (sameDayError) throw new Error(sameDayError.message);

        const journalCandidates: JournalMergeCandidate[] = sameDayJournalDrafts ?? [];

        const mergeTarget = journalCandidates.find((candidate) => {
          if (!candidate.ai_response || typeof candidate.ai_response !== 'object') return true;
          return isJournalDisplayShape(candidate.ai_response as Record<string, unknown>);
        });

        if (mergeTarget) {
          const mergedContent = `${mergeTarget.content || ''}\n\n${entry.content || ''}`.trim();
          const { parseJournal } = await import('@/lib/openai/smart-parser');
          const mergedAiResponse = await parseJournal(mergedContent, mergeTarget.created_at || entry.created_at);

          const { error: mergeUpdateError } = await supabase
            .from('journal_entries')
            .update({
              content: mergedContent,
              entry_type: 'journal',
              ai_response: withPersistedIntent(mergedAiResponse as Record<string, unknown>, 'journal'),
              status: mergeTarget.status === 'approved' ? 'approved' : 'draft',
            } as never)
            .eq('id', mergeTarget.id);

          if (mergeUpdateError) throw new Error(mergeUpdateError.message);
          mergeTargetUpdated = true;

          const { error: deleteError } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', id);

          if (deleteError) throw new Error(`MERGE_DELETE_FAILED:${deleteError.message}`);

          revalidatePath('/journal');
          return { success: true };
        }
      }
    }

    const persistedIntent = getPersistedIntent(intent, usedJournalSafetyNet);

    const normalizedAiResponse = persistedIntent === 'immunisation'
      ? normalizeImmunisationAiResponse(aiResponse as Record<string, unknown>)
      : aiResponse as JsonObject;

    // 3. Update Entry with "Glass Box" state — all become entry_type='journal'
    // Persist the classified intent so the UI doesn't need to re-infer via field-sniffing
    const aiResponseWithIntent = withPersistedIntent(normalizedAiResponse as Record<string, unknown>, persistedIntent);

    const updatePayload: UpdateJournalEntry = {
      entry_type: 'journal',
      ai_response: aiResponseWithIntent as unknown as JsonObject,
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
    if (mergeTargetUpdated) {
      // Avoid rewriting source row with synthetic fallback after target merge succeeded.
      // Best-effort cleanup only.
      const { error: cleanupError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);
      if (cleanupError) {
        console.error('Post-merge cleanup failed:', cleanupError.message);
      }
      revalidatePath('/journal');
      return { success: true };
    }

    console.error('Process Entry Failed:', err, (err as Error).stack);
    // Fallback: create synthetic ai_response so entry never stays as raw_text
    const syntheticResponse = {
      Sleep: null, Pain: null, Feeling: (entry.content || '').substring(0, 500),
      Action: null, Grateful: null, Medication: null, Mood: null,
      Note: entry.content || '', Appointments: null, Scripts: null,
    };
    const { error: fallbackError } = await supabase
      .from('journal_entries')
      .update({ entry_type: 'journal', ai_response: withPersistedIntent(syntheticResponse, 'journal'), status: 'draft' } as never)
      .eq('id', id);
    if (fallbackError) throw new Error(fallbackError.message);
    revalidatePath('/journal');
    return { success: true };
  }
}

export async function updateJournalAiResponse(
  id: string,
  aiResponse: JsonObject,
  contentText: string
) {
  const supabase = await createClient();

  // Preserve _intent from the existing ai_response so edit forms don't lose it
  const { data: existing } = await supabase
    .from('journal_entries')
    .select('ai_response')
    .eq('id', id)
    .single<{ ai_response: JsonObject | null }>();

  const existingIntentValue = (existing?.ai_response as Record<string, unknown> | null)?._intent;
  const existingIntent = isEntryIntent(existingIntentValue) ? existingIntentValue : null;
  const normalizedAiResponse = existingIntent === 'immunisation'
    ? normalizeImmunisationAiResponse(aiResponse as Record<string, unknown>)
    : aiResponse;

  const mergedAiResponse = existingIntent
    ? withPersistedIntent(normalizedAiResponse as Record<string, unknown>, existingIntent)
    : normalizedAiResponse;

  const { error } = await supabase
    .from('journal_entries')
    .update({
      ai_response: mergedAiResponse,
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
  revalidatePath('/immunisations');
}

export async function archiveJournalEntry(id: string) {
  const supabase = await createClient();

  // Fetch current status to preserve for restore
  const { data: entry, error: fetchError } = await supabase
    .from('journal_entries')
    .select('status')
    .eq('id', id)
    .single<{ status: string }>();

  if (fetchError || !entry) {
    throw new Error(fetchError?.message || 'Entry not found');
  }

  const { error } = await supabase
    .from('journal_entries')
    .update({ status: 'archived', previous_status: entry.status } as never)
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/journal');
  revalidatePath('/medications');
  revalidatePath('/appointments');
  revalidatePath('/scripts');
  revalidatePath('/immunisations');
}

export async function restoreJournalEntry(id: string) {
  const supabase = await createClient();

  const { data: entry, error: fetchError } = await supabase
    .from('journal_entries')
    .select('previous_status')
    .eq('id', id)
    .single<{ previous_status: string | null }>();

  if (fetchError || !entry) {
    throw new Error(fetchError?.message || 'Entry not found');
  }

  const { error } = await supabase
    .from('journal_entries')
    .update({ status: entry.previous_status || 'draft', previous_status: null } as never)
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/journal');
  revalidatePath('/medications');
  revalidatePath('/appointments');
  revalidatePath('/scripts');
  revalidatePath('/immunisations');
}

export async function permanentlyDeleteJournalEntry(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('status', 'archived');

  if (error) throw new Error(error.message);

  revalidatePath('/journal');
  revalidatePath('/medications');
  revalidatePath('/appointments');
  revalidatePath('/scripts');
  revalidatePath('/immunisations');
}

export async function bulkDeleteArchivedEntries(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('user_id', userId)
    .eq('status', 'archived');

  if (error) throw new Error(error.message);

  revalidatePath('/journal');
  revalidatePath('/medications');
  revalidatePath('/appointments');
  revalidatePath('/scripts');
  revalidatePath('/immunisations');
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
      .single<{ ai_response: JsonObject | null }>();

    if (entryError || !entry) throw new Error(entryError?.message || 'Entry not found');

    const response = entry.ai_response as ScriptAiResponse | null;
    if (response?.Scripts) {
      const scripts = [...response.Scripts];
      if (scripts[index]) {
        scripts[index] = { ...(scripts[index] || {}), Filled: isFilled };
        const { error } = await supabase
          .from('journal_entries')
          .update({ ai_response: { ...(response || {}), Scripts: scripts } } as never)
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
    .single<{ content: string; ai_response: JsonObject | null }>();
    
  if (fetchError || !entry) {
    throw new Error('Entry not found');
  }
  
  let parsedContent: JsonObject = {};
  try {
    const parsed = JSON.parse(entry.content || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      parsedContent = parsed as JsonObject;
    }
  } catch (error) {
    console.error('Failed to parse script content', error);
  }

  const updatedContent = JSON.stringify({
    ...parsedContent,
    Filled: isFilled
  });

  const updatedAiResponse = entry.ai_response && entry.ai_response['Name'] ? {
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

export async function backfillEntryIntent(id: string, intent: string) {
  const supabase = await createClient();

  const { data: entry, error: fetchError } = await supabase
    .from('journal_entries')
    .select('ai_response, content')
    .eq('id', id)
    .single<{ ai_response: JsonObject | null; content: string }>();

  if (fetchError || !entry) return;

  const existing = entry.ai_response as Record<string, unknown> | null;
  if (existing?._intent) return; // Already has intent, skip

  let nextAiResponse: JsonObject | null = null;
  if (existing) {
    nextAiResponse = { ...existing, _intent: intent } as JsonObject;
  } else {
    try {
      const parsed = JSON.parse(entry.content);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        nextAiResponse = { ...(parsed as Record<string, unknown>), _intent: intent } as JsonObject;
      }
    } catch {
      return;
    }
  }

  if (!nextAiResponse) return;

  await supabase
    .from('journal_entries')
    .update({ ai_response: nextAiResponse } as never)
    .eq('id', id);
}
