'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { BentoCard } from '../BentoCard';
import { useScrollReveal, useRevealRegistration, RevealItem } from '../ClickReveal';

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

// Logos assumed to exist at public/logos/{file}
const EXAMPLES = [
  { nameKey: 'firebase',  descKey: 'firebaseDesc',  logo: '/logos/firebase.png',  badge: 'Google',      color: '#f59e0b' },
  { nameKey: 'appwrite',  descKey: 'appwriteDesc',  logo: '/logos/appwrite.png',  badge: 'Open Source', color: '#f472b6' },
  { nameKey: 'xano',      descKey: 'xanoDesc',      logo: '/logos/xano.png',      badge: 'No-code',     color: '#60a5fa' },
];

export function ExamplesSection() {
  const t = useTranslations('presentation.examples');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } = useScrollReveal(EXAMPLES.length);
  useRevealRegistration(isInView, tryAdvance, tryRetreat, revealed, EXAMPLES.length, isComplete, ref);

  return (
    <section id="examples" className="relative flex min-h-screen flex-col justify-center px-4 py-24">
      <div ref={ref} className="w-full max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="text-base text-white/40">{t('subtitle')}</p>
        </motion.div>

        {/* Cards — click to reveal */}
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {EXAMPLES.map(({ nameKey, descKey, logo, badge, color }, i) => (
              <RevealItem key={nameKey} show={isShown(i)}>
                <div>
                  <BentoCard className="h-full" glowColor={color}>
                    {/* Logo */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-white/4">
                      <Image
                        src={logo}
                        alt={t(nameKey)}
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{t(nameKey)}</h3>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                        style={{ borderColor: `${color}30`, color: `${color}99` }}
                      >
                        {badge}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-white/40">{t(descKey)}</p>
                  </BentoCard>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>

        {/* Footer note */}
        {isComplete && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-6 text-center text-sm text-white/30"
          >
            {t('note')}
          </motion.p>
        )}

      </div>
    </section>
  );
}


