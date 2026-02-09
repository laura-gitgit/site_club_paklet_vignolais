import Link from "next/link";

export default function Home() {
  return (
    <div className="grid gap-10">
      <section className="card grid gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-900">
          Club de palet
        </p>
        <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
          Bienvenue au Club de Palet Vignolais
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Retrouvez les infos du club, les joueurs actifs, le tirage au sort
          et le tournoi interne 1vs1.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link className="button-primary" href="/tirage-au-sort">
            Tirage au sort
          </Link>
          <Link className="button-muted" href="/tournoi">
            Tournoi interne
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="card">
          <h2 className="text-2xl font-semibold text-blue-900">Classement</h2>
          <p className="mt-3 text-slate-600">
            Consultez le classement general des joueurs et leurs points.
          </p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/classement">
            Voir le classement
          </Link>
        </div>
        <div className="card">
          <h2 className="text-2xl font-semibold text-blue-900">Joueurs</h2>
          <p className="mt-3 text-slate-600">
            Ajoutez, activez ou retirez des joueurs du club.
          </p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/joueurs">
            Gérer les joueurs
          </Link>
        </div>
        <div className="card">
          <h2 className="text-2xl font-semibold text-blue-900">Tournoi 1vs1</h2>
          <p className="mt-3 text-slate-600">
            Generez un prochain match et enregistrez les scores.
          </p>
          <Link className="mt-6 inline-flex text-sm font-semibold text-blue-900" href="/tournoi">
            Acceder au tournoi
          </Link>
        </div>
      </section>
    </div>
  );
}
