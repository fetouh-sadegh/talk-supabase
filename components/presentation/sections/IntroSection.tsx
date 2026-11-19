'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { Code2, ChevronDown } from 'lucide-react';

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

export function IntroSection() {
  const t = useTranslations('presentation.intro');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  const scrollToNext = () => {
    document.getElementById('agenda')?.scrollIntoView({ behavior: 'smooth' });
  };

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
    animate: isInView
      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
      : { opacity: 0, y: 24, filter: 'blur(6px)' },
    transition: { duration: 0.6, delay, ease: EASE },
  });

  return (
    <section
      id="intro"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24"
    >
      {/* Radial glow background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(62,207,142,0.14) 0%, transparent 70%)',
        }}
      />

      <div ref={ref} className="relative z-10 w-full max-w-4xl">
        <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left lg:gap-16">
          {/* Left: Text */}
          <div className="flex-1">
            {/* Eyebrow */}
            <motion.div
              {...anim(0)}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3ecf8e]/20 bg-[#3ecf8e]/5 px-3 py-1.5"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[#3ecf8e]" />
              <span className="text-xs font-medium text-[#3ecf8e]">{t('eyebrow')}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              {...anim(0.1)}
              className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              {t('title')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              {...anim(0.2)}
              className="mb-8 max-w-lg text-base leading-relaxed text-white/50 sm:text-lg"
            >
              {t('subtitle')}
            </motion.p>

            {/* Presenter */}
            <motion.div
              {...anim(0.3)}
              className="inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3ecf8e]/20 bg-[#3ecf8e]/10">
                <Code2 size={16} className="text-[#3ecf8e]" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/35">{t('presentedBy')}</p>
                <p className="text-sm font-semibold text-white">{t('presenterName')}</p>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span className="text-xs text-[#3ecf8e]/80">{t('bullet1')}</span>
                  <span className="text-xs text-white/30">·</span>
                  <span className="text-xs text-white/40">{t('bullet2')}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Branding + Event image */}
          <motion.div
            {...anim(0.4)}
            className="mt-12 flex flex-col items-center gap-6 lg:mt-0 lg:items-end"
          >
            {/* Supabase + MPC logos */}
            <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-4">
              <Image
                src="/images/supabase/supabase-logo-wordmark--dark.png"
                alt="Supabase"
                width={120}
                height={28}
                className="object-contain opacity-90"
              />
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Image
                  src="/images/mpc/__logo.jpg"
                  alt="MPC"
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
                <span className="text-xs font-medium text-white/50">{t('mpcLabel')}</span>
              </div>
            </div>

            {/* Event cover */}
            <div className="relative h-48 w-72 overflow-hidden rounded-xl border border-white/[0.08] sm:h-56 sm:w-80">
              <Image
                src="/images/event-cover/WhatsApp Image 2026-03-02 at 23.09.37.jpeg"
                alt={t('eventCoverAlt')}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.button
          {...anim(0.5)}
          onClick={scrollToNext}
          className="mx-auto mt-16 flex flex-col items-center gap-2 text-white/25 transition-colors hover:text-white/50"
        >
          <span className="text-xs tracking-widest uppercase">{t('scrollHint')}</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}
