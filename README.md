# AutoRep Affiliate - Phase 4

AutoRep Affiliate is a Next.js fullstack app deployed on **Vercel + Supabase** with two parallel operating modes:

- **Mock Mode** for safe product demo and local validation
- **Facebook Real Mode** for MVP Facebook Page connection, post sync, webhook ingestion, and automation matching

The app remains fully inside Next.js:

- UI routes in `/app`
- API routes in `/app/api`
- Supabase for Auth + Database
- `apiClient` using `baseURL = "/api"`
- no Render backend
- no `NEXT_PUBLIC_API_URL`

## Stack

- Next.js App Router + TypeScript
- Supabase Auth + Postgres + RLS
- Ant Design + Tailwind CSS
- React Hook Form + Zod
- TanStack Query + Axios

## Project structure

```text
/app
  /api
  /dashboard
  /admin
  /login
  /register
  layout.tsx
  page.tsx

/frontend
  /components
  /features
  /hooks
  /layouts
  /lib
  /styles
  /types

/backend
  /lib
  /middlewares
  /repositories
  /services
  /types
  /validators

/supabase
  /migrations

/middleware.ts
```

## Environment variables

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_VERIFY_TOKEN=
FACEBOOK_GRAPH_API_VERSION=v20.0

ENABLE_FACEBOOK_REAL_MODE=false
ENABLE_FACEBOOK_SEND_MESSAGE=false
ENABLE_FACEBOOK_PUBLIC_REPLY=false
```

Rules:

- `SUPABASE_SERVICE_ROLE_KEY` is server-only
- `FACEBOOK_APP_SECRET` is server-only
- page access tokens are server-only
- do **not** add `NEXT_PUBLIC_API_URL`

## Local setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a Supabase project.

3. Run migrations in order:

   - `supabase/migrations/20260611120000_init.sql`
   - `supabase/migrations/20260611143000_phase2_mock_mode.sql`
   - `supabase/migrations/20260611190000_phase4_facebook_real_mode.sql`

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open:

   ```text
   http://localhost:3000
   ```

## Supabase setup

### Client separation

This project uses three Supabase access patterns:

1. **Browser client**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - only for browser auth/session work

2. **Server SSR client**
   - cookie-aware auth/session reads in routes and server pages
   - user-scoped requests only

3. **Admin/service client**
   - `SUPABASE_SERVICE_ROLE_KEY`
   - server-only
   - never imported into client components

### Auth settings

In Supabase Dashboard:

1. Go to **Authentication → URL Configuration**
2. Set **Site URL**:
   - local: `http://localhost:3000`
   - production: `https://your-vercel-domain.vercel.app`
3. Add **Redirect URLs**:
   - `http://localhost:3000/**`
   - `https://your-vercel-domain.vercel.app/**`

## Auth flow

### Register

- page: `/register`
- API: `POST /api/auth/register`
- creates Supabase Auth user
- profile row is created through database trigger
- default role is `user`
- success redirects to `/login`

### Login

- page: `/login`
- API: `POST /api/auth/login`
- success redirects to `/dashboard`
- middleware redirects logged-in users away from `/login` and `/register`

### Logout

- API: `POST /api/auth/logout`
- dashboard/admin logout button uses the API route
- success redirects to `/login`

## Protected routes and roles

Protected paths:

- `/dashboard/*`
- `/admin/*`

Current behavior:

1. Guest visiting `/dashboard/*` → redirected to `/login`
2. Guest visiting `/admin/*` → redirected to `/login`
3. Logged-in `user` visiting `/admin/*` → redirected to `/dashboard`
4. Logged-in `admin` visiting `/admin/*` → allowed
5. Logged-in user visiting `/login` or `/register` → redirected to role-appropriate home
6. Blocked user is denied app access

## API response format

All app APIs use this shape:

### Success

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error message"
}
```

## Main API routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`

### Mock Facebook

- `POST /api/mock/facebook/setup-demo`
- `POST /api/mock/facebook/send-test-comment`

### Facebook page/post sync

