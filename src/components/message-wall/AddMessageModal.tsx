'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MAX_MESSAGE_LENGTH } from '@/src/lib/message-wall/store';

interface AddMessageInput {
  text: string;
  color: string;
}

interface AddMessageModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: AddMessageInput) => Promise<void>;
  externalError: string | null;
}

const COLORS = ['#3ecf8e', '#60a5fa', '#f59e0b', '#f472b6', '#a78bfa', '#22d3ee'];

export function AddMessageModal({
  open,
  onClose,
  onSubmit,
  externalError,
}: AddMessageModalProps) {
  const t = useTranslations('demo.addMessageModal');
  const tErrors = useTranslations('demo.errors');
  const [text, setText] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setText('');
    setColor(COLORS[0]);
    setLocalError(null);
    setIsSubmitting(false);
  }, [open]);

  const remaining = useMemo(() => MAX_MESSAGE_LENGTH - text.length, [text.length]);

  if (!open) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) {
      setLocalError(tErrors('messageRequired'));
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    try {
      await onSubmit({
        text: text.trim(),
        color,
      });
      onClose();
    } catch {
      // keep open, error rendered from store via externalError
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="mb-1 text-lg font-semibold text-white">{t('title')}</h3>
        <p className="mb-4 text-xs text-white/45">{t('subtitle')}</p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/65">{t('messageLabel')}</label>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              rows={5}
              className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-sb-green/45"
              placeholder={t('messagePlaceholder')}
            />
            <p className="mt-1 text-right text-[11px] text-white/45">
              {t('charsLeft', { count: remaining })}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/65">{t('colorLabel')}</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setColor(item)}
                  className={`h-7 w-7 rounded-full border ${
                    color === item ? 'border-white/80 ring-1 ring-white/40' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: item }}
                  aria-label={t('pickColor', { color: item })}
                />
              ))}
            </div>
          </div>

          {localError ? <p className="text-xs text-red-300">{localError}</p> : null}
          {externalError ? <p className="text-xs text-red-300">{externalError}</p> : null}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-white/10 px-3 text-sm text-white/70 hover:text-white"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 rounded-lg border border-sb-green/35 bg-sb-green/15 px-3 text-sm font-medium text-sb-green disabled:opacity-60"
            >
              {isSubmitting ? t('posting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
