import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type TrainingPhoto = {
  name: string;
  url: string;
};

async function getTrainingPhotos(): Promise<TrainingPhoto[]> {
  const { data, error } = await supabase.storage
    .from("club-images")
    .list("entrainements", { sortBy: { column: "name", order: "asc" } });

  if (error || !data) {
    return [];
  }

  return data
    .filter((item) => item.name)
    .map((item) => {
      const path = `entrainements/${item.name}`;
      const { data: publicUrl } = supabase.storage
        .from("club-images")
        .getPublicUrl(path);
      return { name: item.name, url: publicUrl.publicUrl };
    });
}

export default async function EntrainementsPage() {
  const photos = await getTrainingPhotos();

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Entrainements</h1>
        <p className="mt-2 text-lg text-slate-600">
          Exercices pour s'entraîner.
        </p>
        <div className="mt-4">
          <Link className="button-primary" href="/gestion/entrainements">
            Ajouter un exercice
          </Link>
        </div>
      </header>

      <section className="card">
        <h2 className="text-2xl font-semibold text-blue-900">Galerie</h2>
        {photos.length === 0 ? (
          <p className="mt-3 text-slate-600">
            Ajoutez des photos depuis la gestion pour les afficher ici.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.name} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Image
                  src={photo.url}
                  alt={`Entrainement ${photo.name}`}
                  width={640}
                  height={480}
                  className="h-auto w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
