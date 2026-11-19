# SUPABASE_DEMO_GUIDE

This guide explains how to connect the existing Message Wall demo UI to Supabase.

Scope:
- Route entry: `app/[locale]/demo/page.tsx`
- Main UI: `src/components/message-wall/MessageWallLayout.tsx`
- Current mock data flow: `src/lib/message-wall/store.ts` -> `src/lib/message-wall/service.ts` -> `src/lib/message-wall/mock.ts`

Important:
- This guide is implementation-focused.
- It explains WHAT to change, WHERE, and WHY.
- It does not provide full replacement files.

---

## 1) Create the Supabase project

### WHAT
- Create a new Supabase project.
- Copy:
  - Project URL
  - anon public key
- For live demo convenience, disable email confirmation.

### WHERE
- Supabase dashboard:
  - `Project Settings` -> `API` for URL + anon key
  - `Authentication` -> `Providers` -> `Email` -> disable "Confirm email" (or equivalent toggle)
- Project root (same level as `package.json`): create `.env.local`

### WHY
- The frontend client needs these env vars to connect securely to your Supabase project.
- Disabling email confirmation avoids friction during a live demo.

### Add in `.env.local`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

---

## 2) Install Supabase client

### WHAT
- Install `@supabase/supabase-js`.
- Create a shared Supabase browser client file.

### WHERE
- Install dependency in project root.
- Create file: `src/lib/supabase/client.ts`

### WHY
- You need one reusable client instance across store/service layers.
- Centralizing the client avoids duplicated setup and key mismatches.

### `src/lib/supabase/client.ts` should export
- A configured Supabase client created from:
  - `process.env.NEXT_PUBLIC_SUPABASE_URL`
  - `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How demo page uses it
- `src/lib/message-wall/service.ts` imports this client.
- Store (`src/lib/message-wall/store.ts`) calls service methods backed by Supabase.

---

## 3) Replace Mock Auth with Supabase Auth

### WHAT
Replace mock account flow with real auth methods:
- `supabase.auth.signUp`
- `supabase.auth.signInWithPassword`
- `supabase.auth.signOut`
- Read active session/user via `supabase.auth.getSession` and auth state listener.

### WHERE
- `src/lib/message-wall/store.ts`
  - `signUp(...)` currently creates mock profile only.
  - Add real sign-in function (currently missing in store contract).
  - Add sign-out function.
  - On mount, load current session and map to profile.
- `src/components/message-wall/AuthModal.tsx`
  - Currently "Create account" only.
  - Add sign-in mode (email/password) and sign-up mode.
- `src/components/message-wall/MessageWallLayout.tsx`
  - Wire modal actions to sign-in/sign-up.
  - Add logout button (best place: floating action buttons near `Profile` / `Add`).

### WHY
- Current flow is local-only (mock profile creation) and not persistent.
- Real auth is required to bind messages/profiles to real users and enforce RLS.

### Notes for this codebase
- Current `AuthModal` accepts profile fields (`name`, `role`, `avatarUrl`) but no email/password.
- Introduce email/password inputs for auth; keep profile fields for signup/profile update.

---

## 4) Create the database tables

Run this in Supabase SQL editor.

```sql
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('Student', 'Professional', 'Other')),
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();
```

### WHY `profiles.id` references `auth.users`
- It guarantees a 1:1 identity mapping between Supabase Auth user and your profile row.
- It simplifies policies: "user can update only their own profile" becomes `id = auth.uid()`.

### Mapping note for current UI
- Current `Message` type uses `text`; DB column is `content`.
- Current `Message` type uses `authorId`; DB column is `user_id`.
- Update mapping in service/store when converting DB rows to UI models.

---

## 5) Configure Row Level Security (RLS)

### WHAT
Enable RLS and add table policies.

### WHERE
- Supabase dashboard table editor or SQL editor.

### WHY
- Without RLS, anon key could read/write too much.
- RLS is required for secure multi-user demos.

### SQL policies
```sql
alter table public.profiles enable row level security;
alter table public.messages enable row level security;

-- profiles
create policy "profiles are readable by everyone"
on public.profiles
for select
using (true);

create policy "users can insert own profile"
on public.profiles
for insert
with check (id = auth.uid());

create policy "users can update own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- messages
create policy "messages are readable by everyone"
on public.messages
for select
using (true);

