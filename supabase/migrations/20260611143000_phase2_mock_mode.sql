create table if not exists public.facebook_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  page_id text not null,
  page_name text not null,
  page_avatar_url text,
  page_access_token text,
  status text not null default 'connected',
  is_mock boolean not null default false,
  connected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, page_id)
);

create table if not exists public.facebook_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  facebook_page_id uuid not null references public.facebook_pages(id) on delete cascade,
  post_id text not null,
  message text,
  image_url text,
  permalink_url text,
  created_time timestamptz,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (facebook_page_id, post_id)
);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  facebook_page_id uuid not null references public.facebook_pages(id) on delete cascade,
  facebook_post_id uuid not null references public.facebook_posts(id) on delete cascade,
  name text not null,
  keywords text[] not null,
  inbox_message text not null,
  public_reply_message text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comment_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  automation_id uuid references public.automations(id) on delete set null,
  facebook_page_id uuid references public.facebook_pages(id) on delete set null,
  facebook_post_id uuid references public.facebook_posts(id) on delete set null,
  comment_id text,
  commenter_id text,
  commenter_name text,
  comment_message text,
  matched_keyword text,
  inbox_status text not null default 'skipped',
  public_reply_status text not null default 'skipped',
  error_message text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.facebook_pages enable row level security;
alter table public.facebook_posts enable row level security;
alter table public.automations enable row level security;
alter table public.comment_logs enable row level security;

create policy "pages own or admin all" on public.facebook_pages
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "posts own or admin all" on public.facebook_posts
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "automations own or admin all" on public.automations
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "comment logs own or admin all" on public.comment_logs
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
