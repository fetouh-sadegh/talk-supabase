import { createSupabaseBrowserClient } from '@/src/lib/supabase';
import type {
  ClaimExecutionInput,
  ClaimExecutionResult,
  ClaimedCodeEntry,
  CodesRemaining,
  PaletteBlock,
  PaletteBlockId,
  PipelineBlock,
} from './types';

export const PALETTE_BLOCKS: PaletteBlock[] = [
  { id: 'supabase_client', kind: 'client', label: 'supabase_client' },
  { id: 'rpc', kind: 'operator', label: 'rpc' },
  { id: 'select_available_code', kind: 'query', label: 'select_available_code' },
  { id: 'claim_giveaway_code', kind: 'function', label: 'claim_giveaway_code' },
  { id: 'claim_code', kind: 'function', label: 'claim_code' },
  { id: 'claimGift', kind: 'function', label: 'claimGift' },
  { id: 'participant', kind: 'param', label: 'participant' },
  { id: 'whatsapp', kind: 'param', label: 'whatsapp' },
  { id: 'phone', kind: 'param', label: 'phone' },
  { id: 'user', kind: 'param', label: 'user' },
  { id: 'name', kind: 'param', label: 'name' },
  { id: 'contact', kind: 'param', label: 'contact' },
];

const REQUIRED_FUNCTION = 'claim_giveaway_code';
const REQUIRED_PARAMS = new Set<PaletteBlockId>(['participant', 'whatsapp']);

interface ClaimRpcRow {
  claim_id: string;
  code: string;
}

interface SelectCodeRow {
  code: string;
}

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

function makeFallbackId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeRpcRows<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data as T[];
  }
  return [data as T];
}

function fail(
  stepResults: ClaimExecutionResult['stepResults'],
  index: number,
  block: PipelineBlock | undefined,
  message: string
): ClaimExecutionResult {
  stepResults.push({
    index,
    instanceId: block?.instanceId,
    ok: false,
    message,
  });
  return { ok: false, error: message, stepResults };
}

function resolveMissingParamFailure(
  missingKey: string,
  pipeline: PipelineBlock[],
  stepResults: ClaimExecutionResult['stepResults']
): ClaimExecutionResult {
  const fallback = pipeline[pipeline.length - 1];
  if (fallback) {
    stepResults.push({
      index: stepResults.length,
      instanceId: fallback.instanceId,
      ok: false,
      message: `Missing required parameter: ${missingKey}`,
    });
  } else {
    stepResults.push({
      index: 0,
      ok: false,
      message: `Missing required parameter: ${missingKey}`,
    });
  }

  return {
    ok: false,
    error: `Missing required parameter: ${missingKey}`,
    stepResults,
  };
}

