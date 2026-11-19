'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import {
  Database,
  Brain,
  ShieldCheck,
  HardDrive,
  Zap,
  Code2,
  BarChart3,
  Server,
  Bot,
} from 'lucide-react';
import { BentoIconCard } from '../BentoCard';
import { useScrollReveal, useRevealRegistration, RevealItem } from '../ClickReveal';

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

const OFFERS = [
  { titleKey: 'db',       descKey: 'dbDesc',       icon: <Database size={17} />,   accent: true,  span2: true  },
  { titleKey: 'vector',   descKey: 'vectorDesc',   icon: <Brain size={17} />,      accent: false, span2: false },
  { titleKey: 'auth',     descKey: 'authDesc',     icon: <ShieldCheck size={17} />,accent: false, span2: false },
  { titleKey: 'storage',  descKey: 'storageDesc',  icon: <HardDrive size={17} />,  accent: false, span2: false },
  { titleKey: 'realtime', descKey: 'realtimeDesc', icon: <Zap size={17} />,        accent: false, span2: false },
  { titleKey: 'edge',     descKey: 'edgeDesc',     icon: <Code2 size={17} />,      accent: false, span2: false },
  { titleKey: 'mcp',      descKey: 'mcpDesc',      icon: <Bot size={17} />,        accent: false, span2: false },
  { titleKey: 'logs',     descKey: 'logsDesc',     icon: <BarChart3 size={17} />,  accent: false, span2: false },
  { titleKey: 'selfhost', descKey: 'selfhostDesc', icon: <Server size={17} />,     accent: false, span2: false },
];

export function OffersSection() {
  const t = useTranslations('presentation.offers');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.05 });
  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } = useScrollReveal(OFFERS.length);
  useRevealRegistration(isInView, tryAdvance, tryRetreat, revealed, OFFERS.length, isComplete, ref);

  return (
    <section id="offers" className="relative flex min-h-screen flex-col justify-center px-4 py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 60%, rgba(62,207,142,0.05) 0%, transparent 70%)' }}
      />

      <div ref={ref} className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12"
        >
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('title')}</h2>
          <p className="text-base text-white/40">{t('subtitle')}</p>
        </motion.div>

        {/* Bento grid — click to reveal */}
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {OFFERS.map(({ titleKey, descKey, icon, accent, span2 }, i) => (
              <RevealItem key={titleKey} show={isShown(i)} className={span2 ? 'lg:col-span-2' : ''}>
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


