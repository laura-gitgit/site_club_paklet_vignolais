import Image from "next/image";
import { getEvenements } from "@/lib/clubData";

export default async function Home() {
  const evenements = await getEvenements(3);

  return (
    <div className="grid gap-10">
      <section className="card grid gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-900">
          Presentation du club
        </p>
        <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
          Association Pa[K]let Vignolais
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Association de palet basee a Vigneux, nous partageons entrainements,
          rencontres et moments conviviaux autour du jeu.
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <Image
            src="/images/paklet_vignolais_recrute.jpeg"
            alt="Association Pa[K]let Vignolais"
            width={960}
            height={540}
            className="h-auto w-full object-cover"
          />
        </div>
      </section>

      <section className="card">
        <div>
          <h2 className="text-2xl font-semibold text-blue-900">Evenements</h2>
          <p className="mt-2 text-slate-600">
            Les actualites et rendez-vous du club.
          </p>
        </div>

        {evenements.length === 0 ? (
          <p className="mt-4 text-slate-600">Aucun evenement pour le moment.</p>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {evenements.map((evenement) => (
              <div key={evenement.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-semibold text-blue-900">{evenement.titre}</h3>
                <p className="mt-2 text-sm text-slate-600">{evenement.texte}</p>
                {evenement.photoUrls.length > 0 && (
                  <div className="mt-3 grid gap-2">
                    {evenement.photoUrls.map((url, index) => (
                      <div key={`${evenement.id}-${index}`} className="overflow-hidden rounded-lg">
                        <Image
                          src={url}
                          alt={`Evenement ${evenement.titre} ${index + 1}`}
                          width={640}
                          height={420}
                          className="h-auto w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
