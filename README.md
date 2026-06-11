# AutoRep Affiliate

AutoRep Affiliate is currently in Phase 2: a Next.js + Supabase mock-demo MVP with auth, roles, dashboard layouts, demo Facebook Pages/Posts, automation CRUD, and comment logs.

## Stack

- Next.js App Router + TypeScript strict mode
- Tailwind CSS + Ant Design
- React Hook Form + Zod
- TanStack Query + Axios
- Supabase Auth + Postgres + RLS
- Vercel-ready frontend/backend structure

## Project structure

```text
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
/app
  /api
```

## Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Local setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a Supabase project.

3. Run the SQL migrations in order:

   - `supabase/migrations/20260611120000_init.sql`
   - `supabase/migrations/20260611143000_phase2_mock_mode.sql`

4. Optional: run `supabase/seed.sql` for demo users.

5. Start the app

   ```bash
   npm run dev
   ```

## Phase 2 features included

- Landing page, login, register
- User dashboard overview
- Facebook Pages page
- Posts page
- Automation CRUD
- Logs page
- Account settings
- Admin overview and users management
- Admin Pages / Automations / Logs visibility
- Supabase profile creation trigger
- Role-based route guards for admin/user areas
- Demo Facebook Page + Demo Posts generation
- Send Test Comment mock flow

## Phase 2 mock demo flow

1. Register and login.
2. Open `/dashboard/pages`.
3. Click `Use Demo Facebook Page`.
4. Confirm a mock page appears.
5. Open `Posts` and review the generated mock posts.
6. Create an automation from a post.
7. Enter keywords, inbox message, public reply message, and save.
8. Use `Send Test Comment` from the Posts or Automations area.
9. Test a matching comment like `cho mình xin giá` and confirm a success log is created.
10. Test a non-matching comment and confirm a skipped log is created.
11. Open `/dashboard/logs` to review matched keyword, statuses, and errors.
12. Login as admin and verify `/admin/pages`, `/admin/automations`, and `/admin/logs` show all users' data.

## Deployment

### Vercel

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add all environment variables in Vercel Project Settings.
4. Deploy.

### Supabase

1. Create project.
2. Run migration.
3. Set Auth redirect URLs to your app domain.
4. Create an admin user and set `raw_app_meta_data.role = admin` if you need admin access.

## Validation commands

```bash
npm run lint
npm run build
```

## Planned for Phase 3+

- Real Facebook OAuth connect flow
- Real Facebook post sync from Graph API
- Real webhook ingestion instead of mock comments
- Production-safe token handling and encrypted secrets
