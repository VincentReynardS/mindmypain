'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Profile, UpdateProfile } from '@/types/database';
import { resolveProfileRecordId, validateProfilePayload } from '@/lib/profile-validation';

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const profileId = resolveProfileRecordId(userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .maybeSingle<Profile>();

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertProfile(userId: string, data: UpdateProfile): Promise<Profile> {
  const supabase = await createClient();
  const profileId = resolveProfileRecordId(userId);
  const parsed = validateProfilePayload(data);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid profile data.');
  }

  const { data: savedProfile, error } = await supabase
    .from('profiles')
    .upsert({ ...parsed.data, id: profileId } as never, { onConflict: 'id' })
    .select('*')
    .maybeSingle<Profile>();

  if (error) throw new Error(error.message);
  if (!savedProfile) throw new Error('Profile save did not return data.');

  revalidatePath('/profile/my-detail');
  return savedProfile;
}
