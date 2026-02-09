import Link from "next/link";

export default function GestionPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Gestion</h1>
        <p className="mt-2 text-lg text-slate-600">
          Acces reserve aux administrateurs (bientot).
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
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
          <p className="mt-2 text-slate-600">Rencontres D3/D4 et photos des classements.</p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/gestion/classement">
            Ouvrir la gestion
          </Link>
        </div>
      </section>
    </div>
  );
}
