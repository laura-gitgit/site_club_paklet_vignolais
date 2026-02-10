import Image from "next/image";
import { getClassementAssets, getRencontres } from "@/lib/clubData";

export default async function ClassementPage() {
  const [rencontres, assets] = await Promise.all([
    getRencontres(),
    getClassementAssets(),
  ]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assetMap = new Map(assets.map((asset) => [asset.key, asset.url]));
  const resolveAsset = (key: string, fallback: string) => assetMap.get(key) ?? fallback;

  const rencontresEquipe1 = rencontres.filter((rencontre) => rencontre.equipe === "Equipe 1");
  const rencontresEquipe2 = rencontres.filter((rencontre) => rencontre.equipe === "Equipe 2");

  const formatDate = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR");

  const buildRencontreView = (items: typeof rencontres) => {
    const sorted = [...items].sort((a, b) =>
      new Date(`${a.date}T00:00:00`).getTime() - new Date(`${b.date}T00:00:00`).getTime()
    );
    const upcoming = sorted.filter(
      (rencontre) => new Date(`${rencontre.date}T00:00:00`).getTime() >= today.getTime()
    );
    return { prochaine: upcoming[0] ?? null };
  };

  const rencontresViewEquipe1 = buildRencontreView(rencontresEquipe1);
  const rencontresViewEquipe2 = buildRencontreView(rencontresEquipe2);

  const liensUtiles = [
    {
      label: "Calendrier D3",
      href: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTkHCiIxckPVWFI1KV8liybs6AwGPnq5-Gsp08Ytx06egw2pX8r47iub4saYxY2s0T8S9UF5w-ubK4m/pubhtml#gid=1309821108",
    },
    {
      label: "Calendrier D4",
      href: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTkHCiIxckPVWFI1KV8liybs6AwGPnq5-Gsp08Ytx06egw2pX8r47iub4saYxY2s0T8S9UF5w-ubK4m/pubhtml#gid=1965719293",
    },
    {
      label: "Classements",
      href: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTkHCiIxckPVWFI1KV8liybs6AwGPnq5-Gsp08Ytx06egw2pX8r47iub4saYxY2s0T8S9UF5w-ubK4m/pubhtml#gid=543126141",
    },
    {
      label: "Coupe",
      href: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTkHCiIxckPVWFI1KV8liybs6AwGPnq5-Gsp08Ytx06egw2pX8r47iub4saYxY2s0T8S9UF5w-ubK4m/pubhtml#gid=1915588028",
    },
    {
      label: "Top44 D3",
      href: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuR7emefpS5g6ggVVEA5YQKRZwlJImHE9NBFKFXP5pzIOCg4r6KdJkHFD7q8YUmt4IGTFzPbxRHieY/pubhtml#gid=522827806",
    },
    {
      label: "Top44 D4",
      href: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuR7emefpS5g6ggVVEA5YQKRZwlJImHE9NBFKFXP5pzIOCg4r6KdJkHFD7q8YUmt4IGTFzPbxRHieY/pubhtml#gid=395125896",
    },
  ];

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Classement</h1>
        <p className="mt-2 text-lg text-slate-600">
          Classement general des joueurs du club.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        {[
          {
            key: "Equipe 1",
            title: "Classement Equipe 1",
            image: resolveAsset("classement_equipe1", "/images/classement_equipe1.png"),
            calendrier: resolveAsset("calendrier_equipe1", "/images/calendrier_equipe1.jpg"),
            rencontresView: rencontresViewEquipe1,
          },
          {
            key: "Equipe 2",
            title: "Classement Equipe 2",
            image: resolveAsset("classement_equipe2", "/images/classement_equipe2.png"),
            calendrier: resolveAsset("calendrier_equipe2", "/images/calendrier_equipe2.jpg"),
            rencontresView: rencontresViewEquipe2,
          },
        ].map((section) => (
          <div key={section.key} className="card overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-2xl font-semibold text-blue-900">{section.title}</h2>
            </div>
            <div className="grid gap-6 px-6 py-5">
              <a
                href={section.image}
                className="block rounded-xl bg-slate-100 p-3"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  src={section.image}
                  alt={section.title}
                  width={800}
                  height={520}
                  className="h-auto w-full rounded-lg object-cover"
                />
                <p className="mt-2 text-sm font-semibold text-blue-900">
                  Voir le classement en grand
                </p>
              </a>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-semibold text-blue-900">Prochaine rencontre</h3>
                {section.rencontresView.prochaine ? (
                  <div className="mt-3 grid gap-2 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold">Date:</span> {formatDate(section.rencontresView.prochaine.date)}
                    </p>
                    <p>
                      <span className="font-semibold">Adversaire:</span> {section.rencontresView.prochaine.adversaire}
                    </p>
                    <p>
                      <span className="font-semibold">Lieu:</span> {section.rencontresView.prochaine.lieu}
                    </p>
                    <p>
                      <span className="font-semibold">Type:</span> {section.rencontresView.prochaine.type}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">Aucune rencontre planifiee.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-900">Calendrier Annuel</h3>
                <a
                  href={section.calendrier}
                  className="mt-3 block rounded-xl border border-slate-200 bg-white p-3"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src={section.calendrier}
                    alt={`Calendrier ${section.key}`}
                    width={800}
                    height={520}
                    className="h-auto w-full rounded-lg object-cover"
                  />
                  <p className="mt-2 text-sm font-semibold text-blue-900">
                    Voir le calendrier complet
                  </p>
                </a>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-2xl font-semibold text-blue-900">Liens utiles laiton 44</h2>
        </div>
        <div className="px-6 py-5">
          <ul className="grid gap-2 text-sm">
            {liensUtiles.map((lien) => (
              <li key={lien.href}>
                <a
                  href={lien.href}
                  className="font-semibold text-blue-700 hover:text-blue-800"
                  target="_blank"
                  rel="noreferrer"
                >
                  {lien.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
