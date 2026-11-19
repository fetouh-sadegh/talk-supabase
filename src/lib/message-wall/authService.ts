import type { User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/src/lib/supabase';
import type { AuthUser, SignInInput, SignUpInput, UpdateProfileInput } from './types';

function toMetadataString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    name: toMetadataString(user.user_metadata?.name),
    position: toMetadataString(user.user_metadata?.position),
    profilImage: toMetadataString(user.user_metadata?.profil_image),
  };
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function uploadProfileImage(file: File, userId: string): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const path = `${userId}/${Date.now()}-${safeFileName(file.name)}`;

  const { error } = await supabase.storage.from('users').upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from('users').getPublicUrl(path);
  return data.publicUrl || path;
}

export async function signInWithSupabase(input: SignInInput): Promise<AuthUser> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Invalid login credentials');
  }

  return toAuthUser(data.user);
}

export async function signUpWithSupabase(input: SignUpInput): Promise<AuthUser> {
  const supabase = createSupabaseBrowserClient();
  const metadata = {
    name: input.name,
    position: input.position,
  };

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Could not create account.');
  }

  if (!input.profilImageFile) {
    return toAuthUser(data.user);
  }

  if (!data.session) {
    throw new Error(
      'Email confirmation is enabled. Confirm email first or disable confirmation for demo signup image upload.'
    );
  }

  const profilImage = await uploadProfileImage(input.profilImageFile, data.user.id);
  const { data: updated, error: updateError } = await supabase.auth.updateUser({
    data: {
      ...metadata,
      profil_image: profilImage,
    },
  });

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (!updated.user) {
    throw new Error('Could not create account.');
  }

  return toAuthUser(updated.user);
}

export async function signOutFromSupabase(): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getSupabaseAuthUser(): Promise<AuthUser | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (error.message === 'Auth session missing!') {
      return null;
    }
    throw new Error(error.message);
  }

  if (!data.user) {
    return null;
  }

  return toAuthUser(data.user);
}

export async function updateSupabaseProfile(input: UpdateProfileInput): Promise<AuthUser> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.updateUser({
    data: {
      name: input.name,
      position: input.position,
      profil_image: input.profilImage ?? null,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('User session not found.');
  }

  return toAuthUser(data.user);
}
