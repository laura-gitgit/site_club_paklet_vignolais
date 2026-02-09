import Link from "next/link";
import LogoutButton from "@/app/gestion/LogoutButton";

export default function GestionPage() {
  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-blue-900">Gestion</h1>
          <p className="mt-2 text-lg text-slate-600">
            Acces reserve aux administrateurs (bientot).
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <h2 className="text-2xl font-semibold text-blue-900">Gerer joueurs</h2>
          <p className="mt-2 text-slate-600">Ajouter, activer ou supprimer des joueurs.</p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/joueurs">
            Aller a la gestion
          </Link>
        </div>
        <div className="card">
          <h2 className="text-2xl font-semibold text-blue-900">Gerer tournoi</h2>
          <p className="mt-2 text-slate-600">Generer les matchs du tournoi interne.</p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/gestion/tournoi">
            Ouvrir la gestion
          </Link>
        </div>
        <div className="card">
          <h2 className="text-2xl font-semibold text-blue-900">Gerer classement</h2>
          <p className="mt-2 text-slate-600">Rencontres Equipe 1/2 et photos des classements.</p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/gestion/classement">
            Ouvrir la gestion
          </Link>
        </div>
        <div className="card">
          <h2 className="text-2xl font-semibold text-blue-900">Gerer entrainements</h2>
          <p className="mt-2 text-slate-600">Ajouter des photos d exercices et ateliers.</p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/gestion/entrainements">
            Ouvrir la gestion
          </Link>
        </div>
        <div className="card">
          <h2 className="text-2xl font-semibold text-blue-900">Gerer evenements</h2>
          <p className="mt-2 text-slate-600">Ajouter des textes et photos pour les evenements.</p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/gestion/evenements">
            Ouvrir la gestion
          </Link>
        </div>
      </section>
    </div>
  );
}
