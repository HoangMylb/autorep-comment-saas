insert into public.profiles (id, email, full_name, role, status)
values
  ('11111111-1111-1111-1111-111111111111', 'admin@autorep.test', 'Admin Demo', 'admin', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'user@autorep.test', 'User Demo', 'user', 'active')
on conflict (id) do nothing;
