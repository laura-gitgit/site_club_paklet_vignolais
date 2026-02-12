import { supabase } from "./supabaseClient";

export type Joueur = {
  id: number;
  nom: string;
  prenom: string | null;
  actif: boolean;
  licence?: string | null;
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

export type Rencontre = {
  id: number;
  equipe: string;
  type: string;
  date: string;
  lieu: string;
  adversaire: string;
};

export type ClassementAsset = {
  key: string;
  path: string;
  url: string;
};

export type Evenement = {
  id: number;
  titre: string;
  texte: string;
  photo_paths: string[];
  created_at: string;
};

export type EvenementView = Evenement & {
  photoUrls: string[];
};

export async function getAllPlayers(): Promise<Joueur[]> {
  const { data, error } = await supabase
    .from("joueurs")
    .select("id, nom, prenom, actif, licence")
    .order("prenom", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Joueur[];
}

export async function getActivePlayers(): Promise<Joueur[]> {
  const { data, error } = await supabase
    .from("joueurs")
    .select("id, nom, prenom, actif, licence")
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

export async function getRencontres(): Promise<Rencontre[]> {
  const { data, error } = await supabase
    .from("rencontres")
    .select("id, equipe, type, date, lieu, adversaire")
    .order("date", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Rencontre[];
}

export async function getClassementAssets(): Promise<ClassementAsset[]> {
  const { data, error } = await supabase
    .from("classement_assets")
    .select("key, path")
    .order("key", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as Array<{ key: string; path: string }>).map((asset) => {
    const { data: publicUrl } = supabase.storage
      .from("club-images")
      .getPublicUrl(asset.path);
    return {
      key: asset.key,
      path: asset.path,
      url: publicUrl.publicUrl,
    };
  });
}

export async function getEvenements(limit?: number): Promise<EvenementView[]> {
  let query = supabase
    .from("evenements")
    .select("id, titre, texte, photo_paths, created_at")
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return (data as Evenement[]).map((evenement) => {
    const photoUrls = (evenement.photo_paths ?? []).map((path) => {
      const { data: publicUrl } = supabase.storage
        .from("club-images")
        .getPublicUrl(path);
      return publicUrl.publicUrl;
    });
    return { ...evenement, photoUrls };
  });
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
