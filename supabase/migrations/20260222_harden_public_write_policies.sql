drop policy if exists "Public insert joueurs" on public.joueurs;
drop policy if exists "Public update joueurs" on public.joueurs;
drop policy if exists "Public delete joueurs" on public.joueurs;
drop policy if exists "Admin insert joueurs" on public.joueurs;
drop policy if exists "Admin update joueurs" on public.joueurs;
drop policy if exists "Admin delete joueurs" on public.joueurs;

create policy "Admin insert joueurs" on public.joueurs
  for insert to authenticated with check (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

create policy "Admin update joueurs" on public.joueurs
  for update to authenticated
  using (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

create policy "Admin delete joueurs" on public.joueurs
  for delete to authenticated using (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

drop policy if exists "Public insert rencontres" on public.rencontre_matches;
drop policy if exists "Public update rencontres" on public.rencontre_matches;
drop policy if exists "Public delete rencontres" on public.rencontre_matches;
drop policy if exists "Admin insert rencontres" on public.rencontre_matches;
drop policy if exists "Admin update rencontres" on public.rencontre_matches;
drop policy if exists "Admin delete rencontres" on public.rencontre_matches;

create policy "Admin insert rencontres" on public.rencontre_matches
  for insert to authenticated with check (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

create policy "Admin update rencontres" on public.rencontre_matches
  for update to authenticated
  using (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

create policy "Admin delete rencontres" on public.rencontre_matches
  for delete to authenticated using (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

drop policy if exists "Public insert rencontres clubs" on public.rencontres;
drop policy if exists "Public update rencontres clubs" on public.rencontres;
drop policy if exists "Public delete rencontres clubs" on public.rencontres;
drop policy if exists "Admin insert rencontres clubs" on public.rencontres;
drop policy if exists "Admin update rencontres clubs" on public.rencontres;
drop policy if exists "Admin delete rencontres clubs" on public.rencontres;

create policy "Admin insert rencontres clubs" on public.rencontres
  for insert to authenticated with check (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

create policy "Admin update rencontres clubs" on public.rencontres
  for update to authenticated
  using (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

create policy "Admin delete rencontres clubs" on public.rencontres
  for delete to authenticated using (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

drop policy if exists "Public insert classement assets" on public.classement_assets;
drop policy if exists "Public update classement assets" on public.classement_assets;
drop policy if exists "Public delete classement assets" on public.classement_assets;
drop policy if exists "Admin insert classement assets" on public.classement_assets;
drop policy if exists "Admin update classement assets" on public.classement_assets;
drop policy if exists "Admin delete classement assets" on public.classement_assets;

create policy "Admin insert classement assets" on public.classement_assets
  for insert to authenticated with check (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

create policy "Admin update classement assets" on public.classement_assets
  for update to authenticated
  using (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

create policy "Admin delete classement assets" on public.classement_assets
  for delete to authenticated using (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

drop policy if exists "Public insert evenements" on public.evenements;
drop policy if exists "Public update evenements" on public.evenements;
drop policy if exists "Public delete evenements" on public.evenements;
drop policy if exists "Admin insert evenements" on public.evenements;
drop policy if exists "Admin update evenements" on public.evenements;
drop policy if exists "Admin delete evenements" on public.evenements;

create policy "Admin insert evenements" on public.evenements
  for insert to authenticated with check (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

create policy "Admin update evenements" on public.evenements
  for update to authenticated
  using (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );

create policy "Admin delete evenements" on public.evenements
  for delete to authenticated using (
    exists (
      select 1 from public.admin_users admin
      where admin.email = auth.email()
    )
  );
