import { getTranslations } from 'next-intl/server';
import { PresentationLayout } from '@/components/presentation/PresentationLayout';
import { getChallengeEnabledServer } from '@/src/lib/challenge/serverService';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'presentation.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function PresentationPage({ params }: PageProps) {
  const { locale } = await params;
  const challengeEnabled = await getChallengeEnabledServer();
  return <PresentationLayout locale={locale} challengeEnabled={challengeEnabled} />;
}
