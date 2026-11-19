'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowUp, Menu } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

const LOCALES = ['en', 'fr', 'ar'] as const;

interface TopNavProps {
  locale: string;
  onMenuOpen?: () => void;
}

export function TopNav({ locale, onMenuOpen }: TopNavProps) {
  const t = useTranslations('presentation');
  const router = useRouter();
  const pathname = usePathname();
  const [switching, setSwitching] = useState(false);

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale || switching) return;
    setSwitching(true);
    // Replace current locale segment in path
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0a]/80 px-4 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <Image
          src="/images/supabase/supabase-logo-icon.png"
          alt="Supabase"
          width={20}
          height={20}
          className="opacity-90"
        />
        <span className="hidden text-xs font-medium text-white/50 sm:block">
          × MPC
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Language switcher */}
        <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                locale === loc
                  ? 'text-[#3ecf8e]'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t(`nav.lang.${loc}`)}
            </button>
          ))}
        </div>

        {/* Back to top */}
        <button
          onClick={scrollToTop}
          title={t('nav.backToTop')}
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 transition-colors hover:border-white/[0.15] hover:text-white/70"
        >
          <ArrowUp size={14} />
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={onMenuOpen}
          title={t('nav.openMenu')}
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 transition-colors hover:border-white/[0.15] hover:text-white/70 lg:hidden"
        >
          <Menu size={14} />
        </button>
      </div>
    </header>
  );
}
