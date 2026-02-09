import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildClassement, getActivePlayers, getMatches } from "@/lib/clubData";
import { supabase } from "@/lib/supabaseClient";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

async function genererMatch() {
  "use server";
  const [players, matches] = await Promise.all([
    getActivePlayers(),
    getMatches(),
  ]);

  if (players.length < 2) {
    redirect("/tournoi?error=players");
  }

  const playedPairs = new Set<string>();
  for (const match of matches) {
    const a = Math.min(match.joueur1_id, match.joueur2_id);
    const b = Math.max(match.joueur1_id, match.joueur2_id);
    playedPairs.add(`${a}-${b}`);
  }

  let created = false;
  for (let i = 0; i < players.length && !created; i += 1) {
    for (let j = i + 1; j < players.length && !created; j += 1) {
      const a = Math.min(players[i].id, players[j].id);
      const b = Math.max(players[i].id, players[j].id);
      if (playedPairs.has(`${a}-${b}`)) {
        continue;
      }

      const { error } = await supabase.from("rencontre_matches").insert({
        joueur1_id: players[i].id,
        joueur2_id: players[j].id,
        joue: false,
      });

      if (error) {
        redirect("/tournoi?error=create");
      }

      created = true;
    }
  }

  revalidatePath("/tournoi");
  if (!created) {
    redirect("/tournoi?info=done");
  }

  redirect("/tournoi?success=match");
}

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
  const prochainMatch = matches.find((match) => !match.joue);
  const playersById = new Map(players.map((player) => [player.id, player]));

  const success = searchParams?.success;
  const error = searchParams?.error;
  const info = searchParams?.info;

  const joueur1 = prochainMatch ? playersById.get(prochainMatch.joueur1_id) : null;
  const joueur2 = prochainMatch ? playersById.get(prochainMatch.joueur2_id) : null;

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Tournoi interne 1vs1</h1>
        <p className="mt-2 text-lg text-slate-600">
          Gere les matchs et consulte le classement.
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
      {info && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Tous les joueurs se sont deja rencontres.
        </div>
      )}

      <section className="card">
        <h2 className="text-2xl font-semibold text-blue-900">Prochain match</h2>
        {prochainMatch && joueur1 && joueur2 ? (
          <div className="mt-4 grid gap-4">
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-6">
              <div className="grid items-center gap-6 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Joueur 1</p>
                  <p className="text-2xl font-semibold text-blue-900">
                    {joueur1.prenom ?? joueur1.nom}
                  </p>
                </div>
                <div className="text-center text-3xl font-semibold text-blue-900">VS</div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Joueur 2</p>
                  <p className="text-2xl font-semibold text-blue-900">
                    {joueur2.prenom ?? joueur2.nom}
                  </p>
                </div>
              </div>
            </div>

            <form action={enregistrerScore} className="grid gap-4 md:grid-cols-3">
              <input type="hidden" name="id" value={prochainMatch.id} />
              <div>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="score_joueur1">
                  Score {joueur1.prenom ?? joueur1.nom}
                </label>
                <input
                  id="score_joueur1"
                  name="score_joueur1"
                  type="number"
                  min={0}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-center text-lg"
                />
              </div>
              <div className="flex items-end justify-center text-lg font-semibold text-slate-500">-</div>
              <div>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="score_joueur2">
                  Score {joueur2.prenom ?? joueur2.nom}
                </label>
                <input
                  id="score_joueur2"
                  name="score_joueur2"
                  type="number"
                  min={0}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-center text-lg"
                />
              </div>
              <button className="button-primary md:col-span-3" type="submit">
                Enregistrer le score
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-slate-100 p-6 text-center">
            <p className="text-slate-600">Aucun match en attente</p>
            <form action={genererMatch} className="mt-4">
              <button className="button-primary" type="submit">
                Generer le prochain match
              </button>
            </form>
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
                  <th className="px-6 py-3 text-center">For</th>
                  <th className="px-6 py-3 text-center">Contre</th>
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
                    <td className="px-6 py-3 text-center text-slate-700">
                      {ligne.goalsFor}
                    </td>
                    <td className="px-6 py-3 text-center text-slate-700">
                      {ligne.goalsAgainst}
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
