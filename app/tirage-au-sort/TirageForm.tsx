"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import type { Joueur } from "@/lib/clubData";
import { generateTirage, TirageState } from "./actions";

const initialState: TirageState = {};
const STORAGE_KEY = "tirage-selected-players";

function joueurLabel(joueur: Joueur): string {
  return joueur.prenom ?? joueur.nom;
}

function readStoredSelection(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsedIds = JSON.parse(rawValue);
    if (!Array.isArray(parsedIds)) {
      return [];
    }

    return parsedIds
      .map((id) => String(id).trim())
      .filter((id) => id.length > 0);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export default function TirageForm({ joueurs }: { joueurs: Joueur[] }) {
  const [state, formAction] = useActionState(generateTirage, initialState);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(() =>
    readStoredSelection()
  );
  const [isHydrated, setIsHydrated] = useState(false);

  function resetSelection() {
    setSelectedPlayerIds([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  useEffect(() => {
    const validIds = new Set(joueurs.map((joueur) => String(joueur.id)));
    setSelectedPlayerIds((currentIds) => currentIds.filter((id) => validIds.has(id)));
  }, [joueurs]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPlayerIds));
  }, [isHydrated, selectedPlayerIds]);

  const isReady = isHydrated;

  function handleTogglePlayer(playerId: string, isChecked: boolean) {
    setSelectedPlayerIds((currentIds) => {
      if (isChecked) {
        return currentIds.includes(playerId)
          ? currentIds
          : [...currentIds, playerId];
      }
      return currentIds.filter((id) => id !== playerId);
    });
  }

  return (
    <div className="grid gap-6">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form
        action={formAction}
        className="grid gap-6"
        onSubmit={(event) => {
          const submittedIds = new FormData(event.currentTarget)
            .getAll("joueurs")
            .map((id) => String(id));
          setSelectedPlayerIds(submittedIds);
        }}
      >
        <div className="card">
          <h2 className="text-2xl font-semibold text-blue-900">Joueurs disponibles</h2>
          {joueurs.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {joueurs.map((joueur) => (
                <label
                  key={joueur.id}
                  className="flex min-h-12 items-center gap-4 rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700 transition hover:bg-blue-50 active:scale-[0.99]"
                >
                  <input
                    type="checkbox"
                    name="joueurs"
                    value={joueur.id}
                    checked={selectedPlayerIds.includes(String(joueur.id))}
                    disabled={!isReady}
                    onChange={(event) =>
                      handleTogglePlayer(String(joueur.id), event.target.checked)
                    }
                    className="h-5 w-5 accent-blue-900"
                  />
                  <span className="select-none">{joueurLabel(joueur)}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Aucun joueur disponible. <Link className="text-blue-900 underline" href="/gestion/joueurs">Ajouter des joueurs</Link>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <button className="button-primary" type="submit" disabled={!isReady}>
            Generer le tirage
          </button>
          <button
            className="rounded-full border border-red-300 bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={resetSelection}
            disabled={!isReady}
          >
            Reinitialiser la selection
          </button>
          <Link className="button-muted" href="/gestion/joueurs">
            Gerer les joueurs
          </Link>
        </div>

        {!isReady && (
          <p className="text-sm text-slate-500">
            Chargement de la selection...
          </p>
        )}
      </form>

      {state.equipes && state.equipes.length > 0 && (
        <section className="grid gap-4">
          <h2 className="text-3xl font-semibold text-blue-900">Resultats du tirage</h2>
          <div className="grid gap-4">
            {state.equipes.map((equipe, index) => (
              <div key={`${equipe.type}-${index}`} className="card">
                <div className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white">
                  Match {index + 1} - {equipe.type}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <h3 className="text-sm font-semibold text-blue-900">Equipe 1</h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {equipe.equipe1.map((joueur) => (
                        <li key={joueur.id}>{joueurLabel(joueur)}</li>
                      ))}
                    </ul>
                  </div>
                  {equipe.equipe2 && (
                    <div className="rounded-lg bg-blue-100 p-3">
                      <h3 className="text-sm font-semibold text-blue-900">Equipe 2</h3>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {equipe.equipe2.map((joueur) => (
                          <li key={joueur.id}>{joueurLabel(joueur)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {equipe.equipe3 && (
                    <div className="rounded-lg bg-blue-200 p-3">
                      <h3 className="text-sm font-semibold text-blue-900">Equipe 3</h3>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {equipe.equipe3.map((joueur) => (
                          <li key={joueur.id}>{joueurLabel(joueur)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {equipe.type === "1vs" && (
                  <p className="mt-3 text-sm text-slate-600">
                    Joueur sans adversaire.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
