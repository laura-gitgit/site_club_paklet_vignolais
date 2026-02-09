import { buildClassement, getActivePlayers, getMatches } from "@/lib/clubData";

export default async function ClassementPage() {
  const [players, matches] = await Promise.all([
    getActivePlayers(),
    getMatches(),
  ]);
  const classement = buildClassement(players, matches);

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Classement</h1>
        <p className="mt-2 text-lg text-slate-600">
          Classement general des joueurs du club.
        </p>
      </header>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-6 py-3">Rang</th>
                <th className="px-6 py-3">Joueur</th>
                <th className="px-6 py-3">Points</th>
              </tr>
            </thead>
            <tbody>
              {classement.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-slate-500" colSpan={3}>
                    Aucun joueur ou aucun match enregistre.
                  </td>
                </tr>
              )}
              {classement.map((ligne, index) => (
                <tr key={ligne.joueur.id} className="border-b last:border-b-0">
                  <td className="px-6 py-3 font-semibold text-blue-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-3 text-slate-700">
                    {ligne.joueur.prenom ?? ligne.joueur.nom}
                  </td>
                  <td className="px-6 py-3 text-slate-700">{ligne.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
