'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { Database, ShieldCheck, HardDrive, Zap, Github } from 'lucide-react';
import Image from 'next/image';
import { BentoIconCard } from '../BentoCard';
import { useScrollReveal, useRevealRegistration, RevealItem } from '../ClickReveal';

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

const FEATURES = [
  { titleKey: 'feature1', descKey: 'feature1Desc', icon: <Database size={18} />,    accent: true  },
  { titleKey: 'feature2', descKey: 'feature2Desc', icon: <ShieldCheck size={18} />, accent: false },
  { titleKey: 'feature3', descKey: 'feature3Desc', icon: <HardDrive size={18} />,   accent: false },
  { titleKey: 'feature4', descKey: 'feature4Desc', icon: <Zap size={18} />,         accent: false },
];

export function WhatSection() {
  const t = useTranslations('presentation.what');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } = useScrollReveal(FEATURES.length);
  useRevealRegistration(isInView, tryAdvance, tryRetreat, revealed, FEATURES.length, isComplete, ref);

  return (
    <section id="what" className="relative flex min-h-screen flex-col justify-center px-4 py-24">
      <div ref={ref} className="w-full max-w-4xl mx-auto">

        {/* Header + one-liner — always visible */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="sticky top-16 z-20 mb-10 bg-[#0a0a0a]/85 py-3 backdrop-blur-sm"
        >
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t('title')}
          </h2>

          <div className="relative mb-6 rounded-xl border border-sb-green/20 bg-sb-green/5 p-6">
            <div className="absolute -top-px left-8 h-px w-24 bg-linear-to-r from-sb-green to-transparent" />
            <p className="text-lg font-medium leading-relaxed text-white/90 sm:text-xl">{t('oneliner')}</p>
            <p className="mt-2 text-sm text-white/40">{t('tagline')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Image
              src="/images/supabase/supabase-logo-wordmark--dark.png"
              alt="Supabase"
              width={110}
              height={26}
              className="opacity-80"
            />
            <span className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-white/50">
              <Github size={12} /> {t('openSource')}
            </span>
            <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-white/50">
              {t('selfHostable')}
            </span>
          </div>
        </motion.div>

        {/* Feature cards — click to reveal */}
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ titleKey, descKey, icon, accent }, i) => (
              <RevealItem key={titleKey} show={isShown(i)}>
                <div>
                  <BentoIconCard
                    icon={icon}
                    title={t(titleKey)}
                    description={t(descKey)}
                    accent={accent}
                    className="h-full"
                  />
                </div>
              </RevealItem>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}


