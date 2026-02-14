# Smart bookmark handling with Next.js and Supabase

# This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Smart Bookmarks

Next.js App Router app using Supabase Auth (Google OAuth), Postgres, and Realtime.

## Features

- Google OAuth login/signup.
- Authenticated users can add and delete bookmarks.
- Bookmarks are private per user via RLS.
- Realtime sync across open tabs.

## Tech

- Next.js (App Router)
- Tailwind CSS
- Supabase Auth + Database + Realtime

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

3. Fill env vars in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. In Supabase SQL editor, run `supabase/schema.sql`.

5. Configure Google OAuth in Supabase:

- Supabase dashboard -> Authentication -> Providers -> Google -> Enable.
- Add Google client ID/secret in Supabase provider settings.
- Add authorized redirect URL in Google Cloud:
  `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`

6. In Supabase Authentication URL settings:

- Site URL: `http://localhost:3000`
- Redirect URL allow list:
  `http://localhost:3000/auth/callback`

7. Start app:

```bash
npm run dev
```

## Deploy on Vercel

1. Push this project to GitHub.
2. Import repo in Vercel.
3. Set env vars in Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. In Supabase Authentication URL settings, update:

- Site URL: `https://<your-vercel-domain>`
- Add redirect URL:
  `https://<your-vercel-domain>/auth/callback`

5. Redeploy.

<<<<<<< HEAD
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

> > > > > > > # 6f1cf5f (Initial commit from Create Next App)

## Folder Structure

- `src/app/page.tsx`: Server-side session read + initial bookmarks.
- `src/components/bookmark-app.tsx`: Client UI, add/delete, auth actions, realtime subscription.
- `src/app/auth/callback/route.ts`: Exchanges OAuth code for session.
- `src/lib/supabase/*`: Browser/server/middleware Supabase clients.
- `src/lib/types.ts`: App types.
- `supabase/schema.sql`: Table, RLS policies, realtime publication.
  > > > > > > > 71e864d (Build smart bookmarks app with Next.js, Supabase for auth-db-realtime)
