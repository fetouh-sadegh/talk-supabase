'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SignInInput, SignUpInput } from '@/src/lib/message-wall/types';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignIn: (input: SignInInput) => Promise<void>;
  onSignUp: (input: SignUpInput) => Promise<void>;
}

type AuthMode = 'signin' | 'signup';

export function AuthModal({ open, onClose, onSignIn, onSignUp }: AuthModalProps) {
  const t = useTranslations('demo.authModal');
  const tErrors = useTranslations('demo.errors');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [profilImageFile, setProfilImageFile] = useState<File | null>(null);
  const [profilImagePreview, setProfilImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProfilImageFile(null);
      setProfilImagePreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return '';
      });
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setProfilImageFile(file);
    setProfilImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return nextPreview;
    });
  };

  useEffect(() => {
    if (!open) return;
    setMode('signin');
    setEmail('');
    setPassword('');
    setName('');
    setPosition('');
    setProfilImageFile(null);
    setProfilImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return '';
    });
    setError(null);
    setIsSubmitting(false);
  }, [open]);

  useEffect(() => {
    return () => {
      if (profilImagePreview) {
        URL.revokeObjectURL(profilImagePreview);
      }
    };
  }, [profilImagePreview]);

  if (!open) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await onSignIn({
          email,
          password,
        });
      } else {
        await onSignUp({
          email,
          password,
          name,
          position,
          profilImageFile: profilImageFile ?? undefined,
        });
      }
      onClose();
    } catch (err) {
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError(tErrors('authFailed'));
      }
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
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              mode === 'signin'
                ? 'bg-sb-green/20 text-sb-green'
                : 'text-white/55 hover:text-white/80'
            }`}
          >
            {t('signInTab')}
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              mode === 'signup'
                ? 'bg-sb-green/20 text-sb-green'
                : 'text-white/55 hover:text-white/80'
            }`}
          >
            {t('signUpTab')}
          </button>
        </div>

        <h3 className="mb-1 text-lg font-semibold text-white">
          {mode === 'signin' ? t('signInTitle') : t('signUpTitle')}
        </h3>
        <p className="mb-4 text-xs text-white/45">
          {mode === 'signin' ? t('signInSubtitle') : t('signUpSubtitle')}
        </p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/65">{t('emailLabel')}</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-sb-green/45"
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/65">{t('passwordLabel')}</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-sb-green/45"
              placeholder={t('passwordPlaceholder')}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'signup' ? (
            <>
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
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="block h-10 w-full rounded-lg border border-white/10 bg-black/35 px-2 text-xs text-white/80 outline-none file:mr-3 file:h-7 file:rounded-md file:border-0 file:bg-sb-green/20 file:px-2 file:text-xs file:font-medium file:text-sb-green hover:file:bg-sb-green/30 focus:border-sb-green/45"
                />
                {profilImagePreview ? (
                  <div className="mt-2 rounded-lg border border-white/10 bg-black/20 p-2">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-white/45">
                      {t('preview')}
                    </p>
                    <div
                      className="h-16 w-16 rounded-full border border-white/15 bg-cover bg-center"
                      style={{ backgroundImage: `url("${profilImagePreview}")` }}
                    />
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

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
              {isSubmitting
                ? t('saving')
                : mode === 'signin'
                ? t('signInSubmit')
                : t('signUpSubmit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
