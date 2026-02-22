alter table public.admin_users enable row level security;

drop policy if exists "Admin read own record" on public.admin_users;
drop policy if exists "Admin insert" on public.admin_users;
drop policy if exists "Admin update" on public.admin_users;
drop policy if exists "Admin delete" on public.admin_users;

create policy "Admin read own record" on public.admin_users
  for select to authenticated using (auth.email() = email);

create policy "Admin insert" on public.admin_users
  for insert to authenticated with check (auth.email() = email);

create policy "Admin update" on public.admin_users
  for update to authenticated using (auth.email() = email) with check (auth.email() = email);

create policy "Admin delete" on public.admin_users
  for delete to authenticated using (auth.email() = email);
