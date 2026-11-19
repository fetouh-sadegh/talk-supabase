import { ChallengeExperience } from '@/src/components/challenge/ChallengeExperience';
import { getChallengeOverviewServer } from '@/src/lib/challenge/serverService';

interface ChallengePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { locale } = await params;
  const initialOverview = await getChallengeOverviewServer();

  return (
    <ChallengeExperience
      locale={locale}
      initialOverview={initialOverview}
      challengeEnabled={initialOverview.challengeEnabled}
    />
  );
}
