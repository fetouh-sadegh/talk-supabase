'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthUser, UpdateProfileInput } from '@/src/lib/message-wall/types';

interface ProfileModalProps {
  open: boolean;
  user: AuthUser | null;
  onClose: () => void;
  onSubmit: (input: UpdateProfileInput) => Promise<void>;
}

export function ProfileModal({ open, user, onClose, onSubmit }: ProfileModalProps) {
  const t = useTranslations('demo.profileModal');
  const tErrors = useTranslations('demo.errors');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [profilImage, setProfilImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(user?.name ?? '');
    setPosition(user?.position ?? '');
    setProfilImage(user?.profilImage ?? '');
    setError(null);
    setIsSubmitting(false);
  }, [open, user]);

  if (!open) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedPosition = position.trim();
    if (!trimmedName) {
      setError(tErrors('nameRequired'));
      return;
    }
    if (!trimmedPosition) {
      setError(tErrors('positionRequired'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: trimmedName,
        position: trimmedPosition,
        profilImage: profilImage.trim() || undefined,
      });
      onClose();
    } catch (err) {
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError(tErrors('requestFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 shadow-2xl">
        <h3 className="mb-1 text-lg font-semibold text-white">{t('title')}</h3>
        <p className="mb-4 text-xs text-white/45">{t('subtitle')}</p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/65">{t('nameLabel')}</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-sb-green/45"
              placeholder={t('namePlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/65">{t('positionLabel')}</label>
            <input
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-sb-green/45"
              placeholder={t('positionPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/65">{t('profilImageLabel')}</label>
            <input
              value={profilImage}
              onChange={(event) => setProfilImage(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-sb-green/45"
              placeholder={t('profilImagePlaceholder')}
            />
          </div>

          {error ? <p className="text-xs text-red-300">{error}</p> : null}

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
              {isSubmitting ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
