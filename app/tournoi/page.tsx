import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildClassement, getActivePlayers, getMatches } from "@/lib/clubData";
import { supabase } from "@/lib/supabaseClient";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

async function enregistrerScore(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const scoreJ1 = Number(formData.get("score_joueur1"));
  const scoreJ2 = Number(formData.get("score_joueur2"));

  if (Number.isNaN(id) || Number.isNaN(scoreJ1) || Number.isNaN(scoreJ2)) {
    redirect("/tournoi?error=score");
  }

  const { error } = await supabase
    .from("rencontre_matches")
    .update({
      score_joueur1: scoreJ1,
      score_joueur2: scoreJ2,
      joue: true,
    })
    .eq("id", id);

  if (error) {
    redirect("/tournoi?error=score");
  }

  revalidatePath("/tournoi");
  redirect("/tournoi?success=score");
}

export default async function TournoiPage({ searchParams }: PageProps) {
  const [players, matches] = await Promise.all([
    getActivePlayers(),
    getMatches(),
  ]);
  const classement = buildClassement(players, matches);
  const matchesEnAttente = matches.filter((match) => !match.joue);
  const playersById = new Map(players.map((player) => [player.id, player]));

  const success = searchParams?.success;
  const error = searchParams?.error;

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Tournoi interne 1vs1</h1>
        <p className="mt-2 text-lg text-slate-600">
          Gère les matchs et consulte le classement.
        </p>
      </header>

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Action terminée avec succès.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Une erreur est survenue.
        </div>
      )}
      <section className="card">
        <h2 className="text-2xl font-semibold text-blue-900">Matchs du tour</h2>
        {matchesEnAttente.length > 0 ? (
          <div className="mt-4 grid gap-4">
            {matchesEnAttente.map((match) => {
              const joueur1 = playersById.get(match.joueur1_id);
              const joueur2 = playersById.get(match.joueur2_id);
              if (!joueur1 || !joueur2) {
                return null;
              }
              const scoreJ1Id = `score_joueur1_${match.id}`;
              const scoreJ2Id = `score_joueur2_${match.id}`;

              return (
                <div key={match.id} className="rounded-xl border border-blue-100 bg-white p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Match</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {joueur1.prenom ?? joueur1.nom} vs {joueur2.prenom ?? joueur2.nom}
                      </p>
                    </div>
                    <form action={enregistrerScore} className="grid gap-3 md:grid-cols-5 md:items-end">
                      <input type="hidden" name="id" value={match.id} />
                      <div>
                        <label className="block text-xs font-semibold text-slate-600" htmlFor={scoreJ1Id}>
                          Score {joueur1.prenom ?? joueur1.nom}
                        </label>
                        <input
                          id={scoreJ1Id}
                          name="score_joueur1"
                          type="number"
                          min={0}
                          required
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-center"
                        />
                      </div>
                      <div className="hidden text-center text-lg font-semibold text-slate-500 md:block">-</div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600" htmlFor={scoreJ2Id}>
                          Score {joueur2.prenom ?? joueur2.nom}
                        </label>
                        <input
                          id={scoreJ2Id}
                          name="score_joueur2"
                          type="number"
                          min={0}
                          required
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-center"
                        />
                      </div>
                      <button className="button-primary md:col-span-5" type="submit">
                        Enregistrer le score
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-slate-100 p-6 text-center">
            <p className="text-slate-600">Aucun match en attente</p>
            <p className="mt-2 text-sm text-slate-500">
              La génération des matchs se fait dans la page Gestion tournoi.
            </p>
          </div>
        )}
      </section>

      <section className="card overflow-hidden">
        <h2 className="px-6 py-4 text-2xl font-semibold text-blue-900">Classement</h2>
        {classement.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-6 py-3 text-center">Rang</th>
                  <th className="px-6 py-3">Joueur</th>
                  <th className="px-6 py-3 text-center">Matchs</th>
                  <th className="px-6 py-3 text-center">Points</th>
                  <th className="px-6 py-3 text-center">GA</th>
                </tr>
              </thead>
              <tbody>
                {classement.map((ligne, index) => (
                  <tr key={ligne.joueur.id} className="border-b last:border-b-0">
                    <td className="px-6 py-3 text-center font-semibold text-blue-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {ligne.joueur.prenom ?? ligne.joueur.nom}
                    </td>
                    <td className="px-6 py-3 text-center text-slate-700">
                      {ligne.matchs}
                    </td>
                    <td className="px-6 py-3 text-center font-semibold text-blue-900">
                      {ligne.points}
                    </td>
                    <td
                      className={`px-6 py-3 text-center font-semibold ${
                        ligne.goalAverage >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {ligne.goalAverage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-6 py-4 text-slate-500">Aucun match joue pour le moment.</p>
        )}
      </section>
    </div>
  );
}
