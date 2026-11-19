'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import {
  Braces,
  DatabaseZap,
  Hash,
  Route,
  Search,
  ServerCog,
  Sigma,
} from 'lucide-react';
import type { PaletteBlock } from '@/src/lib/challenge/types';

interface BlockPaletteProps {
  blocks: PaletteBlock[];
}

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  supabase_client: DatabaseZap,
  rpc: ServerCog,
  select_available_code: Search,
  claim_giveaway_code: Route,
  claim_code: Braces,
  claimGift: Braces,
  participant: Hash,
  whatsapp: Sigma,
  phone: Hash,
  user: Hash,
  name: Hash,
  contact: Hash,
};

function PaletteItem({ block }: { block: PaletteBlock }) {
  const id = `palette:${block.id}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const Icon = ICONS[block.id] ?? Braces;
  const tone =
    block.kind === 'client'
      ? 'border-sb-green/40 bg-sb-green/15 text-sb-green'
      : block.kind === 'operator' || block.kind === 'query'
      ? 'border-cyan-300/35 bg-cyan-300/15 text-cyan-100'
      : block.kind === 'function'
      ? 'border-violet-300/35 bg-violet-400/15 text-violet-100'
      : 'border-white/16 bg-white/[0.07] text-white/85';

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      className={`inline-flex cursor-grab items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-medium transition ${tone} ${
        isDragging ? 'shadow-[0_0_24px_rgba(255,255,255,0.22)]' : 'hover:brightness-110'
      }`}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.65 : 1,
      }}
    >
      <Icon size={13} />
      {block.label}
    </button>
  );
}

export function BlockPalette({ blocks }: BlockPaletteProps) {
  const t = useTranslations('challenge.palette');

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-linear-to-br from-white/[0.04] to-white/[0.01] p-4">
      <h2 className="mb-3 text-sm font-semibold text-white/85">{t('title')}</h2>
      <div className="flex flex-wrap gap-2">
        {blocks.map((block) => (
          <PaletteItem key={block.id} block={block} />
        ))}
      </div>
    </section>
  );
}
