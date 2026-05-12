import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = (url && key)
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

// Mirrors the original window.storage contract so App.tsx doesn't change.
//   get(key)        -> { value: string } | null   (value is a JSON-stringified payload)
//   set(key, v, p?) -> void                       (p marks the entry as a cross-user public snapshot)
//   delete(key, p?) -> void
//
// `athlete:HANDLE` keys flow to athlete_snapshots (RLS: any authenticated user can read,
// only the owner can write). Everything else lives in user_data keyed by auth.uid().
export function makeSupabaseStorage(client: SupabaseClient) {
  const ATHLETE = 'athlete:';

  const uid = async (): Promise<string | null> => {
    const { data } = await client.auth.getUser();
    return data.user?.id ?? null;
  };

  return {
    get: async (rawKey: string): Promise<{ value: string } | null> => {
      if (rawKey.startsWith(ATHLETE)) {
        const handle = rawKey.slice(ATHLETE.length);
        const { data, error } = await client
          .from('athlete_snapshots')
          .select('snapshot')
          .eq('handle', handle)
          .maybeSingle();
        if (error || !data) return null;
        return { value: JSON.stringify(data.snapshot) };
      }
      const id = await uid();
      if (!id) return null;
      const { data, error } = await client
        .from('user_data')
        .select('value')
        .eq('user_id', id)
        .eq('key', rawKey)
        .maybeSingle();
      if (error || !data) return null;
      return { value: JSON.stringify(data.value) };
    },

    set: async (rawKey: string, value: string, isPublic = false): Promise<void> => {
      const id = await uid();
      if (!id) return;
      let parsed: any;
      try { parsed = JSON.parse(value); } catch { parsed = value; }
      if (isPublic && rawKey.startsWith(ATHLETE)) {
        const handle = rawKey.slice(ATHLETE.length);
        await client.from('athlete_snapshots').upsert({
          handle, user_id: id, snapshot: parsed, updated_at: new Date().toISOString(),
        });
      } else {
        await client.from('user_data').upsert({
          user_id: id, key: rawKey, value: parsed, updated_at: new Date().toISOString(),
        });
      }
    },

    delete: async (rawKey: string, isPublic = false): Promise<void> => {
      const id = await uid();
      if (!id) return;
      if (isPublic && rawKey.startsWith(ATHLETE)) {
        const handle = rawKey.slice(ATHLETE.length);
        await client.from('athlete_snapshots').delete().eq('handle', handle).eq('user_id', id);
      } else {
        await client.from('user_data').delete().eq('user_id', id).eq('key', rawKey);
      }
    },
  };
}

// One-shot localStorage → cloud copy on first authenticated load. Idempotent
// via a `migrated_v1` marker row in user_data so subsequent sign-ins skip it.
const LEGACY_KEYS = ['hyrox_workouts_v3', 'hyrox_profile_v2', 'hyrox_theme'];

export async function migrateLocalToCloud(client: SupabaseClient): Promise<void> {
  const { data: userRes } = await client.auth.getUser();
  const id = userRes.user?.id;
  if (!id) return;

  const { data: marker } = await client
    .from('user_data')
    .select('key')
    .eq('user_id', id)
    .eq('key', 'migrated_v1')
    .maybeSingle();
  if (marker) return;

  for (const k of LEGACY_KEYS) {
    const v = localStorage.getItem(k);
    if (v == null) continue;
    let parsed: any;
    try { parsed = JSON.parse(v); } catch { parsed = v; }
    await client.from('user_data').upsert({
      user_id: id, key: k, value: parsed, updated_at: new Date().toISOString(),
    });
  }

  // public snapshot, if the profile has a handle
  const profileRaw = localStorage.getItem('hyrox_profile_v2');
  if (profileRaw) {
    try {
      const profile = JSON.parse(profileRaw);
      const handle: string | undefined = profile?.userId;
      if (handle) {
        const snapKey = `athlete:${handle}`;
        const snapRaw = localStorage.getItem(snapKey);
        if (snapRaw) {
          await client.from('athlete_snapshots').upsert({
            handle, user_id: id, snapshot: JSON.parse(snapRaw),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch {}
  }

  await client.from('user_data').upsert({
    user_id: id, key: 'migrated_v1', value: { at: Date.now() },
    updated_at: new Date().toISOString(),
  });
}
