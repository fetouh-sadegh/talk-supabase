import { useTranslations } from 'next-intl';

interface ChallengeFormProps {
  fullName: string;
  whatsapp: string;
  onNameChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  nameError?: string;
  whatsappError?: string;
}

export function ChallengeForm({
  fullName,
  whatsapp,
  onNameChange,
  onWhatsappChange,
  nameError,
  whatsappError,
}: ChallengeFormProps) {
  const t = useTranslations('challenge.form');

  return (
    <section className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-white/55">
            {t('fullNameLabel')}
          </label>
          <input
            value={fullName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={t('fullNamePlaceholder')}
            className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-sb-green/45"
          />
          {nameError ? <p className="mt-1 text-xs text-red-300">{nameError}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-white/55">
            {t('whatsappLabel')}
          </label>
          <input
            value={whatsapp}
            onChange={(event) => onWhatsappChange(event.target.value)}
            placeholder={t('whatsappPlaceholder')}
            className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-sb-green/45"
          />
          {whatsappError ? <p className="mt-1 text-xs text-red-300">{whatsappError}</p> : null}
        </div>
      </div>
    </section>
  );
}
