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
          <p className="mt-2 text-slate-600">Lancer des matchs et saisir les scores.</p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/tournoi">
            Aller au tournoi
          </Link>
        </div>
        <div className="card">
          <h2 className="text-2xl font-semibold text-blue-900">Gerer classement</h2>
          <p className="mt-2 text-slate-600">Consulter et verifier le classement.</p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/classement">
            Voir le classement
          </Link>
        </div>
      </section>
    </div>
  );
}
