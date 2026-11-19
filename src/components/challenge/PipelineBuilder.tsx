"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
  Bot,
  Braces,
  Cable,
  DatabaseZap,
  Hash,
  KeyRound,
  Link2,
  Route,
  Search,
  ServerCog,
  Sigma,
  X,
} from "lucide-react";
import { useMemo, useRef } from "react";
import type { PaletteBlockId, PipelineBlock } from "@/src/lib/challenge/types";
import { ConnectionLines } from "./ConnectionLines";

export type BlockVisualState = "idle" | "running" | "success" | "error";

interface PipelineBuilderProps {
  pipeline: PipelineBlock[];
  blockStates: Record<string, BlockVisualState>;
  onRemove: (instanceId: string) => void;
  disableEditing?: boolean;
}

interface SortablePipelineItemProps {
  block: PipelineBlock;
  index: number;
  state: BlockVisualState;
  onRemove: (instanceId: string) => void;
  registerNode: (id: string, node: HTMLDivElement | null) => void;
  disableEditing?: boolean;
  removeLabel: string;
}

const ICONS: Record<PaletteBlockId, ComponentType<{ size?: number; className?: string }>> = {
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

function blockClass(state: BlockVisualState): string {
  if (state === "running") {
    return "border-yellow-300/60 bg-yellow-300/20 text-yellow-100 shadow-[0_0_0_1px_rgba(250,204,21,0.45),0_0_24px_rgba(250,204,21,0.25)]";
  }
  if (state === "success") {
    return "border-sb-green/65 bg-sb-green/18 text-sb-green shadow-[0_0_0_1px_rgba(62,207,142,0.4),0_0_22px_rgba(62,207,142,0.24)]";
  }
  if (state === "error") {
    return "border-red-400/65 bg-red-500/18 text-red-200 shadow-[0_0_0_1px_rgba(248,113,113,0.45),0_0_20px_rgba(248,113,113,0.24)]";
  }
  return "border-white/18 bg-white/[0.05] text-white/85";
}

function SortablePipelineItem({
  block,
  index,
  state,
  onRemove,
  registerNode,
  disableEditing,
  removeLabel,
}: SortablePipelineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.instanceId,
    disabled: disableEditing,
  });
  const Icon = ICONS[block.sourceId] ?? Braces;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        registerNode(block.instanceId, node);
      }}
      className={`relative z-10 rounded-2xl border px-3 py-2 text-sm transition ${blockClass(state)} ${
        isDragging ? "opacity-80 shadow-2xl" : ""
      }`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/30 text-[10px] font-semibold text-white/75">
          {index + 1}
        </span>
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={disableEditing}
          className={`inline-flex min-w-0 flex-1 items-center gap-1.5 text-left font-medium ${
            disableEditing ? "cursor-default" : "cursor-grab"
          }`}
        >
          <Icon size={13} className="shrink-0" />
          {block.label}
        </button>
        <button
          type="button"
          onClick={() => onRemove(block.instanceId)}
          disabled={disableEditing}
          className="rounded-md border border-white/15 bg-black/25 p-1 text-white/55 transition hover:text-white disabled:opacity-50"
          aria-label={removeLabel}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

export function PipelineBuilder({
  pipeline,
  blockStates,
  onRemove,
  disableEditing,
}: PipelineBuilderProps) {
  const t = useTranslations("challenge.pipeline");
  const { setNodeRef, isOver } = useDroppable({ id: "pipeline-dropzone" });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  const itemIds = useMemo(
    () => pipeline.map((block) => block.instanceId),
    [pipeline],
  );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-linear-to-br from-white/[0.045] to-white/[0.015] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/85">{t("title")}</h2>
        <span className="rounded-full border border-white/15 bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/50">
          {t("rowBuilder")}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-sb-green/35 bg-sb-green/14 px-2.5 py-1 text-[11px] text-sb-green">
          <Bot size={12} /> {t("legend.client")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/35 bg-cyan-300/14 px-2.5 py-1 text-[11px] text-cyan-100">
          <Cable size={12} /> {t("legend.action")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200/30 bg-cyan-200/10 px-2.5 py-1 text-[11px] text-cyan-100">
          <KeyRound size={12} /> {t("legend.rpcParams")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200/30 bg-cyan-200/10 px-2.5 py-1 text-[11px] text-cyan-100">
          <Search size={12} /> {t("legend.selectParams")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-violet-300/35 bg-violet-300/14 px-2.5 py-1 text-[11px] text-violet-100">
          <Link2 size={12} /> {t("legend.params")}
        </span>
      </div>
      <div
        ref={(node) => {
          setNodeRef(node);
          containerRef.current = node;
        }}
        className={`relative min-h-40 rounded-xl border border-dashed p-3 transition ${
          isOver
            ? "border-sb-green/55 bg-sb-green/8 shadow-[0_0_30px_rgba(62,207,142,0.16)]"
            : "border-white/20 bg-black/25"
        }`}
      >
        <SortableContext
          items={itemIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className="relative z-10 overflow-x-auto pb-1">
            {pipeline.length === 0 ? (
              <div className="flex min-h-28 items-center justify-center rounded-xl border border-white/10 bg-black/25 px-4 text-center text-sm text-white/40">
                {t("empty")}
              </div>
            ) : (
              <div className="flex flex-wrap max-w-max items-center gap-3">
                {pipeline.map((block, index) => (
                  <div key={block.instanceId} className=" shrink-0">
                    <SortablePipelineItem
                      block={block}
                      index={index}
                      state={blockStates[block.instanceId] ?? "idle"}
                      onRemove={onRemove}
                      registerNode={(id, node) => {
                        if (node) itemRefs.current.set(id, node);
                        else itemRefs.current.delete(id);
                      }}
                      disableEditing={disableEditing}
                      removeLabel={t("removeBlock")}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </SortableContext>

        <ConnectionLines
          containerRef={containerRef}
          itemOrder={itemIds}
          itemRefs={itemRefs}
          blockStates={blockStates}
        />
      </div>
    </section>
  );
}
