'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Amount of element that must be in view before animating (0-1) */
  amount?: number;
}

const variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export function SectionWrapper({
  id,
  children,
  className = '',
  delay = 0,
  amount = 0.15,
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: false,
    amount,
    margin: '0px 0px -10% 0px',
  });

  return (
    <section
      id={id}
      ref={ref}
      className={`relative min-h-screen ${className}`}
    >
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={variants}
        transition={{
          duration: 0.7,
          delay,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </section>
  );
}

/** Staggered children wrapper — each child animates in sequence */
export function StaggerWrapper({
  children,
  className = '',
  isInView,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  isInView: boolean;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { staggerChildren: stagger } },
        hidden: {},
      }}
    >
      {children}
    </motion.div>
  );
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};
