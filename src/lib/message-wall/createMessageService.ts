import { createSupabaseBrowserClient } from '@/src/lib/supabase';
import type { CreateMessageInput, WallMessage } from './types';

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

export async function createMessage(input: CreateMessageInput): Promise<WallMessage> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('message')
    .insert({
      text: input.text,
      color: input.color,
      user_id: user?.id ?? null,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: fullMessage, error: messageError } = await supabase
    .from('messages_with_user')
    .select('id, user_id, text, color, created_at, name, position, profil_image')
    .eq('id', data.id)
    .single();

  if (messageError) {
    throw new Error(messageError.message);
  }

  return toWallMessage(fullMessage);
}
