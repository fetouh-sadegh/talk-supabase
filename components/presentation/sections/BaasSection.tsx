'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Monitor, Database, ShieldCheck, HardDrive, Globe, Server, ArrowDown, Zap } from 'lucide-react';
import { BentoCard } from '../BentoCard';
import { useScrollReveal, useRevealRegistration } from '../ClickReveal';

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

export function BaasSection() {
  const t = useTranslations('presentation.baas');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.08 });
  // 2 steps: 0 = traditional arch, 1 = BaaS arch
  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } = useScrollReveal(2);
  useRevealRegistration(isInView, tryAdvance, tryRetreat, revealed, 2, isComplete, ref);

  const provides = [
    { icon: <Database size={12} />, label: t('provides1') },
    { icon: <ShieldCheck size={12} />, label: t('provides2') },
    { icon: <HardDrive size={12} />, label: t('provides3') },
    { icon: <Globe size={12} />, label: t('provides4') },
  ];

  return (
    <section id="baas" className="relative flex min-h-screen flex-col justify-center px-4 py-24">
      <div ref={ref} className="w-full max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="sticky top-16 z-20 mb-12 bg-[#0a0a0a]/85 py-3 backdrop-blur-sm"
        >
          <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-sb-green/70">
            {t('acronym')}
          </p>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t('title')}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-white/45">
            {t('description')}
          </p>
        </motion.div>

        <div className="space-y-5">

          {/* ── DIAGRAM 1: Traditional architecture ── */}
          <AnimatePresence>
            {isShown(0) && (
              <motion.div
                key="traditional"
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <BentoCard>
                  <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-white/30">
                    {t('traditionalTitle')}
                  </p>
                  <div className="flex flex-col items-center">

                    {/* Frontend */}
                    <div className="flex items-center justify-center gap-2.5 rounded-xl border border-[#60a5fa]/25 bg-[#60a5fa]/8 px-7 py-3 w-52">
                      <Monitor size={16} className="text-[#60a5fa]" />
                      <span className="text-sm font-semibold text-[#60a5fa]">{t('frontend')}</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5 py-1.5 text-white/25">
                      <ArrowDown size={13} />
                      <span className="text-[10px] font-mono">{t('protocol')}</span>
                    </div>

                    {/* API layer */}
                    <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/3 px-7 py-3 w-52">
                      <Globe size={15} className="text-white/40" />
                      <span className="text-sm font-medium text-white/50">{t('apiLayer')}</span>
                    </div>

                    <div className="py-1.5 text-white/25"><ArrowDown size={13} /></div>

                    {/* Backend */}
                    <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/3 px-7 py-3 w-52">
                      <Server size={15} className="text-white/40" />
                      <span className="text-sm font-medium text-white/50">{t('backendServer')}</span>
                    </div>

                    <div className="py-1.5 text-white/25"><ArrowDown size={13} /></div>

                    {/* Data layer */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {[
                        { Icon: Database, label: t('database') },
                        { Icon: ShieldCheck, label: t('authService') },
                        { Icon: HardDrive, label: t('storageService') },
                      ].map(({ Icon, label }) => (
                        <div key={label} className="flex items-center gap-1.5 rounded-xl border border-[#a78bfa]/20 bg-[#a78bfa]/6 px-4 py-2.5">
                          <Icon size={13} className="text-[#a78bfa]" />
                          <span className="text-xs font-medium text-[#a78bfa]">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-5 text-center text-xs text-white/25 italic">
                    {t('traditionalNote')}
                  </p>
                </BentoCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Transition label ── */}
          <AnimatePresence>
            {isShown(0) && isShown(1) && (
              <motion.div
                key="transition-label"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-3"
              >
                <div className="h-px flex-1 bg-linear-to-r from-transparent to-sb-green/25" />
                <span className="flex items-center gap-1.5 rounded-full border border-sb-green/20 bg-sb-green/5 px-3 py-1 text-xs font-medium text-sb-green">
                  <Zap size={11} /> {t('transitionLabel')}
                </span>
                <div className="h-px flex-1 bg-linear-to-l from-transparent to-sb-green/25" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── DIAGRAM 2: BaaS architecture ── */}
          <AnimatePresence>
            {isShown(1) && (
              <motion.div
                key="baas-arch"
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <BentoCard glowColor="#3ecf8e" className="border-sb-green/15">
                  <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-sb-green/60">
                    {t('withBaas')}
                  </p>
                  <div className="flex flex-col items-center gap-0">

                    {/* Frontend */}
                    <div className="flex items-center justify-center gap-2.5 rounded-xl border border-[#60a5fa]/25 bg-[#60a5fa]/8 px-7 py-3 w-52">
                      <Monitor size={16} className="text-[#60a5fa]" />
                      <span className="text-sm font-semibold text-[#60a5fa]">{t('frontend')}</span>
                    </div>

                    <div className="py-1.5 text-sb-green/40"><ArrowDown size={13} /></div>

                    {/* Supabase — the single BaaS layer */}
                    <div className="w-full max-w-sm rounded-xl border border-sb-green/25 bg-sb-green/6 p-5">
                      <p className="mb-3 text-center text-base font-bold text-sb-green">
                        {t('supabaseName')}
                        <span className="ml-2 text-[10px] font-normal text-sb-green/50">
                          {t('baasLabel')}
                        </span>
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {provides.map(({ icon, label }) => (
                          <span
                            key={label}
                            className="flex items-center gap-1.5 rounded-full border border-sb-green/20 bg-sb-green/8 px-2.5 py-1 text-[11px] text-sb-green/80"
                          >
                            {icon} {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 text-center text-sm font-medium text-white/60">
                    {t('benefit')}
                  </p>
                </BentoCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}



