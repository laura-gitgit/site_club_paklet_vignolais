import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActivePlayers } from "@/lib/clubData";
import { supabase } from "@/lib/supabaseClient";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

async function ajouterMatchManuel(formData: FormData) {
  "use server";
  const joueur1Id = Number(formData.get("joueur1_id"));
  const joueur2Id = Number(formData.get("joueur2_id"));
  const scoreJ1 = Number(formData.get("score_joueur1"));
  const scoreJ2 = Number(formData.get("score_joueur2"));

  if (
    Number.isNaN(joueur1Id) ||
    Number.isNaN(joueur2Id) ||
    Number.isNaN(scoreJ1) ||
    Number.isNaN(scoreJ2) ||
    joueur1Id === joueur2Id
  ) {
    redirect("/gestion?error=match");
  }

  const { error } = await supabase.from("rencontre_matches").insert({
    joueur1_id: joueur1Id,
    joueur2_id: joueur2Id,
    score_joueur1: scoreJ1,
    score_joueur2: scoreJ2,
    joue: true,
  });

  if (error) {
    redirect("/gestion?error=match");
  }

  revalidatePath("/tournoi");
  revalidatePath("/classement");
  revalidatePath("/gestion");
  redirect("/gestion?success=match");
}

export default async function GestionPage({ searchParams }: PageProps) {
  const players = await getActivePlayers();
  const success = searchParams?.success;
  const error = searchParams?.error;

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Gestion</h1>
        <p className="mt-2 text-lg text-slate-600">
          Acces reserve aux administrateurs (bientot).
        </p>
      </header>

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Action terminee avec succes.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Une erreur est survenue.
        </div>
      )}

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

      <section className="card">
        <h2 className="text-2xl font-semibold text-blue-900">Ajouter un match manuel</h2>
        {players.length < 2 ? (
          <p className="mt-2 text-slate-600">Il faut au moins 2 joueurs actifs.</p>
        ) : (
          <form action={ajouterMatchManuel} className="mt-4 grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700" htmlFor="joueur1_id">
                Joueur 1
              </label>
              <select
                id="joueur1_id"
                name="joueur1_id"
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.prenom ?? player.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700" htmlFor="joueur2_id">
                Joueur 2
              </label>
              <select
                id="joueur2_id"
                name="joueur2_id"
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.prenom ?? player.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700" htmlFor="score_joueur1">
                Score joueur 1
              </label>
              <input
                id="score_joueur1"
                name="score_joueur1"
                type="number"
                min={0}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700" htmlFor="score_joueur2">
                Score joueur 2
              </label>
              <input
                id="score_joueur2"
                name="score_joueur2"
                type="number"
                min={0}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <button className="button-primary md:col-span-4" type="submit">
              Ajouter le match
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
