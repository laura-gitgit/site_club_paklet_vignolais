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
          Paklet Vignolais - Club de palet laiton a Vigneux-de-Bretagne
        </h1>
        <div className="grid max-w-3xl gap-4 text-lg leading-8 text-slate-600">
          <p>
            Le Paklet Vignolais est un club de palet laiton ancre a Vigneux-de-Bretagne,
            ou le plaisir du jeu et la convivialite priment avant tout. Nous rassemblons
            aujourd hui 34 licencies, animes par la meme passion et l envie de partager
            de bons moments autour du palet.
          </p>
          <p>
            Ouvert a toutes et tous, notre club accueille aussi bien les joueurs debutants
            que les plus experimentes. Chacun y trouve sa place, quel que soit son niveau.
            L entraide, le respect et la progression collective sont au coeur de notre
            fonctionnement.
          </p>
          <p>
            Les entrainements se deroulent dans une ambiance chaleureuse, propice a
            l apprentissage comme a la competition, toujours dans un esprit de fair-play
            et de bonne humeur.
          </p>
          <p className="font-semibold text-blue-900">
            Envie d essayer ? Il suffit d avoir l envie de jouer, de lancer un palet et de
            partager un bon moment. Le Paklet Vignolais recrute et sera heureux de vous
            accueillir.
          </p>
          <p>
            N'hésitez pas à nous suivre sur Facebook : https://www.facebook.com/groups/857038471790923/discussion/preview?locale=fr_FR.
          </p>
        </div>
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
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{evenement.texte}</p>
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
