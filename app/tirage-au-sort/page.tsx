import { getActivePlayers } from "@/lib/clubData";
import TirageForm from "./TirageForm";

export default async function TiragePage() {
  const joueurs = await getActivePlayers();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Tirage au sort</h1>
        <p className="mt-2 text-lg text-slate-600">
          Selectionnez les joueurs presents pour le tirage.
        </p>
      </header>

      <TirageForm joueurs={joueurs} />
    </div>
  );
}