- `GET /api/facebook/pages`
- `GET /api/facebook/posts?pageId=`
- `GET /api/facebook/connect`
- `GET /api/facebook/callback`
- `GET /api/facebook/pages/[id]/status`
- `POST /api/facebook/pages/[id]/sync-posts`
- `POST /api/facebook/pages/[id]/disconnect`

### Facebook webhook

- `GET /api/facebook/webhook`
- `POST /api/facebook/webhook`

### Automations

- `GET /api/automations`
- `POST /api/automations`
- `GET /api/automations/[id]`
- `PUT /api/automations/[id]`
- `DELETE /api/automations/[id]`
- `PATCH /api/automations/[id]/toggle`

### Logs

- `GET /api/logs`

### Admin

- `GET /api/admin/users`
- `GET /api/admin/pages`
- `GET /api/admin/automations`
- `GET /api/admin/logs`
- `GET /api/admin/overview`

## Mock Mode flow

Use this exact flow to validate Mock Mode:

1. Register a new user
2. Login
3. Open `/dashboard`
4. Click **Use Demo Facebook Page**
5. Confirm a demo page and demo posts are created
6. Open `/dashboard/pages`
7. Open `/dashboard/posts`
8. Create automation with:
   - keywords: `xin giá`, `xin gia`, `giá`, `gia`
   - inbox message: `Mình gửi bạn thông tin giá tại đây...`
   - public reply: `Mình đã gửi thông tin vào inbox cho bạn nhé`
9. Send test comment:
   - commenter name: `Nguyễn Văn A`
   - message: `cho mình xin giá`
10. Confirm log success
11. Send test comment again with:
   - message: `hello shop`
12. Confirm log skipped
13. Disable automation
14. Send `xin giá` again
15. Confirm skipped / no active automation behavior
16. Login as admin and verify `/admin` screens show full data

## Facebook Real Mode overview

Real mode is designed defensively:

- Mock Mode remains fully available
- missing permissions must not crash the app
- expired tokens should mark page status as `expired`
- unsupported webhook payloads should be logged, not crash
- message sending and public reply are feature-flagged

### Feature flags

#### `ENABLE_FACEBOOK_REAL_MODE=false`

- Facebook connect button should remain disabled
- Mock Mode still works

#### `ENABLE_FACEBOOK_SEND_MESSAGE=false`

- webhook still receives comment
- keyword still matches
- log still created
- `inbox_status = skipped`
- `error_message` includes: `Facebook send message disabled by feature flag`

#### `ENABLE_FACEBOOK_PUBLIC_REPLY=false`

- no public reply API call
- `public_reply_status = skipped`

## Meta App setup (Phase 4)

### 1. Create Meta Developer App

Create a Meta app in the Meta Developer Dashboard.

### 2. Add products as needed

- Facebook Login
- Messenger / Page-related products when needed

### 3. Configure OAuth callback URI

Use:

```text
https://your-domain.vercel.app/api/facebook/callback
```

### 4. Configure webhook callback URL

Use:

```text
https://your-domain.vercel.app/api/facebook/webhook
```

### 5. Configure verify token

Use the same value as:

```env
FACEBOOK_VERIFY_TOKEN=
```

### 6. Required permissions to prepare

- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_metadata`
- `pages_messaging`
- `pages_manage_engagement`

### 7. Important App Review note

Some permissions may require Meta App Review before they work for real end users.

In development mode, only app admins, developers, and testers may be able to use the Facebook flow reliably.

If permissions are not yet approved, keep using Mock Mode for product demos.

## Facebook OAuth flow

1. User clicks **Connect Facebook Page**
2. App redirects to `/api/facebook/connect`
3. App generates state and redirects to Meta OAuth
4. Meta redirects back to `/api/facebook/callback`
5. App exchanges code for user token
6. App fetches Pages from `/me/accounts`
7. Pages are stored in `facebook_pages`
8. User is redirected to `/dashboard/pages?connected=facebook`

If permission is denied or callback fails:

- user is redirected back to dashboard pages
- error is logged to `system_logs`

## Facebook Page sync flow

1. User opens `/dashboard/pages`
2. User clicks **Sync Posts** on a real page
3. App calls:

```text
POST /api/facebook/pages/[id]/sync-posts
```

4. App fetches real posts from Graph API
5. App upserts posts into `facebook_posts`
6. App updates `last_synced_at`
7. App stores any sync error into `error_message`

## Facebook webhook flow

### Verify

`GET /api/facebook/webhook`

- validates `hub.mode`
- validates `hub.verify_token`
- returns `hub.challenge` as plain text
- logs success/failure

### Receive

`POST /api/facebook/webhook`

Current behavior:

1. Receives payload
2. Extracts comment-style events when possible
3. Finds the Facebook page by external `page_id`
4. Finds or creates placeholder post by external `post_id`
5. Finds active automations for that post
6. Matches keyword
7. Writes `comment_logs` with `source = facebook`
8. Ignores duplicate successful comment events
9. Writes `system_logs` for unsupported payloads or failures

## Messaging / public reply behavior

The service layer already returns normalized result objects:

```json
{
  "success": true,
  "status": "skipped",
  "errorMessage": "Facebook send message disabled by feature flag"
}
```

Current MVP behavior is defensive:

- if messaging is disabled → skipped
- if public reply is disabled → skipped
- if token is missing → failed
- if permission/review is missing → failed with a clear error

This means the webhook path can continue logging and matching even before Meta permissions are fully approved.

## Admin setup guide

There is no admin creation UI.

### Option 1 - Table Editor

1. Register a normal user
2. Open Supabase Table Editor
3. Go to `profiles`
4. Update `role = 'admin'` for that user

### Option 2 - SQL

```sql
update profiles
set role = 'admin'
where email = 'your-email@example.com';
```

## Seed note

`supabase/seed.sql` does **not** create records in `auth.users`.

If you need real login users, create them through Supabase Auth or through the app register flow first.

## Vercel deployment guide

### 1. Create Supabase project

- create project
- copy project URL
- copy anon key
- copy service role key

### 2. Run migrations

Run in Supabase SQL Editor:

- `supabase/migrations/20260611120000_init.sql`
- `supabase/migrations/20260611143000_phase2_mock_mode.sql`
- `supabase/migrations/20260611190000_phase4_facebook_real_mode.sql`

### 3. Configure Supabase auth URLs

- Site URL:
  - `http://localhost:3000`
  - `https://your-vercel-domain.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/**`
  - `https://your-vercel-domain.vercel.app/**`

### 4. Configure Vercel environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_VERIFY_TOKEN=
FACEBOOK_GRAPH_API_VERSION=v20.0

ENABLE_FACEBOOK_REAL_MODE=false
ENABLE_FACEBOOK_SEND_MESSAGE=false
ENABLE_FACEBOOK_PUBLIC_REPLY=false
```

### 5. Deploy

Push to GitHub and deploy on Vercel.

## Phase 4 testing checklist

### Mock Mode

- use demo page
- create automation
- send test comment
- verify success/skipped logs

### Facebook OAuth

- click **Connect Facebook Page**
- verify Facebook permission screen opens
- verify callback returns to app
- verify page list is saved

### Sync posts

- choose a real page
- click **Sync Posts**
- verify posts appear in `/dashboard/posts`

### Webhook verify

- configure webhook URL in Meta dashboard
- verify token handshake succeeds

### Webhook receive

- POST a simulated Facebook payload to `/api/facebook/webhook`
- verify `system_logs`
- verify `comment_logs`

### Feature flags

- set `ENABLE_FACEBOOK_SEND_MESSAGE=false`
- send matching event
- verify processing continues but message send is skipped

## Security checklist

- `SUPABASE_SERVICE_ROLE_KEY` is server-only
- `FACEBOOK_APP_SECRET` is server-only
- page access tokens are server-only
- user routes check auth
- admin routes check admin role
- blocked users are denied access
- duplicate comment events are ignored
- passwords are not logged
- tokens should be masked in operational logs
- `.env.local` should never be committed
- `.env.example` contains placeholders only

## Validation commands

```bash
npm run typecheck
npm run lint
npm run build
```

## Out of scope

- payment/subscription
- token marketplace
- Render backend
- AI chatbot
- broadcast
- advanced CRM
