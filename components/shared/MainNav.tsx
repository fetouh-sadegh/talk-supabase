'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

const LOCALES = ['en', 'fr', 'ar'] as const;

type LocaleCode = (typeof LOCALES)[number];

function isLocaleCode(value: string): value is LocaleCode {
  return (LOCALES as readonly string[]).includes(value);
}

function getLocaleHref(pathname: string, locale: LocaleCode): string {
  const segments = pathname.split('/');

  if (segments.length > 1 && isLocaleCode(segments[1])) {
    segments[1] = locale;
  } else {
    segments.splice(1, 0, locale);
  }

  const nextPath = segments.join('/').replace(/\/+$/, '');
  return nextPath || `/${locale}`;
}

interface MainNavProps {
  locale: string;
  challengeEnabled?: boolean;
}

type NavItemKey = 'presentation' | 'demo' | 'challenge';

export function MainNav({ locale, challengeEnabled = true }: MainNavProps) {
  const t = useTranslations('home');
  const pathname = usePathname() ?? `/${locale}`;
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentSection =
    pathSegments.length > 1 && isLocaleCode(pathSegments[0]) ? pathSegments[1] : pathSegments[0];
  const navItems: Array<{ key: NavItemKey; href: string }> = [
    { key: 'presentation', href: `/${locale}/presentation` },
    { key: 'demo', href: `/${locale}/demo` },
  ];

  if (challengeEnabled) {
    navItems.push({ key: 'challenge', href: `/${locale}/challenge` });
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href={`/${locale}`}
          className="group flex items-center gap-2.5 rounded-md px-1 py-0.5 transition-colors hover:bg-white/[0.04]"
          title={t('nav.goHome')}
        >
          <Image
            src="/images/supabase/supabase-logo-wordmark--dark.png"
            alt="Supabase"
            width={110}
            height={24}
            className="h-[17px] w-auto object-contain opacity-95"
          />
          <span className="text-xs text-white/40">x</span>
          <Image
            src="/images/mpc/__logo.jpg"
            alt="MPC"
            width={20}
            height={20}
            className="rounded-full object-cover opacity-95"
          />
          <span className="hidden text-xs font-semibold text-white/85 lg:block">
            {t('nav.community')}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = currentSection === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-sb-green/45 bg-sb-green/15 text-sb-green'
                    : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-white/[0.16] hover:text-white'
                }`}
              >
                {t(`nav.links.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
          {LOCALES.map((loc) => (
            <Link
              key={loc}
              href={getLocaleHref(pathname, loc)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                locale === loc ? 'text-sb-green' : 'text-white/40 hover:text-white/75'
              }`}
            >
              {t(`nav.lang.${loc}`)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
