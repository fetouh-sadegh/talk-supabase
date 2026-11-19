"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import type {
  ChallengeOverview,
  ClaimExecutionResult,
  PaletteBlockId,
  PipelineBlock,
} from "@/src/lib/challenge/types";
import { challengeService, PALETTE_BLOCKS } from "@/src/lib/challenge/service";
import { ChallengeHeader } from "./ChallengeHeader";
import { ChallengeForm } from "./ChallengeForm";
import { BlockPalette } from "./BlockPalette";
import { PipelineBuilder, type BlockVisualState } from "./PipelineBuilder";
import { RunPanel } from "./RunPanel";
import { MainNav } from "@/components/shared/MainNav";

function createInstanceId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `pipe-${crypto.randomUUID()}`;
  }
  return `pipe-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PHONE_REGEX = /^[+]?[0-9()\-\s]{7,20}$/;

interface ChallengeExperienceProps {
  locale: string;
  initialOverview: ChallengeOverview;
  challengeEnabled: boolean;
}

export function ChallengeExperience({
  locale,
  initialOverview,
  challengeEnabled,
}: ChallengeExperienceProps) {
  const t = useTranslations("challenge");
  const tErrors = useTranslations("challenge.errors");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [whatsappError, setWhatsappError] = useState<string | undefined>();

  const [isChallengeEnabled, setIsChallengeEnabled] =
    useState(challengeEnabled);
  const [codesRemaining, setCodesRemaining] = useState(
    initialOverview.codesRemaining,
  );
  const [claimedEntries, setClaimedEntries] = useState(
    initialOverview.claimedEntries,
  );
  const [pipeline, setPipeline] = useState<PipelineBlock[]>([]);
  const [activeDragLabel, setActiveDragLabel] = useState<string | null>(null);
  const [blockStates, setBlockStates] = useState<
    Record<string, BlockVisualState>
  >({});

  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"idle" | "error" | "success">(
    "idle",
  );
  const [resultMode, setResultMode] = useState<
    "claim" | "preview" | undefined
  >();
  const [claimId, setClaimId] = useState<string | null>(null);
  const [codeLabel, setCodeLabel] = useState<string | null>(null);

  const paletteById = useMemo(
    () => new Map(PALETTE_BLOCKS.map((block) => [block.id, block])),
    [],
  );
  const allCodesClaimed =
    codesRemaining.total > 0 && codesRemaining.remaining <= 0;

  const mapServiceError = (message: string) => {
    if (message === "Pipeline is empty. Add blocks before running.") {
      return tErrors("pipelineEmptyBeforeRun");
    }
    if (message === "Pipeline must start with supabase_client.") {
      return tErrors("mustStartWithClient");
    }
    if (message === "Missing operation block: rpc or select_available_code.") {
      return tErrors("missingOperation");
    }
    if (message === "Missing rpc step before function call.") {
      return tErrors("missingRpcStep");
    }
    if (message === "Missing RPC function name.") {
      return tErrors("missingRpcFunction");
    }
    if (message === "Wrong RPC function name") {
      return tErrors("wrongRpcFunction");
    }

    if (message.startsWith("Unexpected block after query: ")) {
      return tErrors("unexpectedAfterQuery", {
        block: message.replace("Unexpected block after query: ", ""),
      });
    }
    if (message.startsWith("Unsupported parameter: ")) {
      return tErrors("unsupportedParameter", {
        block: message.replace("Unsupported parameter: ", ""),
      });
    }
    if (message.startsWith("Parameter duplicated: ")) {
      return tErrors("parameterDuplicated", {
        block: message.replace("Parameter duplicated: ", ""),
      });
    }
    if (message.startsWith("Unexpected block after function: ")) {
      return tErrors("unexpectedAfterFunction", {
        block: message.replace("Unexpected block after function: ", ""),
      });
    }
    if (message.startsWith("Missing required parameter: ")) {
      return tErrors("missingRequiredParameter", {
        block: message.replace("Missing required parameter: ", ""),
      });
    }
    if (message === "this whatsapp already claimed a code") {
      return tErrors("whatsappAlreadyClaimed");
    }
    if (message === "no codes remaining") {
      return tErrors("noCodesRemaining");
    }
    if (message === "claim conflict, please retry") {
      return tErrors("claimConflict");
    }
    if (message === "Challenge is disabled.") {
      return tErrors("challengeDisabled");
    }

    return tErrors("requestFailed");
  };

  useEffect(() => {
    Promise.all([
      challengeService.getCodesRemaining(),
      challengeService.getClaimedEntries(),
      challengeService.getChallengeEnabled(),
    ])
      .then(([codes, entries, enabled]) => {
        setCodesRemaining(codes);
        setClaimedEntries(entries);
        setIsChallengeEnabled(enabled);
      })
      .catch(() => {
        // keep server-provided initial values on failure
      });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const clearStatus = () => {
    setStatusMessage(null);
    setStatusTone("idle");
    setResultMode(undefined);
    setClaimId(null);
    setCodeLabel(null);
  };

  const pushPaletteBlock = (sourceId: PaletteBlockId, overId?: string) => {
    const source = paletteById.get(sourceId);
    if (!source) return;

    const next: PipelineBlock = {
      instanceId: createInstanceId(),
      sourceId: source.id,
      kind: source.kind,
      label: source.label,
    };

    setPipeline((previous) => {
      const overIndex = overId
        ? previous.findIndex((item) => item.instanceId === overId)
        : -1;
      if (overIndex >= 0) {
        const copy = [...previous];
        copy.splice(overIndex, 0, next);
        return copy;
      }
      return [...previous, next];
    });
  };

  const onRun = async () => {
    clearStatus();
    setNameError(undefined);
    setWhatsappError(undefined);

    const trimmedName = fullName.trim();
    const trimmedWhatsapp = whatsapp.trim();
    let hasError = false;

    if (!trimmedName) {
      setNameError(tErrors("nameRequired"));
      hasError = true;
    }

    if (!trimmedWhatsapp) {
      setWhatsappError(tErrors("whatsappRequired"));
      hasError = true;
    } else if (!PHONE_REGEX.test(trimmedWhatsapp)) {
      setWhatsappError(tErrors("invalidPhone"));
      hasError = true;
    }

    if (hasError) {
      setStatusTone("error");
      setStatusMessage(tErrors("fixFormErrors"));
      return;
    }

    if (pipeline.length === 0) {
      setStatusTone("error");
      setStatusMessage(tErrors("pipelineEmpty"));
      return;
    }

    if (!isChallengeEnabled) {
      setStatusTone("error");
      setStatusMessage(tErrors("challengeDisabled"));
      return;
    }

    setIsRunning(true);
    const resetStates: Record<string, BlockVisualState> = {};
    pipeline.forEach((item) => {
      resetStates[item.instanceId] =
        blockStates[item.instanceId] === "success" ? "success" : "idle";
    });
    setBlockStates(resetStates);

    let result: ClaimExecutionResult;
    try {
      result = await challengeService.executeClaim({
        fullName: trimmedName,
        whatsapp: trimmedWhatsapp,
        pipeline,
      });
    } catch {
      setStatusTone("error");
      setStatusMessage(tErrors("executionUnexpected"));
      setIsRunning(false);
      return;
    }

    for (const step of result.stepResults) {
      if (step.instanceId) {
        setBlockStates((prev) => ({ ...prev, [step.instanceId!]: "running" }));
        await sleep(280);

        if (step.ok) {
          setBlockStates((prev) => ({
            ...prev,
            [step.instanceId!]: "success",
          }));
        } else {
          setBlockStates((prev) => ({ ...prev, [step.instanceId!]: "error" }));
          break;
        }
      } else if (!step.ok) {
        await sleep(180);
        break;
      }
    }

    if (result.ok && result.claimId && result.codeLabel) {
      setStatusTone("success");
      setResultMode(result.mode);
      setStatusMessage(
        result.mode === "preview"
          ? t("status.previewSuccess")
          : t("status.claimSuccess"),
      );
      setClaimId(result.claimId);
      setCodeLabel(result.codeLabel);
      confetti({
        particleCount: 130,
        spread: 65,
        origin: { y: 0.63 },
      });
    } else {
      setStatusTone("error");
      setStatusMessage(
        result.error ? mapServiceError(result.error) : tErrors("requestFailed"),
      );
    }

    Promise.all([
      challengeService.getCodesRemaining(),
      challengeService.getClaimedEntries(),
    ])
      .then(([codes, entries]) => {
        setCodesRemaining(codes);
        setClaimedEntries(entries);
      })
      .catch(() => {
        // keep existing values if refresh fails
      });

    setIsRunning(false);
  };

  const onReset = () => {
    setPipeline([]);
    setBlockStates({});
    setFullName("");
    setWhatsapp("");
    setNameError(undefined);
    setWhatsappError(undefined);
    clearStatus();
  };

  return (
    <div className="presentation-bg min-h-screen text-white">
      <div className="pointer-events-none absolute inset-0 presentation-glow" />
      <MainNav locale={locale} challengeEnabled={isChallengeEnabled} />
      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-14 sm:pt-28 sm:pb-20">
        <ChallengeHeader
          remaining={codesRemaining.remaining}
          total={codesRemaining.total}
          challengeEnabled={isChallengeEnabled}
          allCodesClaimed={allCodesClaimed}
        />

        <section className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <h2 className="mb-2 text-sm font-semibold text-white/85">
            {t("claimed.title")}
          </h2>
          {claimedEntries.length === 0 ? (
            <p className="text-sm text-white/55">{t("claimed.empty")}</p>
          ) : (
            <div className="space-y-2">
              {claimedEntries.map((entry, index) => (
                <div
                  key={`${entry.whatsapp}-${entry.code}-${index}`}
                  className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/80"
                >
                  <p>
                    <span className="text-white/55">{t("claimed.name")}: </span>
                    <span className="font-medium text-white">{entry.name}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <ChallengeForm
          fullName={fullName}
          whatsapp={whatsapp}
          onNameChange={setFullName}
          onWhatsappChange={setWhatsapp}
          nameError={nameError}
          whatsappError={whatsappError}
        />

        <DndContext
          sensors={sensors}
          onDragStart={(event) => {
            const id = String(event.active.id);
            if (id.startsWith("palette:")) {
              const sourceId = id.replace("palette:", "") as PaletteBlockId;
              setActiveDragLabel(paletteById.get(sourceId)?.label ?? sourceId);
              return;
            }
            const pipelineItem = pipeline.find(
              (item) => item.instanceId === id,
            );
            setActiveDragLabel(pipelineItem?.label ?? null);
          }}
          onDragCancel={() => setActiveDragLabel(null)}
          onDragEnd={(event) => {
            setActiveDragLabel(null);
            if (isRunning) return;

            const activeId = String(event.active.id);
            const overId = event.over ? String(event.over.id) : undefined;
            if (!overId) return;

            if (activeId.startsWith("palette:")) {
              const sourceId = activeId.replace(
                "palette:",
                "",
              ) as PaletteBlockId;
              if (overId === "pipeline-dropzone") {
                pushPaletteBlock(sourceId);
                return;
              }
              const isOverPipelineItem = pipeline.some(
                (item) => item.instanceId === overId,
              );
              if (!isOverPipelineItem) return;
              pushPaletteBlock(sourceId, overId);
              return;
            }

            const oldIndex = pipeline.findIndex(
              (item) => item.instanceId === activeId,
            );
            if (oldIndex < 0) return;

            if (overId === "pipeline-dropzone") {
              setPipeline((prev) => {
                if (oldIndex === prev.length - 1) return prev;
                return arrayMove(prev, oldIndex, prev.length - 1);
              });
              return;
            }

            const newIndex = pipeline.findIndex(
              (item) => item.instanceId === overId,
            );
            if (newIndex < 0 || newIndex === oldIndex) return;
            setPipeline((prev) => arrayMove(prev, oldIndex, newIndex));
          }}
        >
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.85fr_1.25fr]">
            <BlockPalette blocks={PALETTE_BLOCKS} />

            <PipelineBuilder
              pipeline={pipeline}
              onRemove={(instanceId) =>
                setPipeline((prev) =>
                  prev.filter((item) => item.instanceId !== instanceId),
                )
              }
              blockStates={blockStates}
              disableEditing={isRunning}
            />
          </div>

          <div className="mt-4">
            <RunPanel
              isRunning={isRunning}
              canRun={pipeline.length > 0 && isChallengeEnabled}
              statusMessage={statusMessage}
              statusTone={statusTone}
              claimId={claimId}
              codeLabel={codeLabel}
              resultMode={resultMode}
              onRun={onRun}
              onReset={onReset}
            />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDragLabel ? (
              <div className="rounded-2xl border border-white/25 bg-black/75 px-3 py-1.5 text-xs font-medium text-white shadow-xl backdrop-blur-sm">
                {activeDragLabel}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
