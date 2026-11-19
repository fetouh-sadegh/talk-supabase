'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SECTION_IDS } from './TOC';

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.16, 1, 0.3, 1];
const SNAP_TOP_OFFSET = 48;

interface RevealHandlers {
  owner: symbol;
  sectionId: string;
  advance: () => boolean;
  retreat: () => boolean;
  revealed: number;
  total: number;
  isComplete: boolean;
  containerEl: HTMLElement | null;
  sectionEl: HTMLElement | null;
}

let activeHandlers: RevealHandlers | null = null;
const revealRegistry = new Map<symbol, RevealHandlers>();

export function setActiveRevealHandlers(handlers: RevealHandlers | null) {
  activeHandlers = handlers;
}

export function getActiveRevealHandlers() {
  return activeHandlers;
}

function getSectionElements() {
  return SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
}

function findCurrentSectionIndex(sections: HTMLElement[]) {
  const TOP_TOLERANCE = 6;
  const y = window.scrollY + SNAP_TOP_OFFSET + TOP_TOLERANCE;
  let current = 0;
  for (let i = 0; i < sections.length; i += 1) {
    if (sections[i].offsetTop <= y) current = i;
  }
  return current;
}

function isAtTop(el: HTMLElement) {
  const TOP_TOLERANCE = 10;
  return Math.abs(el.getBoundingClientRect().top - SNAP_TOP_OFFSET) <= TOP_TOLERANCE;
}

function scrollToTop(el: HTMLElement) {
  window.scrollTo({
    top: window.scrollY + el.getBoundingClientRect().top - SNAP_TOP_OFFSET,
    behavior: 'auto',
  });
}

function isContainerAligned(el: HTMLElement) {
  const CONTAINER_TOLERANCE = 48;
  return Math.abs(el.getBoundingClientRect().top - SNAP_TOP_OFFSET) <= CONTAINER_TOLERANCE;
}

function syncActiveHandlersByScroll() {
  const sections = getSectionElements();
  if (sections.length === 0) {
    activeHandlers = null;
    return { sections, currentIndex: -1, currentSection: null as HTMLElement | null, handlers: null as RevealHandlers | null };
  }

  const currentIndex = findCurrentSectionIndex(sections);
  const currentSection = sections[currentIndex] ?? null;

  let handlers: RevealHandlers | null = null;
  if (currentSection) {
    for (const entry of revealRegistry.values()) {
      if (entry.sectionId === currentSection.id) {
        handlers = entry;
        break;
      }
    }
  }

  activeHandlers = handlers;
  return { sections, currentIndex, currentSection, handlers };
}

function nudgeDownForTallReveal(containerEl: HTMLElement | null) {
  if (!containerEl) return;
  requestAnimationFrame(() => {
    const bottomGap = 28;
    const viewportBottom = window.innerHeight - bottomGap;
    const overflow = containerEl.getBoundingClientRect().bottom - viewportBottom;
    if (overflow > 0) {
      window.scrollBy({ top: Math.min(overflow, 220), behavior: 'auto' });
    }
  });
}

export function useScrollReveal(total: number) {
  const [revealed, setRevealed] = useState(0);

  const tryAdvance = useCallback(() => {
    if (revealed < total) {
      setRevealed((previous) => previous + 1);
      return true;
    }
    return false;
  }, [revealed, total]);

  const tryRetreat = useCallback(() => {
    if (revealed > 0) {
      setRevealed((previous) => previous - 1);
      return true;
    }
    return false;
  }, [revealed]);

  const isShown = useCallback((index: number) => index < revealed, [revealed]);
  const isComplete = revealed >= total;

  return { revealed, total, tryAdvance, tryRetreat, isShown, isComplete };
}

