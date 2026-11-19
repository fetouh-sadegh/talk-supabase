'use client';

import { useState, useEffect, useCallback } from 'react';
import { SECTION_IDS, type SectionId } from './TOC';
import { useGlobalRevealScroll } from './ClickReveal';
import { IntroSection } from './sections/IntroSection';
import { AgendaSection } from './sections/AgendaSection';
import { ScopeSection } from './sections/ScopeSection';
import { WhatSection } from './sections/WhatSection';
import { BaasSection } from './sections/BaasSection';
import { OffersSection } from './sections/OffersSection';
import { DXSection } from './sections/DXSection';
import { VectorMindSection } from './sections/VectorMindSection';
import { UsersSection } from './sections/UsersSection';
import { DemoSection } from './sections/DemoSection';
import { LimitsSection } from './sections/LimitsSection';
import { QASection } from './sections/QASection';
import { MainNav } from '@/components/shared/MainNav';

interface PresentationLayoutProps {
  locale: string;
  challengeEnabled: boolean;
}

export function PresentationLayout({ locale, challengeEnabled }: PresentationLayoutProps) {
  const [, setActiveSection] = useState<SectionId | null>('intro');
  const isRTL = locale === 'ar';
  useGlobalRevealScroll();

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    let best: IntersectionObserverEntry | null = null;
    for (const entry of entries) {
      if (entry.isIntersecting) {
        if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
      }
    }
    if (best) setActiveSection(best.target.id as SectionId);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: [0.2, 0.4, 0.6],
      rootMargin: '-10% 0px -30% 0px',
    });

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [handleIntersection]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    return () => {
      document.documentElement.dir = 'ltr';
    };
  }, [locale, isRTL]);

  return (
    <div className="presentation-bg min-h-screen text-white">
      <MainNav locale={locale} challengeEnabled={challengeEnabled} />
      <main className="mx-auto max-w-5xl pt-16">
        <IntroSection />
        <AgendaSection />
        <ScopeSection />
        <WhatSection />
        <BaasSection />
        {/* <ExamplesSection /> */}
        <OffersSection />
        <DXSection />
        <VectorMindSection />
        <UsersSection />
        <DemoSection />
        <LimitsSection />
        <QASection />
      </main>
    </div>
  );
}
