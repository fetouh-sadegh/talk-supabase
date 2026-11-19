import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import type { WallMessage } from './types';

interface MessageRow {
  id: number;
  user_id: string | null;
  text: string;
  color: string;
  created_at: string;
  name: string | null;
  position: string | null;
  profil_image: string | null;
}

function toWallMessage(row: MessageRow): WallMessage {
  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    color: row.color,
    createdAt: row.created_at,
    name: row.name,
    position: row.position,
    profilImage: row.profil_image,
  };
}

export async function fetchMessagesServer(): Promise<WallMessage[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('messages_with_user')
    .select('id, user_id, text, color, created_at, name, position, profil_image')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(toWallMessage);
}