export function useRevealRegistration(
  _isInView: boolean,
  tryAdvance: () => boolean,
  tryRetreat: () => boolean,
  revealed: number,
  total: number,
  isComplete: boolean,
  containerRef?: React.RefObject<HTMLElement | null>,
) {
  const ownerRef = useRef(Symbol('reveal-section'));
  const advanceRef = useRef(tryAdvance);
  const retreatRef = useRef(tryRetreat);

  useEffect(() => {
    advanceRef.current = tryAdvance;
  }, [tryAdvance]);

  useEffect(() => {
    retreatRef.current = tryRetreat;
  }, [tryRetreat]);

  useEffect(() => {
    const owner = ownerRef.current;
    const containerEl = containerRef?.current ?? null;
    const sectionEl = containerEl?.closest('section[id]') ?? null;

    if (!containerEl || !sectionEl) {
      revealRegistry.delete(owner);
      if (activeHandlers?.owner === owner) activeHandlers = null;
      return;
    }

    const next: RevealHandlers = {
      owner,
      sectionId: (sectionEl as HTMLElement).id,
      advance: () => advanceRef.current(),
      retreat: () => retreatRef.current(),
      revealed,
      total,
      isComplete,
      containerEl,
      sectionEl: sectionEl as HTMLElement,
    };

    revealRegistry.set(owner, next);
    if (activeHandlers?.owner === owner) activeHandlers = next;

    return () => {
      revealRegistry.delete(owner);
      if (activeHandlers?.owner === owner) activeHandlers = null;
    };
  }, [_isInView, revealed, total, isComplete, containerRef]);
}

export function useGlobalRevealScroll() {
  useEffect(() => {
    let lastTime = 0;
    const THROTTLE = 320;

    const onWheel = (event: WheelEvent) => {
      const direction = event.deltaY > 0 ? 1 : -1;
      const now = Date.now();

      const { sections, currentIndex, currentSection, handlers } = syncActiveHandlersByScroll();
      if (!currentSection) return;

      if (handlers) {
        if (direction > 0 && !handlers.isComplete) {
          // Before first reveal, align reveal container once, then advance.
          if (handlers.revealed === 0 && handlers.containerEl && !isContainerAligned(handlers.containerEl)) {
            event.preventDefault();
            scrollToTop(handlers.containerEl);
            return;
          }

          if (now - lastTime < THROTTLE) {
            event.preventDefault();
            return;
          }

          const handled = handlers.advance();
          if (handled) {
            event.preventDefault();
            lastTime = now;
            nudgeDownForTallReveal(handlers.containerEl);
            return;
          }
        }

        if (direction < 0 && handlers.revealed > 0) {
          if (now - lastTime < THROTTLE) {
            event.preventDefault();
            return;
          }

          const handled = handlers.retreat();
          if (handled) {
            event.preventDefault();
            lastTime = now;
            return;
          }
        }
      }

      // Section-to-section navigation always snaps top edge to top edge.
      if (!isAtTop(currentSection)) {
        event.preventDefault();
        scrollToTop(currentSection);
        return;
      }

      const targetIndex =
        direction > 0
          ? Math.min(currentIndex + 1, sections.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (targetIndex === currentIndex) return;

      const target = sections[targetIndex];
      if (!target) return;

      event.preventDefault();
      scrollToTop(target);
      lastTime = now;
    };

    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      const { sections, currentIndex, currentSection, handlers } = syncActiveHandlersByScroll();
      if (!currentSection) return;

      if (event.code === 'ArrowDown' || event.code === 'Space') {
        if (handlers && !handlers.isComplete) {
          if (handlers.revealed === 0 && handlers.containerEl && !isContainerAligned(handlers.containerEl)) {
            scrollToTop(handlers.containerEl);
            event.preventDefault();
            return;
          }
          const handled = handlers.advance();
          if (handled) {
            nudgeDownForTallReveal(handlers.containerEl);
            event.preventDefault();
            return;
          }
        }

        const target = sections[Math.min(currentIndex + 1, sections.length - 1)];
        if (target && target !== currentSection) {
          scrollToTop(target);
          event.preventDefault();
        }
      } else if (event.code === 'ArrowUp') {
        if (handlers && handlers.revealed > 0) {
          const handled = handlers.retreat();
          if (handled) {
            event.preventDefault();
            return;
          }
        }

        const target = sections[Math.max(currentIndex - 1, 0)];
        if (target && target !== currentSection) {
          scrollToTop(target);
          event.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, []);
}

export function RevealItem({
  show,
  children,
  className = '',
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          transition={{ duration: 0.45, ease: EASE }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