async function executePreviewFlow(input: ClaimExecutionInput): Promise<ClaimExecutionResult> {
  const stepResults: ClaimExecutionResult['stepResults'] = [];
  const foundParams = new Set<'participant' | 'whatsapp'>();
  const first = input.pipeline[0];

  if (!first || first.sourceId !== 'supabase_client') {
    return fail(stepResults, 0, first, 'Pipeline must start with supabase_client.');
  }
  stepResults.push({ index: 0, instanceId: first.instanceId, ok: true });

  const queryBlock = input.pipeline[1];
  if (!queryBlock || queryBlock.sourceId !== 'select_available_code') {
    return fail(stepResults, 1, queryBlock, 'Missing operation block: rpc or select_available_code.');
  }
  stepResults.push({ index: 1, instanceId: queryBlock.instanceId, ok: true });

  for (let i = 2; i < input.pipeline.length; i += 1) {
    const block = input.pipeline[i];
    if (block.kind !== 'param') {
      return fail(stepResults, i, block, `Unexpected block after query: ${block.label}`);
    }

    if (block.sourceId !== 'whatsapp' && block.sourceId !== 'participant') {
      return fail(stepResults, i, block, `Unsupported parameter: ${block.label}`);
    }

    if (block.sourceId === 'participant' || block.sourceId === 'whatsapp') {
      if (foundParams.has(block.sourceId)) {
        return fail(stepResults, i, block, `Parameter duplicated: ${block.label}`);
      }
      foundParams.add(block.sourceId);
    }

    stepResults.push({ index: i, instanceId: block.instanceId, ok: true });
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc('select_available_code');

  if (error) {
    return {
      ok: false,
      error: error.message,
      stepResults,
    };
  }

  const row = normalizeRpcRows<SelectCodeRow>(data)[0];
  if (!row?.code) {
    return {
      ok: false,
      error: 'no codes remaining',
      stepResults,
    };
  }

  return {
    ok: true,
    mode: 'preview',
    claimId: makeFallbackId('preview'),
    codeLabel: row.code,
    stepResults,
  };
}

async function executeClaimFlow(input: ClaimExecutionInput): Promise<ClaimExecutionResult> {
  const stepResults: ClaimExecutionResult['stepResults'] = [];
  const foundParams = new Set<'participant' | 'whatsapp'>();

  if (input.pipeline.length === 0) {
    return {
      ok: false,
      error: 'Pipeline is empty. Add blocks before running.',
      stepResults: [{ index: 0, ok: false, message: 'Pipeline is empty.' }],
    };
  }

  let index = 0;
  const first = input.pipeline[index];
  if (!first || first.sourceId !== 'supabase_client') {
    return fail(stepResults, index, first, 'Pipeline must start with supabase_client.');
  }
  stepResults.push({ index, instanceId: first.instanceId, ok: true });
  index += 1;

  const operation = input.pipeline[index];
  if (!operation) {
    return fail(stepResults, index, operation, 'Missing operation block: rpc or select_available_code.');
  }

  if (operation.sourceId === 'select_available_code') {
    return executePreviewFlow(input);
  }

  if (operation.sourceId !== 'rpc') {
    return fail(stepResults, index, operation, 'Missing rpc step before function call.');
  }
  stepResults.push({ index, instanceId: operation.instanceId, ok: true });
  index += 1;

  const fnBlock = input.pipeline[index];
  if (!fnBlock || fnBlock.kind !== 'function') {
    return fail(stepResults, index, fnBlock, 'Missing RPC function name.');
  }
  if (fnBlock.label !== REQUIRED_FUNCTION) {
    return fail(stepResults, index, fnBlock, 'Wrong RPC function name');
  }
  stepResults.push({ index, instanceId: fnBlock.instanceId, ok: true });
  index += 1;

  for (let i = index; i < input.pipeline.length; i += 1) {
    const block = input.pipeline[i];
    if (block.kind !== 'param') {
      return fail(stepResults, i, block, `Unexpected block after function: ${block.label}`);
    }

    const isRequired = REQUIRED_PARAMS.has(block.sourceId);
    if (!isRequired) {
      return fail(stepResults, i, block, `Unsupported parameter: ${block.label}`);
    }

    if (block.sourceId === 'participant' || block.sourceId === 'whatsapp') {
      if (foundParams.has(block.sourceId)) {
        return fail(stepResults, i, block, `Parameter duplicated: ${block.label}`);
      }
      foundParams.add(block.sourceId);
    }

    stepResults.push({ index: i, instanceId: block.instanceId, ok: true });
  }

  if (!foundParams.has('participant')) {
    return resolveMissingParamFailure('participant', input.pipeline, stepResults);
  }
  if (!foundParams.has('whatsapp')) {
    return resolveMissingParamFailure('whatsapp', input.pipeline, stepResults);
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc('claim_giveaway_code', {
    participant: input.fullName.trim(),
    whatsapp: input.whatsapp.trim(),
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
      stepResults,
    };
  }

  const row = normalizeRpcRows<ClaimRpcRow>(data)[0];
  if (!row?.claim_id || !row?.code) {
    return {
      ok: false,
      error: 'Request failed.',
      stepResults,
    };
  }

  return {
    ok: true,
    mode: 'claim',
    claimId: row.claim_id,
    codeLabel: row.code,
    stepResults,
  };
}

export async function executeClaim(input: ClaimExecutionInput): Promise<ClaimExecutionResult> {
  return executeClaimFlow(input);
}

export async function getCodesRemaining(): Promise<CodesRemaining> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc('get_codes_remaining');

  if (error) {
    throw new Error(error.message);
  }

  const row = normalizeRpcRows<CodesRemainingRow>(data)[0];
  return {
    remaining: Number(row?.remaining ?? 0),
    total: Number(row?.total ?? 0),
  };
}

export async function getClaimedEntries(): Promise<ClaimedCodeEntry[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc('get_claimed_codes');

  if (error) {
    throw new Error(error.message);
  }

  return normalizeRpcRows<ClaimedCodeRow>(data).map((row) => ({
    name: row.claimed_by_name?.trim() || 'Anonymous',
    whatsapp: row.claimed_by_whatsapp?.trim() || '-',
    code: row.code?.trim() || '-',
    claimedAt: row.claimed_at ?? null,
  }));
}

export async function getChallengeEnabled(): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc('get_challenge_settings');

  if (error) {
    throw new Error(error.message);
  }

  const row = normalizeRpcRows<ChallengeSettingsRow>(data)[0];
  return row?.is_challenge_enabled ?? true;
}

export interface ChallengeService {
  executeClaim(input: ClaimExecutionInput): Promise<ClaimExecutionResult>;
  getCodesRemaining(): Promise<CodesRemaining>;
  getClaimedEntries(): Promise<ClaimedCodeEntry[]>;
  getChallengeEnabled(): Promise<boolean>;
}

export const challengeService: ChallengeService = {
  executeClaim,
  getCodesRemaining,
  getClaimedEntries,
  getChallengeEnabled,
};