create policy "authenticated users can insert messages"
on public.messages
for insert
to authenticated
with check (user_id = auth.uid());
```

---

## 6) Implement profile creation

### WHAT
After successful signup, insert or upsert profile row in `profiles`.

### WHERE
- `src/lib/message-wall/store.ts` in `signUp(...)` flow.
- Optional helper in `src/lib/message-wall/service.ts` (recommended: keep DB calls in service).

### WHY
- Auth account alone is not enough for UI display.
- Message cards need `name`, `role`, and `avatar_url` from `profiles`.

### Fields to save
- `id = auth user id`
- `name`
- `role`
- `avatar_url`

### Current project touchpoints
- Signup inputs already exist in `AuthModal.tsx`.
- Store currently sets `currentUserId` from mock profile id; replace with auth user id/profile id.

---

## 7) Implement message creation

### WHAT
Replace mock insert with real Supabase insert:
- `supabase.from('messages').insert(...)`

### WHERE
- `src/lib/message-wall/store.ts` inside `addMessage(...)`
  - Replace current `service.createMessage(...)` mock call path.
- If you keep service abstraction:
  - Implement insert in `src/lib/message-wall/service.ts`

### WHY
- Current messages are in-memory only and reset on refresh.
- Real insert enables persistence + realtime across clients.

### Include on insert
- `user_id`: authenticated user id
- `content`: message body (from current `text` input)
- `color`: selected card color

### UI-model mapping note
- Current UI supports optional title. Your required schema does not include title.
- Decide one approach:
  - Remove title from UI/types, or
  - Keep title in UI only and append it to content for demo.

---

## 8) Implement realtime updates

### WHAT
Subscribe to `messages` INSERT events and append new messages live.

### WHERE
- `src/lib/message-wall/store.ts`
  - There is already a placeholder effect:
    - `TODO(supabase): subscribe to realtime inserts/updates...`

### WHY
- Live updates are the key demo value for a "Message Wall".
- Multiple browsers should see updates instantly.

### Implementation guidance
- Create a channel subscription to `postgres_changes` on `public.messages`.
- On INSERT event:
  1. Receive inserted row.
  2. Fetch/join its profile data (or query a joined view).
  3. Append to store state (`setMessages`).
- Cleanup on unmount (`channel.unsubscribe()` / `removeChannel`).

### Dashboard requirement
- Ensure Realtime replication is enabled for `messages` table.

---

## 9) Implement search

### WHAT
Move from client-only filtering to Supabase query filtering using `ilike`.

### WHERE
- `src/lib/message-wall/store.ts`
  - Current `visibleMessages` does client filtering with `searchQuery`.
- `src/lib/message-wall/service.ts`
  - Add a search/list method that accepts query + role filter.

### WHY
- Client filtering only works on already-loaded mock data.
- Real DB search scales and reflects server data.

### Searchable fields required
- Message content
- Author name
- Author role

### Practical approach for this project
- Create a SQL view for easier searching across join fields:
  - `messages` + `profiles`
- Then query with `ilike` on:
  - `content`
  - `author_name`
  - `author_role`

Example view (run once):
```sql
create or replace view public.messages_with_authors as
select
  m.id,
  m.user_id,
  m.content,
  m.color,
  m.created_at,
  p.name as author_name,
  p.role as author_role,
  p.avatar_url as author_avatar_url
from public.messages m
join public.profiles p on p.id = m.user_id;
```

Then use `ilike` filters in service query (with role filter if selected).

---

## 10) Implement avatar storage

### WHAT
Use Supabase Storage for avatar uploads.

### WHERE
- Supabase dashboard:
  - Storage -> create bucket `avatars`
  - Mark public (demo simplicity)
- `src/components/message-wall/AuthModal.tsx`
  - Replace current FileReader preview-only path in `onFileChange`.
- `src/lib/message-wall/store.ts` / `service.ts`
  - Save resulting public URL into `profiles.avatar_url`.

### WHY
- Current avatar upload is local preview only; not persisted.
- Storage + profile URL gives consistent avatars across devices/sessions.

### Upload flow
1. User selects image file in `AuthModal`.
2. Upload to `avatars/<user-id>/<filename>`.
3. Get public URL.
4. Save URL in `profiles.avatar_url` during signup/profile update.

---

## 11) Testing checklist (live demo runbook)

1. Start app (`npm run dev`) and open `/<locale>/demo` (for example `/en/demo`).
2. Create account (email/password + profile fields).
3. Confirm profile row exists in Supabase `profiles` table.
4. Upload avatar and confirm `avatar_url` is saved + rendered in message cards.
5. Post a message and confirm row appears in `messages` table.
6. Open a second browser/session, sign in as another user, verify realtime insert appears in both sessions.
7. Test search query:
   - by content
   - by author name
   - by author role

---

## Suggested file-by-file change plan (quick map)

- `src/lib/supabase/client.ts`
  - Add Supabase client singleton.

- `src/lib/message-wall/service.ts`
  - Replace mock service implementation with Supabase-backed CRUD/search methods.

- `src/lib/message-wall/store.ts`
  - Replace mock auth/profile/message flow.
  - Load session on init.
  - Add sign-in + sign-out actions.
  - Add realtime subscription lifecycle.
  - Move search to server query path.

- `src/components/message-wall/AuthModal.tsx`
  - Add sign-in/sign-up modes.
  - Integrate avatar upload to Storage.

- `src/components/message-wall/MessageWallLayout.tsx`
  - Wire new auth actions.
  - Add/logout button for demo control.

- `src/lib/message-wall/types.ts`
  - Align naming with DB model mapping (`content`/`user_id`/`created_at`) via conversion layer.

- `src/lib/message-wall/mock.ts`
  - Keep temporarily during migration or remove after Supabase path is stable.

This migration path keeps your existing UI mostly intact while swapping only data/auth/storage/realtime plumbing.
