'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';
import { BentoCard } from '../BentoCard';
import { useScrollReveal, useRevealRegistration, RevealItem } from '../ClickReveal';

const OLD_STACK = [
  { name: 'Next.js', logo: '/logos/stack/next_js_logo_icon_145038.png', kept: true },
  { name: 'React', logo: '/logos/stack/React-icon.svg.png', kept: true },
  { name: 'Clerk', logo: '/logos/stack/clerk.png', kept: true },
  { name: 'Spring Boot', logo: '/logos/stack/spring-boot-1.svg', kept: false },
];

const NEW_STACK = [
  { name: 'Next.js', logo: '/logos/stack/next_js_logo_icon_145038.png' },
  { name: 'React', logo: '/logos/stack/React-icon.svg.png' },
  { name: 'Clerk', logo: '/logos/stack/clerk.png' },
  { name: 'Supabase', logo: '/logos/stack/supabase-logo-icon.png' },
];

function TechLogo({
  name,
  logo,
  kept,
  replaced,
}: {
  name: string;
  logo: string;
  kept?: boolean;
  replaced?: boolean;
}) {
  return (
    <div className={`relative flex flex-col items-center gap-2 ${replaced ? 'opacity-40' : ''}`}>
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl border bg-white/5 p-2 ${
          replaced ? 'border-red-500/30' : 'border-white/10'
        }`}
      >
        <Image src={logo} alt={name} fill className="object-contain p-1.5" unoptimized />
        {replaced ? (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
            <X size={9} className="text-white" />
          </div>
        ) : null}
        {kept ? (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#574cff]">
            <CheckCircle2 size={9} className="text-white" />
          </div>
        ) : null}
      </div>
      <span
        className={`text-[10px] font-medium ${
          replaced ? 'text-red-400/60 line-through' : 'text-white/50'
        }`}
      >
        {name}
      </span>
    </div>
  );
}

const TOTAL = 5;

export function VectorMindSection() {
  const t = useTranslations('presentation.vectormind');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.08 });
  const [fullscreen, setFullscreen] = useState(false);

  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } = useScrollReveal(TOTAL);
  useRevealRegistration(isInView, tryAdvance, tryRetreat, revealed, TOTAL, isComplete, ref);

  return (
    <>
      <AnimatePresence>
        {fullscreen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-2.5 backdrop-blur">
              <span className="text-xs text-white/40">{t('portalLabel')}</span>
              <button
                onClick={() => setFullscreen(false)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/10"
              >
                <Minimize2 size={12} />
                {t('exitFullscreen')}
              </button>
            </div>
            <iframe
              src="https://portal.mr"
              className="w-full flex-1 border-0"
              allow="fullscreen"
              title="Portal.mr"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section id="vectormind" className="relative flex min-h-screen items-start px-4 py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(87,76,255,0.10) 0%, transparent 70%)',
          }}
        />

        <div ref={ref} className="relative z-10 mx-auto w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#574cff]/25 bg-[#574cff]/10 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#574cff]" />
              <span className="text-xs font-medium text-[#574cff]">{t('eyebrow')}</span>
            </div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('title')}
            </h2>
            <p className="text-base text-white/40">{t('subtitle')}</p>
          </motion.div>

          <RevealItem show={isShown(0)}>
            <div className="mb-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/25">
                {t('originalStack')}
              </p>
              <BentoCard>
                <div className="flex flex-wrap items-center justify-center gap-8 py-2">
                  {OLD_STACK.map(({ name, logo, kept }) => (
                    <TechLogo key={name} name={name} logo={logo} kept={kept} replaced={!kept} />
                  ))}
                </div>
              </BentoCard>
            </div>
          </RevealItem>

          <RevealItem show={isShown(1)}>
            <div className="mb-6">
              <BentoCard>
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-white/60">{t('story1')}</p>
                  <p className="text-sm leading-relaxed text-white/60">{t('story2')}</p>
                  <p className="text-sm leading-relaxed text-white/60">{t('story3')}</p>
                  <p className="text-sm leading-relaxed text-white/60">{t('story4')}</p>
                </div>
              </BentoCard>
            </div>
          </RevealItem>

          <RevealItem show={isShown(2)}>
            <div className="mb-6">
              <BentoCard noPadding className="overflow-hidden">
                <div className="flex items-center gap-2 border-b border-white/6 bg-white/3 px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex flex-1 items-center gap-1.5 rounded-md border border-white/6 bg-white/4 px-2.5 py-1">
                    <span className="text-[11px] text-white/30">{t('portalLabel')}</span>
                  </div>
                  <button
                    onClick={() => setFullscreen(true)}
                    className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/40 transition hover:bg-white/10 hover:text-white/70"
                  >
                    <Maximize2 size={10} />
                    {t('fullscreen')}
                  </button>
                </div>
                <iframe
                  src="https://portal.mr"
                  className="h-96 w-full border-0"
                  allow="fullscreen"
                  title="Portal.mr"
                />
              </BentoCard>
            </div>
          </RevealItem>

          <RevealItem show={isShown(3)}>
            <div className="mb-6">
              <BentoCard glowColor="#574cff" className="border-[#574cff]/25">
                <p className="mb-1.5 text-xs uppercase tracking-widest text-white/30">
                  {t('migrationResult')}
                </p>
                <p className="text-4xl font-black tracking-tight text-[#574cff]">{t('impact')}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{t('highlight')}</p>
              </BentoCard>
            </div>
          </RevealItem>

          <RevealItem show={isShown(4)}>
            <div className="mb-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/25">
                {t('newStack')}
              </p>
              <BentoCard glowColor="#574cff" className="border-[#574cff]/20">
                <div className="flex flex-wrap items-center justify-center gap-8 py-2">
                  {NEW_STACK.map(({ name, logo }) => (
                    <TechLogo key={name} name={name} logo={logo} kept />
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-white/30">{t('summary')}</p>
              </BentoCard>
            </div>
          </RevealItem>
        </div>
      </section>
    </>
  );
}
