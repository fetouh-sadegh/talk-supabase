'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Database, HardDrive, Lock, Play, Radio, Search } from 'lucide-react';
import { BentoCard } from '../BentoCard';
import { useScrollReveal, useRevealRegistration, RevealItem } from '../ClickReveal';

const STEPS = [
  { key: 'step1', icon: ShieldCheck, color: '#60a5fa' },
  { key: 'step2', icon: Database, color: '#3ecf8e' },
  { key: 'step3', icon: Radio, color: '#22d3ee' },
  { key: 'step4', icon: Search, color: '#f59e0b' },
  { key: 'step5', icon: HardDrive, color: '#a78bfa' },
  { key: 'step6', icon: Lock, color: '#f472b6' },
];

export function DemoSection() {
  const t = useTranslations('presentation.demo');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.15 });

  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } = useScrollReveal(STEPS.length);
  useRevealRegistration(isInView, tryAdvance, tryRetreat, revealed, STEPS.length, isComplete, ref);

  return (
    <section id="demo" className="relative flex min-h-screen items-center px-4 py-24">
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(62,207,142,0.08) 0%, transparent 70%)',
        }}
      />

      <div ref={ref} className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-sb-green/25 bg-sb-green/10">
            <Play size={24} className="translate-x-0.5 text-sb-green" />
          </div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="text-base text-white/40">{t('subtitle')}</p>
        </motion.div>

        {/* Steps */}
        <div className="mx-auto max-w-lg space-y-3">
          {STEPS.map(({ key, icon: Icon, color }, i) => (
            <RevealItem key={key} show={isShown(i)}>
              <BentoCard>
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white/4"
                    style={{ borderColor: `${color}30`, color }}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-white/75">{t(key)}</span>
                  <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full border border-sb-green/20 bg-sb-green/10">
                    <span className="text-[10px] font-bold text-sb-green">{i + 1}</span>
                  </div>
                </div>
              </BentoCard>
            </RevealItem>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-2 text-center text-xs text-white/25 italic"
        >
          {t('note')}
        </motion.p>
      </div>
    </section>
  );
}


