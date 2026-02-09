import Image from "next/image";
import { getEvenements } from "@/lib/clubData";

export default async function EvenementsPage() {
  const evenements = await getEvenements();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Evenements</h1>
        <p className="mt-2 text-lg text-slate-600">
          Les actualites et rendez-vous du club.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        {evenements.length === 0 ? (
          <div className="card">
            <p className="text-slate-600">Aucun evenement pour le moment.</p>
          </div>
        ) : (
          evenements.map((evenement) => (
            <div key={evenement.id} className="card grid gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-blue-900">{evenement.titre}</h2>
                <p className="mt-2 text-sm text-slate-600">{evenement.texte}</p>
              </div>
              {evenement.photoUrls.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {evenement.photoUrls.map((url, index) => (
                    <div key={`${evenement.id}-${index}`} className="overflow-hidden rounded-xl">
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
          ))
        )}
      </section>
    </div>
  );
}
