'use client';

import { motion } from 'framer-motion';
import { useLayoutEffect, useState } from 'react';

type BlockVisualState = 'idle' | 'running' | 'success' | 'error';

interface ConnectionLinesProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  itemOrder: string[];
  itemRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  blockStates: Record<string, BlockVisualState>;
}

interface LineShape {
  id: string;
  d: string;
  color: string;
}

function lineColor(stateA: BlockVisualState, stateB: BlockVisualState): string {
  if (stateA === 'error' || stateB === 'error') return 'rgba(248, 113, 113, 0.95)';
  if (stateA === 'running' || stateB === 'running') return 'rgba(250, 204, 21, 0.95)';
  if (stateA === 'success' && stateB === 'success') return 'rgba(62, 207, 142, 0.95)';
  return 'rgba(255, 255, 255, 0.22)';
}

export function ConnectionLines({
  containerRef,
  itemOrder,
  itemRefs,
  blockStates,
}: ConnectionLinesProps) {
  const [lines, setLines] = useState<LineShape[]>([]);

  useLayoutEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      if (!container || itemOrder.length < 2) {
        setLines([]);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const nextLines: LineShape[] = [];

      for (let i = 0; i < itemOrder.length - 1; i += 1) {
        const from = itemRefs.current.get(itemOrder[i]);
        const to = itemRefs.current.get(itemOrder[i + 1]);
        if (!from || !to) continue;

        const fromRect = from.getBoundingClientRect();
        const toRect = to.getBoundingClientRect();

        const x1 = fromRect.right - containerRect.left - 8;
        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
        const x2 = toRect.left - containerRect.left + 8;
        const y2 = toRect.top + toRect.height / 2 - containerRect.top;
        const controlX = (x1 + x2) / 2;
        const d = `M ${x1} ${y1} C ${controlX} ${y1} ${controlX} ${y2} ${x2} ${y2}`;

        nextLines.push({
          id: `${itemOrder[i]}-${itemOrder[i + 1]}`,
          d,
          color: lineColor(blockStates[itemOrder[i]] ?? 'idle', blockStates[itemOrder[i + 1]] ?? 'idle'),
        });
      }

      setLines(nextLines);
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [blockStates, containerRef, itemOrder, itemRefs]);

  if (lines.length === 0) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible">
      {lines.map((line) => (
        <motion.path
          key={line.id}
          d={line.d}
          stroke={line.color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}
