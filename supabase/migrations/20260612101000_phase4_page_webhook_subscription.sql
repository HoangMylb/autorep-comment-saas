alter table public.facebook_pages
  add column if not exists webhook_subscribed boolean not null default false,
  add column if not exists webhook_subscribed_at timestamptz;
