# How Supabase Accelerates Modern Development

The site and live-demo code from my talk for the **Mauritanian Programming Community** (MPC) in Nouakchott, March 2026. The talk was given in Arabic; the slides are available in English, French and Arabic.

It is shared so anyone who attended, or missed it, can open the slides again, run the demo themselves and read how it was built.

## What's inside

| Route | What it is |
| --- | --- |
| `/presentation` | The talk itself: what Supabase and BaaS are, what Supabase offers, developer experience, a real migration story (Portal.mr), who uses it, the live demo plan, and honest limits and lessons. |
| `/demo` | **Message Wall**, the app built live on stage: sign-up and sign-in with Supabase Auth, profile images in Storage, messages inserted and read from Postgres, row-level security that only lets you delete your own messages, and search. |
| `/challenge` | **Claim a code**: attendees drag blocks to assemble a valid Supabase request (`supabase_client` → `rpc` → parameters) and run it. The first valid claims won a prize. |

Every page is available in English, French and Arabic (`/en`, `/fr`, `/ar`).

## Run it

Requires Node 20+ and a Supabase project (the free tier is enough).

```bash
npm install
```

Create `.env.local` at the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your publishable key>
```

Set up the database in the Supabase SQL Editor:

1. Follow [`SUPABASE_DEMO_GUIDE.md`](SUPABASE_DEMO_GUIDE.md) to create the `message` table and connect the Message Wall. It explains what to change, where, and why, step by step.
2. Run `supabase/message_wall_auth_storage_setup.sql` for the row-level security policies and the profile-image bucket.
3. For the challenge, run `supabase/challenge_full_setup.sql`: the code pool, the settings table and the claim function. (`supabase/challenge_claim_code.sql` is the earlier, smaller version of the same schema, kept for reference.)

Then:

```bash
npm run dev      # http://localhost:3000
```

The presentation works without a database; only the demo and the challenge need Supabase.

## Built with

Next.js (App Router), TypeScript, Tailwind CSS, next-intl, and Supabase (Auth, Postgres with row-level security, Storage, RPC).

## About me

I'm Fetouh Sadegh, a full-stack developer and lecturer in Nouakchott, and a member of the Supabase SupaSquad. I share the code of every talk I give.

[LinkedIn](https://www.linkedin.com/in/fetouh-sadegh-35950b1a5/)
