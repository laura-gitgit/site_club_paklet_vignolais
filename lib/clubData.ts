import { supabase } from "./supabaseClient";

export type Joueur = {
  id: number;
  nom: string;
  prenom: string | null;
  actif: boolean;
};

export type RencontreMatch = {
  id: number;
  joueur1_id: number;
  joueur2_id: number;
  score_joueur1: number | null;
  score_joueur2: number | null;
  joue: boolean;
};

export type ClassementLine = {
  joueur: Joueur;
  points: number;
  matchs: number;
  goalsFor: number;
  goalsAgainst: number;
  goalAverage: number;
};

export async function getAllPlayers(): Promise<Joueur[]> {
  const { data, error } = await supabase
    .from("joueurs")
    .select("id, nom, prenom, actif")
    .order("prenom", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Joueur[];
}

export async function getActivePlayers(): Promise<Joueur[]> {
  const { data, error } = await supabase
    .from("joueurs")
    .select("id, nom, prenom, actif")
    .eq("actif", true)
    .order("prenom", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Joueur[];
}

export async function getMatches(): Promise<RencontreMatch[]> {
  const { data, error } = await supabase
    .from("rencontre_matches")
    .select("id, joueur1_id, joueur2_id, score_joueur1, score_joueur2, joue")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as RencontreMatch[];
}

export function buildClassement(players: Joueur[], matches: RencontreMatch[]): ClassementLine[] {
  const classement: ClassementLine[] = [];

  for (const joueur of players) {
    const matchsJoues = matches.filter(
      (match) =>
        match.joue &&
        (match.joueur1_id === joueur.id || match.joueur2_id === joueur.id)
    );

    let points = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const match of matchsJoues) {
      if (match.joueur1_id === joueur.id) {
        goalsFor += match.score_joueur1 ?? 0;
        goalsAgainst += match.score_joueur2 ?? 0;
        if ((match.score_joueur1 ?? 0) > (match.score_joueur2 ?? 0)) {
          points += 2;
        }
      } else {
        goalsFor += match.score_joueur2 ?? 0;
        goalsAgainst += match.score_joueur1 ?? 0;
        if ((match.score_joueur2 ?? 0) > (match.score_joueur1 ?? 0)) {
          points += 2;
        }
      }
    }

    classement.push({
      joueur,
      points,
      matchs: matchsJoues.length,
      goalsFor,
      goalsAgainst,
      goalAverage: goalsFor - goalsAgainst,
    });
  }

  classement.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return b.goalAverage - a.goalAverage;
  });

  return classement;
}
