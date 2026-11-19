export type BlockKind = 'client' | 'operator' | 'function' | 'query' | 'param';

export type PaletteBlockId =
  | 'supabase_client'
  | 'rpc'
  | 'select_available_code'
  | 'claim_giveaway_code'
  | 'claim_code'
  | 'claimGift'
  | 'participant'
  | 'whatsapp'
  | 'phone'
  | 'user'
  | 'name'
  | 'contact';

export interface PaletteBlock {
  id: PaletteBlockId;
  kind: BlockKind;
  label: string;
}

export interface PipelineBlock {
  instanceId: string;
  sourceId: PaletteBlockId;
  kind: BlockKind;
  label: string;
}

export interface ClaimExecutionInput {
  fullName: string;
  whatsapp: string;
  pipeline: PipelineBlock[];
}

export interface ExecutionStepResult {
  index: number;
  instanceId?: string;
  ok: boolean;
  message?: string;
}

export interface ClaimExecutionResult {
  ok: boolean;
  mode?: 'claim' | 'preview';
  error?: string;
  claimId?: string;
  codeLabel?: string;
  stepResults: ExecutionStepResult[];
}

export interface CodesRemaining {
  remaining: number;
  total: number;
}

export interface ClaimedCodeEntry {
  name: string;
  whatsapp: string;
  code: string;
  claimedAt: string | null;
}

export interface ChallengeOverview {
  challengeEnabled: boolean;
  codesRemaining: CodesRemaining;
  claimedEntries: ClaimedCodeEntry[];
}
