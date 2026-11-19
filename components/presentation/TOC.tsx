'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const SECTION_IDS = [
  'intro',
  'agenda',
  'scope',
  'what',
  'baas',
  'examples',
  'offers',
  'dx',
  'vectormind',
  'users',
  'demo',
  'limits',
  'qa',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

interface TOCProps {
  activeSection: SectionId | null;
  locale?: string;
}

function TOCLinks({
  activeSection,
  onLinkClick,
}: {
  activeSection: SectionId | null;
  onLinkClick?: () => void;
}) {
  const t = useTranslations('presentation.toc');

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onLinkClick?.();
  };

  return (
    <nav>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">
        {t('title')}
      </p>
      <ul className="space-y-0.5">
        {SECTION_IDS.map((id) => {
          const isActive = activeSection === id;
          return (
            <li key={id}>
              <button
                onClick={() => scrollTo(id)}
                className={`group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-[#3ecf8e]/10 text-[#3ecf8e]'
                    : 'text-white/35 hover:bg-white/[0.04] hover:text-white/70'
                }`}
              >
                <span
                  className={`h-1 w-1 flex-shrink-0 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'scale-125 bg-[#3ecf8e]'
                      : 'bg-white/20 group-hover:bg-white/40'
                  }`}
                />
                {t(id)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Desktop sticky sidebar */
export function TOCSidebar({ activeSection }: TOCProps) {
  return (
    <aside className="sticky top-20 hidden w-48 flex-shrink-0 lg:block xl:w-52">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 presentation-scroll max-h-[calc(100vh-6rem)] overflow-y-auto">
        <TOCLinks activeSection={activeSection} />
      </div>
    </aside>
  );
}

/** Mobile drawer overlay */
export function TOCDrawer({
  activeSection,
  isOpen,
  onClose,
}: TOCProps & { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('presentation.toc');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="fixed left-0 top-0 bottom-0 z-50 w-64 border-r border-white/[0.08] bg-[#0a0a0a] p-6 lg:hidden"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{t('menu')}</span>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70"
              >
                <X size={14} />
              </button>
            </div>
            <TOCLinks
              activeSection={activeSection}
              onLinkClick={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
