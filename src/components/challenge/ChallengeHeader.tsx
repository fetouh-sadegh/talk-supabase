import { motion } from 'framer-motion';
import { Trophy, WandSparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChallengeHeaderProps {
  remaining: number;
  total: number;
  challengeEnabled: boolean;
  allCodesClaimed: boolean;
}

export function ChallengeHeader({
  remaining,
  total,
  challengeEnabled,
  allCodesClaimed,
}: ChallengeHeaderProps) {
  const t = useTranslations('challenge');

  return (
    <header className="mb-8 text-center">
      <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] text-white/65">
        <WandSparkles size={12} className="text-sb-green" />
        {t('eyebrow')}
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-linear-to-r from-white via-sb-green to-cyan-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl"
      >
        {t('title')}
      </motion.h1>
      <p className="mx-auto mt-2 max-w-2xl text-sm text-white/60 sm:text-base">
        {t('subtitle')}
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-sb-green/30 bg-sb-green/10 px-4 py-1.5">
        <Trophy size={14} className="text-sb-green" />
        <span className="text-sm font-medium text-sb-green">
          {t('codes', { remaining, total })}
        </span>
      </div>
      {!challengeEnabled ? (
        <p className="mt-2 text-xs text-red-300/90">{t('disabledNotice')}</p>
      ) : allCodesClaimed ? (
        <p className="mt-2 text-xs text-amber-200/90">{t('allClaimedNotice')}</p>
      ) : (
        <p className="mt-2 text-xs text-amber-300/85">{t('warning')}</p>
      )}
    </header>
  );
}
