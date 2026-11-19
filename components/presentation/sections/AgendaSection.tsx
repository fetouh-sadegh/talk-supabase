"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import {
  Target,
  HelpCircle,
  Layers,
  Puzzle,
  Package,
  Sparkles,
  Cpu,
  Users,
  Play,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { BentoCard } from "../BentoCard";
import {
  useScrollReveal,
  useRevealRegistration,
  RevealItem,
} from "../ClickReveal";

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];

const AGENDA_ITEMS = [
  { key: "item0", anchor: "scope", Icon: Target, color: "#60a5fa" },
  { key: "item1", anchor: "what", Icon: HelpCircle, color: "#3ecf8e" },
  { key: "item2", anchor: "baas", Icon: Layers, color: "#a78bfa" },
  // { key: 'item3',  anchor: 'examples',   Icon: Puzzle,        color: '#f59e0b' },
  { key: "item4", anchor: "offers", Icon: Package, color: "#3ecf8e" },
  { key: "item5", anchor: "dx", Icon: Sparkles, color: "#60a5fa" },
  { key: "item6", anchor: "vectormind", Icon: Cpu, color: "#f472b6" },
  { key: "item7", anchor: "users", Icon: Users, color: "#34d399" },
  { key: "item8", anchor: "demo", Icon: Play, color: "#3ecf8e" },
  { key: "item9", anchor: "limits", Icon: AlertTriangle, color: "#f59e0b" },
  { key: "item10", anchor: "qa", Icon: MessageCircle, color: "#a78bfa" },
];

export function AgendaSection() {
  const t = useTranslations("presentation.agenda");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.05 });
  const { revealed, tryAdvance, tryRetreat, isShown, isComplete } =
    useScrollReveal(AGENDA_ITEMS.length);

  useRevealRegistration(
    isInView,
    tryAdvance,
    tryRetreat,
    revealed,
    AGENDA_ITEMS.length,
    isComplete,
    ref,
  );

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="agenda"
      className="relative flex min-h-screen flex-col justify-center px-4 py-24"
    >
      <div ref={ref} className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 text-center"
        >
          <p className="mb-2 text-sm font-medium text-sb-green/70 uppercase tracking-widest">
            {t("subtitle")}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {AGENDA_ITEMS.map(({ key, anchor, Icon, color }, i) => (
            <RevealItem key={key} show={isShown(i)}>
              <button
                onClick={() => scrollTo(anchor)}
                className="group w-full text-left"
              >
                <BentoCard className="transition-all duration-200 group-hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/4"
                      style={{ color }}
                    >
                      <Icon size={15} />
                    </div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      {t(key)}
                    </span>
                    <span className="ml-auto text-xs text-white/20 group-hover:text-sb-green/50 transition-colors">
                      {i + 1}
                    </span>
                  </div>
                </BentoCard>
              </button>
            </RevealItem>
          ))}
        </div>
      </div>
    </section>
  );
}
