'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { SECTION_IDS, type SectionId } from './TOC';

interface FloatingNavProps {
  activeSection: SectionId | null;
}

export function FloatingNav({ activeSection }: FloatingNavProps) {
  const currentIndex = activeSection ? SECTION_IDS.indexOf(activeSection) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < SECTION_IDS.length - 1;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goPrev = () => {
    if (hasPrev) scrollTo(SECTION_IDS[currentIndex - 1]);
  };

  const goNext = () => {
    if (hasNext) scrollTo(SECTION_IDS[currentIndex + 1]);
  };

  return (
    <AnimatePresence>
      {activeSection && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-40 flex flex-col gap-1.5"
        >
          <button
            onClick={goPrev}
            disabled={!hasPrev}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 ${
              hasPrev
                ? 'border-white/[0.12] bg-[#111] text-white/60 hover:border-[#3ecf8e]/40 hover:bg-[#3ecf8e]/10 hover:text-[#3ecf8e]'
                : 'border-white/[0.05] bg-[#111] text-white/15 cursor-not-allowed'
            }`}
          >
            <ChevronUp size={16} />
          </button>

          {/* Section counter */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111]">
            <span className="text-[10px] font-mono text-white/30">
              {currentIndex + 1}/{SECTION_IDS.length}
            </span>
          </div>

          <button
            onClick={goNext}
            disabled={!hasNext}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 ${
              hasNext
                ? 'border-white/[0.12] bg-[#111] text-white/60 hover:border-[#3ecf8e]/40 hover:bg-[#3ecf8e]/10 hover:text-[#3ecf8e]'
                : 'border-white/[0.05] bg-[#111] text-white/15 cursor-not-allowed'
            }`}
          >
            <ChevronDown size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
