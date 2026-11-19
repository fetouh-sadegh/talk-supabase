"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import {
  useScrollReveal,
  useRevealRegistration,
  RevealItem,
} from "../ClickReveal";

// Known Supabase customers - logos expected at /logos/supabase-users/{filename}
// TODO: Replace filenames with actual files once placed in public/logos/supabase-users/
const COMPANY_LOGOS = [
  { name: "GitHub", file: "vector Mind.svg" },
  { name: "Mozilla", file: "Logo-portal (1).png" },
  { name: "Mozilla", file: "midi-white.png" },
  { name: "Mozilla", file: "logo-long.png" },
  { name: "PwC", file: "washlux2022_logo.jpg" },
  { name: "f", file: "unnamed.webp" },
  { name: "1Password", file: "insight ex.jpg" },
  { name: "1Password", file: "National_Seal_of_Mauritania.svg" },
  { name: "1Password", file: "1745537001479.jpg" },
  { name: "1Password", file: "arkmna whitre.png" },
  { name: "1Password", file: "brandak-white.png" },
];

const TESTIMONIAL_BASE = [
  {
    image: "/images/testomnial/1745537393557.jpg",
    name: "Muhammed Salem Ebnou",
    id: "muhammed",
  },
  {
    image: "/images/testomnial/1696591093492.jpg",
    name: "Sidi Mohamed Jeddou",
    id: "sidi",
  },
  {
    image: "/images/testomnial/1767563198084.jpg",
    name: "Ahmedou Vadel",
    id: "ahmedouVadel",
  },
  {
    image: "/images/testomnial/1732487284043.jpg",
    name: "AHMED ABDAT",
    id: "ahmedAbdat",
  },
  {
    image: "/images/testomnial/1766154416646.jpg",
    name: "Mohamed Saleck Ahmed",
    id: "mohamedSaleck",
  },
  {
    image: "/images/testomnial/1771351835592.jpg",
    name: "yehdih med tah",
    id: "yehdih",
  },
  {
    image: "/images/testomnial/1655484406006.jpg",
    name: "Ahmedou Mohamed El Hacen",
    id: "ahmedouHacen",
  },
] as const;

function TestimonialCard({
  name,
  role,
  image,
  message,
  avatarAlt,
}: {
  name: string;
  role: string;
  image: string;
  message: string;
  avatarAlt: string;
}) {
  return (
    <div className="w-72 shrink-0 rounded-xl border border-white/7 bg-white/3 p-5">
      <p className="mb-4 text-sm leading-relaxed text-white/55">
        &ldquo;{message}&rdquo;
      </p>
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sb-green/20 text-xs font-bold text-sb-green">
          <img src={image} alt={avatarAlt} className="object-cover rounded-full" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white/80">{name}</p>
          <p className="text-[10px] text-white/30">{role}</p>
        </div>
      </div>
    </div>
  );
}

function CompanyLogoChip({ name, file }: { name: string; file: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-white/7 bg-white/3 p-3">
      <img
        src={`/logos/supabase-users/${file}`}
        alt={`${name} logo`}
        className="h-12 w-auto opacity-80"
        loading="lazy"
      />
    </div>
  );
}

export function UsersSection() {
  const t = useTranslations("presentation.users");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.08 });

  const testimonials = TESTIMONIAL_BASE.map((item) => ({
    ...item,
    role: t(`testimonials.${item.id}.role`),
    message: t(`testimonials.${item.id}.message`),
  }));

  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } =
    useScrollReveal(COMPANY_LOGOS.length);
  useRevealRegistration(
    isInView,
    tryAdvance,
    tryRetreat,
    revealed,
    COMPANY_LOGOS.length,
    isComplete,
    ref,
  );

  // Duplicate testimonials for seamless infinite scroll
  const row1 = [...testimonials, ...testimonials];
  const row2 = [...[...testimonials].reverse(), ...[...testimonials].reverse()];

  return (
    <section
      id="users"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden py-24"
    >
      <div ref={ref} className="px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-base text-white/40">{t("subtitle")}</p>
        </motion.div>

        {/* Company logos - revealed one by one */}
        <div className="mx-auto mb-4 flex max-w-4xl flex-wrap justify-center gap-3 px-4">
          {COMPANY_LOGOS.map(({ name, file }, i) => (
            <RevealItem key={`${name}-${file}`} show={isShown(i)}>
              <CompanyLogoChip name={name} file={file} />
            </RevealItem>
          ))}
        </div>
      </div>

      {/* Testimonials marquee - shown once logos are all revealed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isComplete ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="relative group mt-4 space-y-3"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent sm:w-24" />
        {/* Row 1 - left */}
        <div className="flex overflow-hidden">
          <div className="flex gap-3 animate-marquee-left">
            {row1.map((item, i) => (
              <TestimonialCard
                key={`r1-${i}`}
                {...item}
                avatarAlt={t("avatarAlt", { name: item.name })}
              />
            ))}
          </div>
        </div>

        {/* Row 2 - right */}
        <div className="flex overflow-hidden">
          <div className="flex gap-3 animate-marquee-right">
            {row2.map((item, i) => (
              <TestimonialCard
                key={`r2-${i}`}
                {...item}
                avatarAlt={t("avatarAlt", { name: item.name })}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
