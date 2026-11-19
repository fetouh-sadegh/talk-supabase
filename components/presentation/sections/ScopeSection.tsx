'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { BookOpen, Swords, Crosshair } from 'lucide-react';
import { BentoCard } from '../BentoCard';
import { useScrollReveal, useRevealRegistration, RevealItem } from '../ClickReveal';

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

const CARDS = [
  { titleKey: 'card1Title', descKey: 'card1Desc', Icon: BookOpen,  accent: false },
  { titleKey: 'card2Title', descKey: 'card2Desc', Icon: Swords,    accent: false },
  { titleKey: 'card3Title', descKey: 'card3Desc', Icon: Crosshair, accent: true  },
];

export function ScopeSection() {
  const t = useTranslations('presentation.scope');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.15 });
  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } = useScrollReveal(CARDS.length);
  useRevealRegistration(isInView, tryAdvance, tryRetreat, revealed, CARDS.length, isComplete, ref);

  return (
    <section id="scope" className="relative flex min-h-screen flex-col justify-center px-4 py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(62,207,142,0.04) 0%, transparent 70%)' }}
      />

      <div ref={ref} className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-medium text-white/30 uppercase tracking-widest">{t('subtitle')}</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">{t('title')}</h2>
        </motion.div>

        {/* Cards */}
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CARDS.map(({ titleKey, descKey, Icon, accent }, i) => (
              <RevealItem key={titleKey} show={isShown(i)}>
                <div>
                  <BentoCard className="h-full" glowColor={accent ? '#3ecf8e' : undefined}>
                    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border ${
                      accent
                        ? 'border-sb-green/20 bg-sb-green/10 text-sb-green'
                        : 'border-white/8 bg-white/4 text-white/40'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <h3 className={`mb-2 text-lg font-bold ${accent ? 'text-sb-green' : 'text-white/80'}`}>
                      {t(titleKey)}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/40">{t(descKey)}</p>
                  </BentoCard>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}


