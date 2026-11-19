import type {
  AuthUser,
  CreateMessageInput,
  MessageWallSnapshot,
  SignInInput,
  SignUpInput,
  UpdateProfileInput,
  WallMessage,
} from './types';
import {
  getSupabaseAuthUser,
  signInWithSupabase,
  signOutFromSupabase,
  signUpWithSupabase,
  updateSupabaseProfile,
} from './authService';

interface DemoAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  position: string;
  profilImage: string | null;
}

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

const INITIAL_ACCOUNTS: DemoAccount[] = [
  {
    id: 'user-1',
    email: 'lina@example.com',
    password: 'demo12345',
    name: 'Lina Ahmed',
    position: 'Student',
    profilImage: null,
  },
  {
    id: 'user-2',
    email: 'marcus@example.com',
    password: 'demo12345',
    name: 'Marcus Diallo',
    position: 'Professional',
    profilImage: null,
  },
];

const INITIAL_MESSAGES: WallMessage[] = [
  {
    id: 1,
    userId: 'user-1',
    text: 'Connected the form UI and local state. Next step is wiring real Supabase queries.',
    color: '#3ecf8e',
    createdAt: minutesAgo(55),
    name: 'Lina Ahmed',
    position: 'Student',
    profilImage: null,
  },
  {
    id: 2,
    userId: 'user-2',
    text: 'This wall is now UI-only mode so we can demo flow safely before backend integration.',
    color: '#60a5fa',
    createdAt: minutesAgo(42),
    name: 'Marcus Diallo',
    position: 'Professional',
    profilImage: null,
  },
  {
    id: 3,
    userId: null,
    text: 'Anonymous post test.',
    color: '#f59e0b',
    createdAt: minutesAgo(20),
    name: null,
    position: null,
    profilImage: null,
  },
];

function collectPositions(messages: WallMessage[], accounts: DemoAccount[]): string[] {
  const set = new Set<string>();
  accounts.forEach((account) => {
    const value = account.position.trim();
    if (value) set.add(value);
  });
  messages.forEach((message) => {
    const value = message.position?.trim() ?? '';
    if (value) set.add(value);
  });
  return [...set].sort((a, b) => a.localeCompare(b));
}

export interface MessageWallService {
  listWall(): Promise<MessageWallSnapshot>;
  createMessage(input: CreateMessageInput): Promise<WallMessage>;
  deleteMessage(messageId: number): Promise<void>;
  signIn(input: SignInInput): Promise<AuthUser>;
  signUp(input: SignUpInput): Promise<AuthUser>;
  updateProfile(input: UpdateProfileInput): Promise<AuthUser>;
  signOut(): Promise<void>;
  getAuthUser(): Promise<AuthUser | null>;
}

class UiOnlyMessageWallService implements MessageWallService {
  private accounts: DemoAccount[] = [...INITIAL_ACCOUNTS];
  private messages: WallMessage[] = [...INITIAL_MESSAGES];
  private currentUserId: string | null = null;
  private nextMessageId = 4;

  async listWall(): Promise<MessageWallSnapshot> {
    return {
      messages: [...this.messages].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
      positions: collectPositions(this.messages, this.accounts),
    };
  }

  async createMessage(input: CreateMessageInput): Promise<WallMessage> {
    const user = this.accounts.find((account) => account.id === this.currentUserId) ?? null;
    const created: WallMessage = {
      id: this.nextMessageId++,
      userId: user?.id ?? null,
      text: input.text.trim(),
      color: input.color.trim(),
      createdAt: new Date().toISOString(),
      name: user?.name ?? null,
      position: user?.position ?? null,
      profilImage: user?.profilImage ?? null,
    };

    this.messages = [created, ...this.messages];
    return created;
  }

  async deleteMessage(messageId: number): Promise<void> {
    const target = this.messages.find((message) => message.id === messageId);
    if (!target) {
      throw new Error('Message not found.');
    }

    if (!this.currentUserId || target.userId !== this.currentUserId) {
      throw new Error('You can only delete your own messages.');
    }

    this.messages = this.messages.filter((message) => message.id !== messageId);
  }

  async signIn(input: SignInInput): Promise<AuthUser> {
    const user = await signInWithSupabase(input);
    this.currentUserId = user.id;
    return user;
  }

  async signUp(input: SignUpInput): Promise<AuthUser> {
    const user = await signUpWithSupabase(input);
    this.currentUserId = user.id;
    return user;
  }

  async updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
    const user = await updateSupabaseProfile(input);
    this.currentUserId = user.id;
    this.messages = this.messages.map((message) =>
      message.userId === user.id
        ? {
            ...message,
            name: user.name,
            position: user.position,
            profilImage: user.profilImage,
          }
        : message
    );
    return user;
  }

  async signOut(): Promise<void> {
    await signOutFromSupabase();
    this.currentUserId = null;
  }

  async getAuthUser(): Promise<AuthUser | null> {
    const user = await getSupabaseAuthUser();
    this.currentUserId = user?.id ?? null;
    return user;
  }
}

export const messageWallService: MessageWallService = new UiOnlyMessageWallService();
