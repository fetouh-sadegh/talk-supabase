export type PositionFilter = 'All' | string;

export interface WallMessage {
  id: number;
  userId: string | null;
  text: string;
  color: string;
  createdAt: string;
  name: string | null;
  position: string | null;
  profilImage: string | null;
}

export interface MessageWallSnapshot {
  messages: WallMessage[];
  positions: string[];
}

export interface CreateMessageInput {
  text: string;
  color: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  position: string | null;
  profilImage: string | null;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput extends SignInInput {
  name: string;
  position: string;
  profilImageFile?: File;
}

export interface UpdateProfileInput {
  name: string;
  position: string;
  profilImage?: string;
}
