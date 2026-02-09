"use server";

import { supabase } from "@/lib/supabaseClient";
import type { Joueur } from "@/lib/clubData";

export type TirageEquipe = {
  type: "2vs2" | "2vs3" | "1vs1" | "1vs1vs1" | "1vs";
  equipe1: Joueur[];
  equipe2?: Joueur[];
  equipe3?: Joueur[];
};

export type TirageState = {
  error?: string;
  equipes?: TirageEquipe[];
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function generateTirage(
  _prevState: TirageState,
  formData: FormData
): Promise<TirageState> {
  const ids = formData.getAll("joueurs").map((id) => Number(id));

  if (ids.length < 2) {
    return { error: "Au moins 2 joueurs sont necessaires pour un tirage." };
  }

  const { data, error } = await supabase
    .from("joueurs")
    .select("id, nom, prenom, actif")
    .in("id", ids);

  if (error || !data) {
    return { error: "Impossible de recuperer les joueurs." };
  }

  const joueurs = shuffle(data as Joueur[]);
  const equipes: TirageEquipe[] = [];

  for (let i = 0; i < joueurs.length; i += 4) {
    if (i + 3 < joueurs.length) {
      equipes.push({
        type: "2vs2",
        equipe1: [joueurs[i], joueurs[i + 1]],
        equipe2: [joueurs[i + 2], joueurs[i + 3]],
      });
    }
  }

  const reste = joueurs.length % 4;
  if (reste > 0) {
    const joueursReste = joueurs.slice(-reste);

    if (reste === 1) {
      if (equipes.length > 0) {
        const lastEquipe = equipes[equipes.length - 1];
        lastEquipe.equipe2 = [...(lastEquipe.equipe2 ?? []), joueursReste[0]];
        lastEquipe.type = "2vs3";
      } else {
        equipes.push({ type: "1vs", equipe1: [joueursReste[0]] });
      }
    } else if (reste === 2) {
      equipes.push({
        type: "1vs1",
        equipe1: [joueursReste[0]],
        equipe2: [joueursReste[1]],
      });
    } else if (reste === 3) {
      equipes.push({
        type: "1vs1vs1",
        equipe1: [joueursReste[0]],
        equipe2: [joueursReste[1]],
        equipe3: [joueursReste[2]],
      });
    }
  }

  return { equipes };
}
