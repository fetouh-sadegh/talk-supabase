"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Linkedin,
  MessageSquare,
  Presentation,
  Trophy,
  Users,
  Video,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { MainNav } from "@/components/shared/MainNav";

const COMMUNITY_WHATSAPP_URL =
  "https://chat.whatsapp.com/E0GEci1wFGA1GrSv4ABBYU";
const LUMA_EVENT_URL = "https://luma.com/4454qegx";
const EVENT_RECORD_URL =
  "https://drive.google.com/file/d/1RA5kuWjPC27Y9xxyOBZH9keQep9ASfj_/view";
const SUPABASE_DOCS_URL = "https://supabase.com/docs";
const SUPABASE_YOUTUBE_URL = "https://www.youtube.com/@supabase";

// TODO: Replace with the speaker's real LinkedIn profile URL.
const SPEAKER_LINKEDIN_URL =
  "https://www.linkedin.com/in/fetouh-sadegh-35950b1a5";

interface HomePageProps {
  locale: string;
  challengeEnabled: boolean;
}

interface CardItem {
  key:
    | "eventRecord"
    | "presentation"
    | "demo"
    | "challenge"
    | "luma"
    | "whatsapp"
    | "docs"
    | "youtube"
    | "linkedin";
  href: string;
  icon: LucideIcon;
  external?: boolean;
  disabled?: boolean;
  accent?: boolean;
  featured?: boolean;
}

function LinkCard({
  title,
  description,
  href,
  icon: Icon,
  external = false,
  disabled = false,
  accent = false,
  featured = false,
  delay = 0,
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  disabled?: boolean;
  accent?: boolean;
  featured?: boolean;
  delay?: number;
}) {
  const cardClass = `group relative flex h-full min-h-36 flex-col justify-between overflow-hidden rounded-2xl border p-5 backdrop-blur-sm transition-colors ${
    featured
      ? "border-sb-green/45 bg-sb-green/[0.08] shadow-[0_0_0_1px_rgba(60,207,145,0.18)]"
      : "border-white/10 bg-white/[0.03]"
  }`;

  const content = (
    <>
      {accent ? (
        <div className="pointer-events-none absolute -top-16 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-sb-green/25 blur-2xl" />
      ) : null}

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-sb-green">
          <Icon size={18} />
        </div>
        <ArrowUpRight
          size={14}
          className="text-white/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/70"
        />
      </div>

      <div className="relative z-10 mt-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/50">
          {description}
        </p>
      </div>
    </>
  );

  if (external) {
    return (
      <motion.a
        href={href}
        target={disabled ? undefined : "_blank"}
        rel={disabled ? undefined : "noopener noreferrer"}
        aria-disabled={disabled}
        whileHover={disabled ? undefined : { y: -4 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay }}
        className={`${cardClass} ${
          disabled
            ? "pointer-events-none opacity-60"
            : featured
              ? "hover:border-sb-green/60 hover:bg-sb-green/[0.12]"
              : "hover:border-white/20 hover:bg-white/[0.05]"
        }`}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <Link href={href} className="block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay }}
        className={`${cardClass} ${
          featured
            ? "hover:border-sb-green/60 hover:bg-sb-green/[0.12]"
            : "hover:border-white/20 hover:bg-white/[0.05]"
        }`}
      >
        {content}
      </motion.div>
    </Link>
  );
}

export function HomePage({ locale, challengeEnabled }: HomePageProps) {
  const t = useTranslations("home");
  const isRTL = locale === "ar";
  const textAlign = isRTL ? "text-right" : "text-left";

  const internalCards: CardItem[] = [
    {
      key: "presentation",
      href: `/${locale}/presentation`,
      icon: Presentation,
      accent: true,
    },
    {
      key: "demo",
      href: `/${locale}/demo`,
      icon: MessageSquare,
    },
  ];

  if (challengeEnabled) {
    internalCards.push({
      key: "challenge",
      href: `/${locale}/challenge`,
      icon: Trophy,
    });
  }

  const externalCards: CardItem[] = [
    {
      key: "eventRecord",
      href: EVENT_RECORD_URL,
      icon: Video,
      external: true,
      accent: true,
      featured: true,
    },
    {
      key: "luma",
      href: LUMA_EVENT_URL,
      icon: CalendarDays,
      external: true,
      accent: true,
    },
    {
      key: "whatsapp",
      href: COMMUNITY_WHATSAPP_URL,
      icon: Users,
      external: true,
    },
    {
      key: "docs",
      href: SUPABASE_DOCS_URL,
      icon: BookOpen,
      external: true,
    },
    {
      key: "youtube",
      href: SUPABASE_YOUTUBE_URL,
      icon: Youtube,
      external: true,
    },
    {
      key: "linkedin",
      href: SPEAKER_LINKEDIN_URL,
      icon: Linkedin,
      external: true,
    },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="presentation-bg relative min-h-screen bg-sb-bg text-white"
    >
      <div className="pointer-events-none absolute inset-0 presentation-glow" />
      <div className="pointer-events-none absolute inset-0 opacity-20 presentation-noise" />

      <MainNav locale={locale} challengeEnabled={challengeEnabled} />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-24 pb-14 sm:pt-28">
        <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className={textAlign}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sb-green/25 bg-sb-green/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sb-green" />
              <span className="text-xs font-medium text-sb-green">
                {t("hero.eyebrow")}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
              {t("hero.subtitle")}
            </p>

            <div className="mt-6 grid gap-2 text-sm text-white/60 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                {t("hero.noteTalk")}
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                {t("hero.noteQA")}
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                {t("hero.noteSlides")}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <a
                href={COMMUNITY_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-sb-green/35 bg-sb-green/15 px-4 py-2.5 text-sm font-medium text-sb-green transition-colors hover:border-sb-green/55"
              >
                {t("hero.cta.community")}
              </a>
              <a
                href={SUPABASE_DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
              >
                {t("hero.cta.docs")}
              </a>
              <a
                href={SUPABASE_YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
              >
                {t("hero.cta.youtube")}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mx-auto w-full max-w-sm"
          >
            <div className="mb-4 flex items-center justify-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
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
                <span className="text-xs text-white/55">MPC</span>
              </div>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/[0.08]">
              <Image
                src="/images/event/cover.jpeg"
                alt={t("hero.coverAlt")}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            </div>
          </motion.div>
        </section>

        <section className="mt-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            <h2 className="text-xl font-semibold text-white">
              {t("sections.internalTitle")}
            </h2>
          </motion.div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {internalCards.map((card, index) => (
              <LinkCard
                key={card.key}
                title={t(`cards.${card.key}.title`)}
                description={t(`cards.${card.key}.description`)}
                href={card.href}
                icon={card.icon}
                accent={card.accent}
                delay={0.14 + index * 0.05}
              />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-white">
              {t("sections.externalTitle")}
            </h2>
          </motion.div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {externalCards.map((card, index) => (
              <LinkCard
                key={card.key}
                title={t(`cards.${card.key}.title`)}
                description={t(`cards.${card.key}.description`)}
                href={card.href}
                icon={card.icon}
                external
                accent={card.accent}
                disabled={card.disabled}
                featured={card.featured}
                delay={0.22 + index * 0.05}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
