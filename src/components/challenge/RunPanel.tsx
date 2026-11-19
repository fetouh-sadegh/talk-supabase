import { Play, RotateCcw, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RunPanelProps {
  isRunning: boolean;
  canRun: boolean;
  statusMessage: string | null;
  statusTone: 'idle' | 'error' | 'success';
  claimId: string | null;
  codeLabel: string | null;
  resultMode?: 'claim' | 'preview';
  onRun: () => void;
  onReset: () => void;
}

export function RunPanel({
  isRunning,
  canRun,
  statusMessage,
  statusTone,
  claimId,
  codeLabel,
  resultMode,
  onRun,
  onReset,
}: RunPanelProps) {
  const t = useTranslations('challenge.runPanel');
  const whatsappPhone = '22234000086';
  const claimMessage = claimId
    ? `Hello, I want to confirm my claim. claim_id: ${claimId}${codeLabel ? `, code: ${codeLabel}` : ''}`
    : '';
  const confirmWhatsappUrl = claimId
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(claimMessage)}`
    : null;
  const toneClass =
    statusTone === 'success'
      ? 'border-sb-green/40 bg-sb-green/10 text-sb-green'
      : statusTone === 'error'
      ? 'border-red-400/40 bg-red-500/10 text-red-200'
      : 'border-white/15 bg-white/[0.03] text-white/60';

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRun}
          disabled={!canRun || isRunning}
          className="inline-flex items-center gap-1.5 rounded-xl border border-sb-green/40 bg-sb-green/15 px-4 py-2 text-sm font-semibold text-sb-green transition hover:border-sb-green/60 disabled:opacity-60"
        >
          <Play size={14} />
          {isRunning ? t('running') : t('run')}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-sm text-white/80 transition hover:border-white/35 disabled:opacity-60"
        >
          <RotateCcw size={14} />
          {t('reset')}
        </button>
      </div>

      <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${toneClass}`}>
        {statusMessage ?? t('idle')}
      </div>

      {claimId && codeLabel ? (
        <div className="mt-3 rounded-xl border border-sb-green/35 bg-sb-green/10 p-3">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-sb-green">
            <Sparkles size={14} />
            {resultMode === 'preview'
              ? t('availableCode', { code: codeLabel })
              : t('claimedCode', { code: codeLabel })}
          </p>
          <p className="mt-1 text-xs text-white/65">
            {t('claimId')}: <span className="font-mono">{claimId}</span>
          </p>
          <p className="mt-2 text-xs text-white/70">
            {resultMode === 'preview'
              ? t('previewHelp')
              : t('claimHelp')}
          </p>
          {resultMode !== 'preview' && confirmWhatsappUrl ? (
            <a
              href={confirmWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-xs font-medium text-sb-green underline underline-offset-4"
            >
              {t('confirmOnWhatsapp', { phone: '+22234000086' })}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
