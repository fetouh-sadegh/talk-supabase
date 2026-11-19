'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { messageWallService, type MessageWallService } from './service';
import { createMessage } from './createMessageService';
import type {
  AuthUser,
  CreateMessageInput,
  PositionFilter,
  SignInInput,
  SignUpInput,
  UpdateProfileInput,
  WallMessage,
} from './types';

export const MAX_MESSAGE_LENGTH = 500;

interface UseMessageWallStoreResult {
  isLoading: boolean;
  error: string | null;
  messages: WallMessage[];
  visibleMessages: WallMessage[];
  authUser: AuthUser | null;
  searchQuery: string;
  positionFilter: PositionFilter;
  availablePositions: string[];
  setSearchQuery: (value: string) => void;
  setPositionFilter: (value: PositionFilter) => void;
  clearError: () => void;
  reloadWall: () => Promise<void>;
  addMessage: (input: CreateMessageInput) => Promise<void>;
  deleteMessage: (messageId: number) => Promise<void>;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  signOut: () => Promise<void>;
}

function mergePositions(messages: WallMessage[], fromService: string[]): string[] {
  const set = new Set<string>();
  fromService.forEach((item) => {
    const value = item.trim();
    if (value) set.add(value);
  });
  messages.forEach((message) => {
    const value = message.position?.trim() ?? '';
    if (value) set.add(value);
  });
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function useMessageWallStore(
  initialMessages: WallMessage[] = [],
  initialAuthUser: AuthUser | null = null,
  service: MessageWallService = messageWallService
): UseMessageWallStoreResult {
  const t = useTranslations('demo.errors');
  const [messages, setMessages] = useState<WallMessage[]>(initialMessages);
  const [availablePositions, setAvailablePositions] = useState<string[]>(() =>
    mergePositions(initialMessages, [])
  );
  const [authUser, setAuthUser] = useState<AuthUser | null>(initialAuthUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('All');
  const isLoading = false;
  const [error, setError] = useState<string | null>(null);

  const reloadWall = useCallback(async () => {
    try {
      const user = await service.getAuthUser();
      setAuthUser(user);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError(t('loadFailed'));
      }
    }
  }, [service, t]);

  const visibleMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return messages
      .filter((message) => positionFilter === 'All' || (message.position ?? '') === positionFilter)
      .filter((message) => {
        if (!query) return true;
        const haystack = [message.text, message.name ?? '', message.position ?? '']
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [messages, positionFilter, searchQuery]);

  const clearError = useCallback(() => setError(null), []);

  const mapServiceError = useCallback(
    (message: string) => {
      if (message === 'Invalid email or password.') return t('invalidCredentials');
      if (message === 'Invalid login credentials') return t('invalidCredentials');
      if (message === 'Account already exists for this email.') return t('accountExists');
      if (message === 'User already registered') return t('accountExists');
      if (message === 'Auth session missing!') return t('signInFirst');
      if (message === 'You can only delete your own messages.') return t('deleteNotAllowed');
      if (message === 'Please sign in first.') return t('signInFirst');
      if (message === 'User session not found.') return t('signInFirst');
      if (message === 'Message not found.') return t('messageNotFound');
      return message;
    },
    [t]
  );

  const addMessage = useCallback(
    async (input: CreateMessageInput) => {
      const text = input.text.trim();
      if (!text) {
        const message = t('messageRequired');
        setError(message);
        throw new Error(message);
      }

      if (text.length > MAX_MESSAGE_LENGTH) {
        const message = t('messageTooLong', { max: MAX_MESSAGE_LENGTH });
        setError(message);
        throw new Error(message);
      }

      try {
        const created = await createMessage({
          text,
          color: input.color,
        });
        setMessages((previous) =>
          [created, ...previous].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        );
        setAvailablePositions((previous) => mergePositions([created], previous));
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.message) {
          const message = mapServiceError(err.message);
          setError(message);
          throw new Error(message);
        }
        const message = t('requestFailed');
        setError(message);
        throw new Error(message);
      }
    },
    [t, mapServiceError]
  );

  const deleteMessage = useCallback(
    async (messageId: number) => {
      try {
        await service.deleteMessage(messageId);
        setMessages((previous) => previous.filter((message) => message.id !== messageId));
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.message) {
          const message = mapServiceError(err.message);
          setError(message);
          throw new Error(message);
        }
        const message = t('requestFailed');
        setError(message);
        throw new Error(message);
      }
    },
    [service, t, mapServiceError]
  );

  const signIn = useCallback(
    async (input: SignInInput) => {
      const email = input.email.trim();
      const password = input.password;
      if (!email) {
        const message = t('emailRequired');
        setError(message);
        throw new Error(message);
      }
      if (!password) {
        const message = t('passwordRequired');
        setError(message);
        throw new Error(message);
      }

      try {
        const user = await service.signIn({ email, password });
        setAuthUser(user);
        setError(null);
        await reloadWall();
      } catch (err) {
        if (err instanceof Error && err.message) {
          const message = mapServiceError(err.message);
          setError(message);
          throw new Error(message);
        }
        const message = t('requestFailed');
        setError(message);
        throw new Error(message);
      }
    },
    [service, t, reloadWall, mapServiceError]
  );

  const signUp = useCallback(
    async (input: SignUpInput) => {
      const email = input.email.trim();
      const password = input.password;
      const name = input.name.trim();
      const position = input.position.trim();

      if (!email) {
        const message = t('emailRequired');
        setError(message);
        throw new Error(message);
      }
      if (!password) {
        const message = t('passwordRequired');
        setError(message);
        throw new Error(message);
      }
      if (!name) {
        const message = t('nameRequired');
        setError(message);
        throw new Error(message);
      }
      if (!position) {
        const message = t('positionRequired');
        setError(message);
        throw new Error(message);
      }

      try {
        const user = await service.signUp({
          email,
          password,
          name,
          position,
          profilImageFile: input.profilImageFile,
        });
        setAuthUser(user);
        setError(null);
        await reloadWall();
      } catch (err) {
        if (err instanceof Error && err.message) {
          const message = mapServiceError(err.message);
          setError(message);
          throw new Error(message);
        }
        const message = t('requestFailed');
        setError(message);
        throw new Error(message);
      }
    },
    [service, t, reloadWall, mapServiceError]
  );

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      const name = input.name.trim();
      const position = input.position.trim();
      if (!name) {
        const message = t('nameRequired');
        setError(message);
        throw new Error(message);
      }
      if (!position) {
        const message = t('positionRequired');
        setError(message);
        throw new Error(message);
      }

      try {
        const user = await service.updateProfile({
          name,
          position,
          profilImage: input.profilImage?.trim() || undefined,
        });
        setAuthUser(user);
        setError(null);
        await reloadWall();
      } catch (err) {
        if (err instanceof Error && err.message) {
          const message = mapServiceError(err.message);
          setError(message);
          throw new Error(message);
        }
        const message = t('requestFailed');
        setError(message);
        throw new Error(message);
      }
    },
    [service, t, reloadWall, mapServiceError]
  );

  const signOut = useCallback(async () => {
    try {
      await service.signOut();
      setAuthUser(null);
      setError(null);
      await reloadWall();
    } catch (err) {
      if (err instanceof Error && err.message) {
        const message = mapServiceError(err.message);
        setError(message);
        throw new Error(message);
      }
      const message = t('requestFailed');
      setError(message);
      throw new Error(message);
    }
  }, [service, reloadWall, t, mapServiceError]);

  return {
    isLoading,
    error,
    messages,
    visibleMessages,
    authUser,
    searchQuery,
    positionFilter,
    availablePositions,
    setSearchQuery,
    setPositionFilter,
    clearError,
    reloadWall,
    addMessage,
    deleteMessage,
    signIn,
    signUp,
    updateProfile,
    signOut,
  };
}
