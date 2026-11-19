'use client';

import { type ReactNode } from 'react';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  noPadding?: boolean;
  onClick?: () => void;
}

export function BentoCard({
  children,
  className = '',
  glowColor,
  noPadding = false,
  onClick,
}: BentoCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-xl border border-white/8 bg-white/3 backdrop-blur-sm transition-colors duration-300 hover:border-white/15 hover:bg-white/5 ${noPadding ? '' : 'p-6'} ${className}`}
      style={glowColor ? { boxShadow: `0 0 40px -10px ${glowColor}20` } : undefined}
    >
      {glowColor && (
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: glowColor }}
        />
      )}
      {children}
    </Tag>
  );
}

interface BentoIconCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  accent?: boolean;
}

export function BentoIconCard({
  icon,
  title,
  description,
  className = '',
  accent = false,
}: BentoIconCardProps) {
  return (
    <BentoCard className={className} glowColor={accent ? '#3ecf8e' : undefined}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sb-green">
        {icon}
      </div>
      <h3 className="mb-1.5 text-base font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-[#8b9098]">{description}</p>
    </BentoCard>
  );
}
