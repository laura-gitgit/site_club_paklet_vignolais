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

alter table public.joueurs enable row level security;
alter table public.rencontre_matches enable row level security;

create policy "Public read joueurs" on public.joueurs
  for select to public using (true);

create policy "Public insert joueurs" on public.joueurs
  for insert to public with check (true);

create policy "Public update joueurs" on public.joueurs
  for update to public using (true) with check (true);

create policy "Public delete joueurs" on public.joueurs
  for delete to public using (true);

create policy "Public read rencontres" on public.rencontre_matches
  for select to public using (true);

create policy "Public insert rencontres" on public.rencontre_matches
  for insert to public with check (true);

create policy "Public update rencontres" on public.rencontre_matches
  for update to public using (true) with check (true);

create policy "Public delete rencontres" on public.rencontre_matches
  for delete to public using (true);
