import { getTranslations } from 'next-intl/server';
import { HomePage } from '@/components/home/HomePage';
import { getChallengeEnabledServer } from '@/src/lib/challenge/serverService';

interface LocalizedHomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocalizedHomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocalizedHomePage({ params }: LocalizedHomePageProps) {
  const { locale } = await params;
  const challengeEnabled = await getChallengeEnabledServer();
  return <HomePage locale={locale} challengeEnabled={challengeEnabled} />;
}
