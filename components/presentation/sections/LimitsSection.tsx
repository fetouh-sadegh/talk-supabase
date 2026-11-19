'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Radio, HardDrive, Lightbulb } from 'lucide-react';
import { BentoCard } from '../BentoCard';
import { useScrollReveal, useRevealRegistration, RevealItem } from '../ClickReveal';

const LIMITS = [
  { titleKey: 'limit1Title', descKey: 'limit1Desc', icon: ShieldCheck, color: '#f59e0b' },
  { titleKey: 'limit2Title', descKey: 'limit2Desc', icon: HardDrive, color: '#60a5fa' },
  { titleKey: 'limit3Title', descKey: 'limit3Desc', icon: Radio, color: '#f472b6' },
];

// 3 limit cards + 1 lesson card = 4 total
const TOTAL = 4;

export function LimitsSection() {
  const t = useTranslations('presentation.limits');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } = useScrollReveal(TOTAL);
  useRevealRegistration(isInView, tryAdvance, tryRetreat, revealed, TOTAL, isComplete, ref);

  return (
    <section id="limits" className="relative flex min-h-screen items-center px-4 py-24">
      <div ref={ref} className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="text-base text-white/40">{t('subtitle')}</p>
        </motion.div>

        {/* Limit cards */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {LIMITS.map(({ titleKey, descKey, icon: Icon, color }, i) => (
            <RevealItem key={titleKey} show={isShown(i)}>
              <BentoCard className="h-full" glowColor={color}>
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-white/4"
                  style={{ borderColor: `${color}25`, color }}
                >
                  <Icon size={18} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{t(titleKey)}</h3>
                <p className="text-sm leading-relaxed text-white/45">{t(descKey)}</p>
              </BentoCard>
            </RevealItem>
          ))}
        </div>

        {/* Lesson / key insight */}
        <RevealItem show={isShown(3)}>
          <div className="space-y-3">
            <p className="text-sm text-white/40">{t('moreIssuesSubtitle')}</p>
            <BentoCard glowColor="#3ecf8e" className="border-sb-green/15">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sb-green/20 bg-sb-green/10">
                  <Lightbulb size={18} className="text-sb-green" />
                </div>
                <div>
                  <h3 className="mb-1.5 text-base font-semibold text-sb-green">
                    {t('lessonTitle')}
                  </h3>
                  <p className="mb-3 text-sm leading-relaxed text-white/55">{t('lessonDesc')}</p>
                  <p className="text-sm font-medium text-white/70">{t('constructive')}</p>
                </div>
              </div>
            </BentoCard>
          </div>
        </RevealItem>
      </div>
    </section>
  );
}



