create index if not exists idx_facebook_pages_user_id on public.facebook_pages (user_id);
create unique index if not exists idx_facebook_pages_user_page_id on public.facebook_pages (user_id, page_id);

create index if not exists idx_facebook_posts_page_id on public.facebook_posts (facebook_page_id);
create unique index if not exists idx_facebook_posts_page_post on public.facebook_posts (facebook_page_id, post_id);

create index if not exists idx_automations_user_id on public.automations (user_id);
create index if not exists idx_automations_page_id on public.automations (facebook_page_id);
create index if not exists idx_automations_post_id on public.automations (facebook_post_id);
create index if not exists idx_automations_user_page_post_active on public.automations (user_id, facebook_page_id, facebook_post_id, is_active);

create index if not exists idx_comment_logs_user_created_at on public.comment_logs (user_id, created_at desc);
create index if not exists idx_comment_logs_automation_id on public.comment_logs (automation_id);
create index if not exists idx_comment_logs_comment_id on public.comment_logs (comment_id);
create index if not exists idx_comment_logs_automation_comment on public.comment_logs (automation_id, comment_id);

create index if not exists idx_system_logs_created_at on public.system_logs (created_at desc);
create index if not exists idx_system_logs_source on public.system_logs (source);
