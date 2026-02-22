import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { getActivePlayers, getMatches } from "@/lib/clubData";
import ResetTournoiForm from "@/app/gestion/tournoi/ResetTournoiForm";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function genererTour() {
  "use server";
  const supabase = createServerActionClient({ cookies });
  const [players, matches] = await Promise.all([
    getActivePlayers(),
    getMatches(),
  ]);

  if (players.length < 2) {
    redirect("/gestion/tournoi?error=players");
  }

  if (matches.some((match) => !match.joue)) {
    redirect("/gestion/tournoi?info=pending");
  }

  const playedPairs = new Set<string>();
  for (const match of matches) {
    const a = Math.min(match.joueur1_id, match.joueur2_id);
    const b = Math.max(match.joueur1_id, match.joueur2_id);
    playedPairs.add(`${a}-${b}`);
  }

  const shuffledPlayers = shuffle(players);
  const usedPlayers = new Set<number>();
  const newMatches: Array<{ joueur1_id: number; joueur2_id: number; joue: boolean }> = [];

  for (let i = 0; i < shuffledPlayers.length; i += 1) {
    const joueurA = shuffledPlayers[i];
    if (usedPlayers.has(joueurA.id)) {
      continue;
    }

    let opponentIndex = -1;
    for (let j = i + 1; j < shuffledPlayers.length; j += 1) {
      const joueurB = shuffledPlayers[j];
      if (usedPlayers.has(joueurB.id)) {
        continue;
      }
      const a = Math.min(joueurA.id, joueurB.id);
      const b = Math.max(joueurA.id, joueurB.id);
      if (!playedPairs.has(`${a}-${b}`)) {
        opponentIndex = j;
        break;
      }
    }

    if (opponentIndex === -1) {
      for (let j = i + 1; j < shuffledPlayers.length; j += 1) {
        const joueurB = shuffledPlayers[j];
        if (!usedPlayers.has(joueurB.id)) {
          opponentIndex = j;
          break;
        }
      }
    }

    if (opponentIndex === -1) {
      continue;
    }

    const joueurB = shuffledPlayers[opponentIndex];
    usedPlayers.add(joueurA.id);
    usedPlayers.add(joueurB.id);

    newMatches.push({
      joueur1_id: joueurA.id,
      joueur2_id: joueurB.id,
      joue: false,
    });
  }

  if (newMatches.length === 0) {
    redirect("/gestion/tournoi?info=done");
  }

  const { error } = await supabase.from("rencontre_matches").insert(newMatches);
  if (error) {
    redirect("/gestion/tournoi?error=create");
  }

  revalidatePath("/tournoi");
  revalidatePath("/gestion/tournoi");
  redirect("/gestion/tournoi?success=round");
}

async function ajouterMatchManuel(formData: FormData) {
  "use server";
  const supabase = createServerActionClient({ cookies });
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
    redirect("/gestion/tournoi?error=match");
  }

  const { error } = await supabase.from("rencontre_matches").insert({
    joueur1_id: joueur1Id,
    joueur2_id: joueur2Id,
    score_joueur1: scoreJ1,
    score_joueur2: scoreJ2,
    joue: true,
  });

  if (error) {
    redirect("/gestion/tournoi?error=match");
  }

  revalidatePath("/tournoi");
  revalidatePath("/gestion/tournoi");
  redirect("/gestion/tournoi?success=match");
}

async function reinitialiserTournoi() {
  "use server";
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.from("rencontre_matches").delete().neq("id", 0);
  if (error) {
    redirect("/gestion/tournoi?error=reset");
  }

  revalidatePath("/tournoi");
  revalidatePath("/gestion/tournoi");
  redirect("/gestion/tournoi?success=reset");
}

export default async function GestionTournoiPage({ searchParams }: PageProps) {
  const [players, matches] = await Promise.all([
    getActivePlayers(),
    getMatches(),
  ]);
  const pendingCount = matches.filter((match) => !match.joue).length;

  const success = searchParams?.success;
  const error = searchParams?.error;
  const info = searchParams?.info;

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Gestion tournoi</h1>
        <p className="mt-2 text-lg text-slate-600">
          Générez les matchs du tournoi interne et ajoutez les scores manquants.
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
      {info && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {info === "pending"
            ? "Des matchs sont deja en attente."
            : "Tous les joueurs se sont deja rencontres."}
        </div>
      )}

      <section className="card">
        <h2 className="text-2xl font-semibold text-blue-900">Generer un tour</h2>
        <p className="mt-2 text-slate-600">
          {pendingCount > 0
            ? `${pendingCount} match(s) en attente avant de generer un nouveau tour.`
            : "Aucun match en attente actuellement."}
        </p>
        <form action={genererTour} className="mt-4">
          <button className="button-primary" type="submit">
            Générer les matchs du tour
          </button>
        </form>
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

      <section className="card">
        <h2 className="text-2xl font-semibold text-blue-900">Reinitialiser le tournoi</h2>
        <p className="mt-2 text-slate-600">
          Supprime tous les matchs 1vs1 pour repartir de zero.
        </p>
        <ResetTournoiForm action={reinitialiserTournoi} />
      </section>
    </div>
  );
}
