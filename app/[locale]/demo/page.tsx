import { MessageWallLayout } from '@/src/components/message-wall/MessageWallLayout';
import { getChallengeEnabledServer } from '@/src/lib/challenge/serverService';
import { fetchMessagesServer } from '@/src/lib/message-wall/fetchMessagesService';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import type { AuthUser, WallMessage } from '@/src/lib/message-wall/types';

interface DemoPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { locale } = await params;
  let initialMessages: WallMessage[] = [];
  let initialAuthUser: AuthUser | null = null;
  const challengeEnabled = await getChallengeEnabledServer();

  try {
    initialMessages = await fetchMessagesServer();
  } catch {
    initialMessages = [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user) {
      initialAuthUser = {
        id: user.id,
        email: user.email ?? null,
        name:
          typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim()
            ? user.user_metadata.name
            : null,
        position:
          typeof user.user_metadata?.position === 'string' && user.user_metadata.position.trim()
            ? user.user_metadata.position
            : null,
        profilImage:
          typeof user.user_metadata?.profil_image === 'string' &&
          user.user_metadata.profil_image.trim()
            ? user.user_metadata.profil_image
            : null,
      };
    }
  } catch {
    initialAuthUser = null;
  }

  return (
    <MessageWallLayout
      locale={locale}
      initialMessages={initialMessages}
      initialAuthUser={initialAuthUser}
      challengeEnabled={challengeEnabled}
    />
  );
}
