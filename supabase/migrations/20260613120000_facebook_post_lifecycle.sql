alter table public.facebook_posts
  add column if not exists is_stale boolean not null default false,
  add column if not exists last_seen_at timestamptz,
  add column if not exists facebook_created_time timestamptz;
