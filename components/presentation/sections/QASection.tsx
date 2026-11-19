"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { BookOpen, Youtube, Users, ArrowUpRight } from "lucide-react";
import Image from "next/image";

// TODO: Replace '#' with the actual MPC community link when available
const CTA_LINKS = [
  {
    key: "ctaDocs",
    icon: BookOpen,
    color: "#3ecf8e",
    // Supabase official docs URL
    href: "https://supabase.com/docs",
    external: true,
  },
  {
    key: "ctaYoutube",
    icon: Youtube,
    color: "#f472b6",
    // Supabase official YouTube channel
    href: "https://www.youtube.com/@Supabase",
    external: true,
  },
  {
    key: "ctaMpc",
    icon: Users,
    color: "#a78bfa",
    // TODO: Replace with actual MPC community link
    href: "#",
    external: false,
  },
];

export function QASection() {
  const t = useTranslations("presentation.qa");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  return (
    <section
      id="qa"
      className="relative flex min-h-screen items-center justify-center px-4 py-24"
    >
      {/* Big radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 60%, rgba(62,207,142,0.1) 0%, transparent 70%)",
        }}
      />

      <div ref={ref} className="relative z-10 w-full max-w-2xl text-center">
        {/* Supabase + MPC logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-center gap-4"
        >
          <Image
            src="/images/supabase/supabase-logo-wordmark--dark.png"
            alt="Supabase"
            width={110}
            height={26}
            className="opacity-70"
          />
          <div className="h-5 w-px bg-white/10" />
          <Image
            src="/images/mpc/__logo.jpg"
            alt="MPC"
            width={28}
            height={28}
            className="rounded-full opacity-70"
          />
          <span className="hidden text-xs font-semibold text-white/85 lg:block">
            {t("community")}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mb-3 text-5xl font-black tracking-tight text-white sm:text-6xl"
        >
          {t("title")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-12 text-base text-white/40"
        >
          {t("subtitle")}
        </motion.p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {CTA_LINKS.map(({ key, icon: Icon, color, href, external }, i) => (
            <motion.a
              key={key}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
              className="group flex items-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/70 transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white"
              style={{ "--hover-color": color } as React.CSSProperties}
            >
              <Icon size={15} style={{ color }} />
              {t(key)}
              {external && (
                <ArrowUpRight
                  size={12}
                  className="opacity-40 group-hover:opacity-70"
                />
              )}
            </motion.a>
          ))}
        </div>

        {/* Made with */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-xs text-white/20"
        >
          {t("madeWith")}
        </motion.p>
      </div>
    </section>
  );
}
