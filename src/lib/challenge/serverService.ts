import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import type { ChallengeOverview, ClaimedCodeEntry, CodesRemaining } from './types';

interface CodesRemainingRow {
  remaining: number | null;
  total: number | null;
}

interface ClaimedCodeRow {
  claimed_by_name: string | null;
  claimed_by_whatsapp: string | null;
  claimed_at: string | null;
  code: string | null;
}

interface ChallengeSettingsRow {
  is_challenge_enabled: boolean | null;
}

function normalizeRpcRows<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data as T[];
  }
  return [data as T];
}

export async function getCodesRemainingServer(): Promise<CodesRemaining> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('get_codes_remaining');
    if (error) {
      return { remaining: 0, total: 0 };
    }
    const row = normalizeRpcRows<CodesRemainingRow>(data)[0];
    return {
      remaining: Number(row?.remaining ?? 0),
      total: Number(row?.total ?? 0),
    };
  } catch {
    return { remaining: 0, total: 0 };
  }
}

export async function getClaimedEntriesServer(): Promise<ClaimedCodeEntry[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('get_claimed_codes');
    if (error) {
      return [];
    }
    return normalizeRpcRows<ClaimedCodeRow>(data).map((row) => ({
      name: row.claimed_by_name?.trim() || 'Anonymous',
      whatsapp: row.claimed_by_whatsapp?.trim() || '-',
      code: row.code?.trim() || '-',
      claimedAt: row.claimed_at ?? null,
    }));
  } catch {
    return [];
  }
}

export async function getChallengeEnabledServer(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('get_challenge_settings');
    if (error) {
      return true;
    }
    const row = normalizeRpcRows<ChallengeSettingsRow>(data)[0];
    return row?.is_challenge_enabled ?? true;
  } catch {
    return true;
  }
}

export async function getChallengeOverviewServer(): Promise<ChallengeOverview> {
  const [challengeEnabled, codesRemaining, claimedEntries] = await Promise.all([
    getChallengeEnabledServer(),
    getCodesRemainingServer(),
    getClaimedEntriesServer(),
  ]);

  return {
    challengeEnabled,
    codesRemaining,
    claimedEntries,
  };
}
