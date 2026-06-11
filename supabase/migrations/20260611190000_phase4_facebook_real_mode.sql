alter table public.facebook_pages
  add column if not exists user_access_token text,
  add column if not exists token_expires_at timestamptz,
  add column if not exists permissions text[] default '{}',
  add column if not exists connection_type text not null default 'mock',
  add column if not exists last_synced_at timestamptz,
  add column if not exists error_message text;

alter table public.facebook_posts
  add column if not exists connection_type text not null default 'mock',
  add column if not exists raw_payload jsonb;

alter table public.comment_logs
  add column if not exists source text not null default 'mock',
  add column if not exists event_type text,
  add column if not exists processing_status text not null default 'processed';

create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  source text not null,
  message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.system_logs enable row level security;

create policy "system logs admin read" on public.system_logs
for select using (public.is_admin());

create policy "system logs admin insert" on public.system_logs
for insert with check (public.is_admin());
