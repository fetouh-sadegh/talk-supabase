import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { WallMessage } from '@/src/lib/message-wall/types';

interface MessageCardProps {
  message: WallMessage;
  locale: string;
  canDelete?: boolean;
  onDelete?: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'U';
}

export function MessageCard({ message, locale, canDelete = false, onDelete }: MessageCardProps) {
  const t = useTranslations('demo');
  const stamp = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(message.createdAt));

  const displayName = message.name?.trim() || t('anonymousName');
  const displayPosition = message.position?.trim() || t('anonymousPosition');

  return (
    <article
      className="w-full rounded-xl border bg-white/3 p-5"
      style={{
        borderColor: `${message.color}55`,
        background: `linear-gradient(160deg, ${message.color}22 0%, rgba(17,17,17,0.9) 48%, rgba(10,10,10,0.94) 100%)`,
      }}
    >
      <header className="mb-3 flex items-start gap-2.5">
        <div className="mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5">
          {message.profilImage ? (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url("${message.profilImage}")` }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white/70">
              {getInitials(displayName)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white/90">{displayName}</p>
          <p className="text-[10px] text-white/40">
            {displayPosition} - {stamp}
          </p>
        </div>

        {canDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-white/15 bg-black/25 p-1 text-white/55 transition hover:text-white"
            title={t('deleteMessage')}
            aria-label={t('deleteMessage')}
          >
            <Trash2 size={13} />
          </button>
        ) : null}
      </header>

      <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/65">{message.text}</p>
    </article>
  );
}
