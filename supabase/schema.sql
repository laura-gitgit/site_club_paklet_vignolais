create table if not exists public.joueurs (
  id bigserial primary key,
  nom text not null,
  prenom text null,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.rencontre_matches (
  id bigserial primary key,
  joueur1_id bigint not null references public.joueurs(id) on delete cascade,
  joueur2_id bigint not null references public.joueurs(id) on delete cascade,
  score_joueur1 integer null,
  score_joueur2 integer null,
  joue boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.rencontres (
  id bigserial primary key,
  equipe text not null,
  type text not null,
  date date not null,
  lieu text not null,
  adversaire text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.classement_assets (
  id bigserial primary key,
  key text not null unique,
  path text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.evenements (
  id bigserial primary key,
  titre text not null,
  texte text not null,
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id bigserial primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.joueurs enable row level security;
alter table public.rencontre_matches enable row level security;
alter table public.rencontres enable row level security;
alter table public.classement_assets enable row level security;
alter table public.evenements enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public read joueurs" on public.joueurs;
drop policy if exists "Public insert joueurs" on public.joueurs;
drop policy if exists "Public update joueurs" on public.joueurs;
drop policy if exists "Public delete joueurs" on public.joueurs;

create policy "Public read joueurs" on public.joueurs
  for select to public using (true);

create policy "Public insert joueurs" on public.joueurs
  for insert to public with check (true);

create policy "Public update joueurs" on public.joueurs
  for update to public using (true) with check (true);

create policy "Public delete joueurs" on public.joueurs
  for delete to public using (true);

drop policy if exists "Public read rencontres" on public.rencontre_matches;
drop policy if exists "Public insert rencontres" on public.rencontre_matches;
drop policy if exists "Public update rencontres" on public.rencontre_matches;
drop policy if exists "Public delete rencontres" on public.rencontre_matches;

create policy "Public read rencontres" on public.rencontre_matches
  for select to public using (true);

create policy "Public insert rencontres" on public.rencontre_matches
  for insert to public with check (true);

create policy "Public update rencontres" on public.rencontre_matches
  for update to public using (true) with check (true);

create policy "Public delete rencontres" on public.rencontre_matches
  for delete to public using (true);

drop policy if exists "Public read rencontres clubs" on public.rencontres;
drop policy if exists "Public insert rencontres clubs" on public.rencontres;
drop policy if exists "Public update rencontres clubs" on public.rencontres;
drop policy if exists "Public delete rencontres clubs" on public.rencontres;

create policy "Public read rencontres clubs" on public.rencontres
  for select to public using (true);

create policy "Public insert rencontres clubs" on public.rencontres
  for insert to public with check (true);

create policy "Public update rencontres clubs" on public.rencontres
  for update to public using (true) with check (true);

create policy "Public delete rencontres clubs" on public.rencontres
  for delete to public using (true);

drop policy if exists "Public read classement assets" on public.classement_assets;
drop policy if exists "Public insert classement assets" on public.classement_assets;
drop policy if exists "Public update classement assets" on public.classement_assets;
drop policy if exists "Public delete classement assets" on public.classement_assets;

create policy "Public read classement assets" on public.classement_assets
  for select to public using (true);

create policy "Public insert classement assets" on public.classement_assets
  for insert to public with check (true);

create policy "Public update classement assets" on public.classement_assets
  for update to public using (true) with check (true);

create policy "Public delete classement assets" on public.classement_assets
  for delete to public using (true);

drop policy if exists "Public read evenements" on public.evenements;
drop policy if exists "Public insert evenements" on public.evenements;
drop policy if exists "Public update evenements" on public.evenements;
drop policy if exists "Public delete evenements" on public.evenements;

create policy "Public read evenements" on public.evenements
  for select to public using (true);

create policy "Public insert evenements" on public.evenements
  for insert to public with check (true);

create policy "Public update evenements" on public.evenements
  for update to public using (true) with check (true);

create policy "Public delete evenements" on public.evenements
  for delete to public using (true);

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

insert into public.admin_users (email)
values ('laura.boudard@gmail.com')
on conflict (email) do nothing;

insert into storage.buckets (id, name, public)
values ('club-images', 'club-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read club images" on storage.objects;
drop policy if exists "Public insert club images" on storage.objects;
drop policy if exists "Public update club images" on storage.objects;
drop policy if exists "Public delete club images" on storage.objects;

create policy "Public read club images" on storage.objects
  for select to public using (bucket_id = 'club-images');

create policy "Public insert club images" on storage.objects
  for insert to public with check (bucket_id = 'club-images');

create policy "Public update club images" on storage.objects
  for update to public using (bucket_id = 'club-images') with check (bucket_id = 'club-images');

create policy "Public delete club images" on storage.objects
  for delete to public using (bucket_id = 'club-images');
