'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import {
  Plug,
  GitBranch,
  Lock,
  LayoutDashboard,
  Terminal,
  BookOpen,
} from 'lucide-react';
import { BentoIconCard } from '../BentoCard';
import { useScrollReveal, useRevealRegistration, RevealItem } from '../ClickReveal';

const DX_ITEMS = [
  { titleKey: 'instant', descKey: 'instantDesc', icon: <Plug size={17} />, accent: true },
  { titleKey: 'sql', descKey: 'sqlDesc', icon: <GitBranch size={17} /> },
  { titleKey: 'rls', descKey: 'rlsDesc', icon: <Lock size={17} /> },
  { titleKey: 'dashboard', descKey: 'dashboardDesc', icon: <LayoutDashboard size={17} /> },
  { titleKey: 'local', descKey: 'localDesc', icon: <Terminal size={17} /> },
  { titleKey: 'community', descKey: 'communityDesc', icon: <BookOpen size={17} /> },
];

export function DXSection() {
  const t = useTranslations('presentation.dx');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.08 });

  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } = useScrollReveal(DX_ITEMS.length);
  useRevealRegistration(isInView, tryAdvance, tryRetreat, revealed, DX_ITEMS.length, isComplete, ref);

  return (
    <section id="dx" className="relative flex min-h-screen items-center px-4 py-24">
      <div ref={ref} className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="sticky top-16 z-20 mb-12 bg-[#0a0a0a]/85 py-3 backdrop-blur-sm"
        >
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="text-base text-white/40">{t('subtitle')}</p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DX_ITEMS.map(({ titleKey, descKey, icon, accent }, i) => (
            <RevealItem key={titleKey} show={isShown(i)}>
              <BentoIconCard
                icon={icon}
                title={t(titleKey)}
                description={t(descKey)}
                accent={accent}
                className="h-full"
              />
            </RevealItem>
          ))}
        </div>

      </div>
    </section>
  );
}


