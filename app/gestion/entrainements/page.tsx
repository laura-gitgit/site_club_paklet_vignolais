import Image from "next/image";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type TrainingPhoto = {
  name: string;
  url: string;
  path: string;
};

async function listTrainingPhotos(): Promise<TrainingPhoto[]> {
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
      return { name: item.name, url: publicUrl.publicUrl, path };
    });
}

async function ajouterExercice(formData: FormData) {
  "use server";
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/gestion/entrainements?error=upload");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `entrainements/${Date.now()}-${safeName}`;
  const fileBytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("club-images")
    .upload(path, fileBytes, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    redirect("/gestion/entrainements?error=upload");
  }

  revalidatePath("/entrainements");
  revalidatePath("/gestion/entrainements");
  redirect("/gestion/entrainements?success=upload");
}

async function supprimerExercice(formData: FormData) {
  "use server";
  const path = String(formData.get("path"));
  if (!path) {
    redirect("/gestion/entrainements?error=delete");
  }

  const { error } = await supabase.storage
    .from("club-images")
    .remove([path]);

  if (error) {
    redirect("/gestion/entrainements?error=delete");
  }

  revalidatePath("/entrainements");
  revalidatePath("/gestion/entrainements");
  redirect("/gestion/entrainements?success=delete");
}

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function GestionEntrainementsPage({ searchParams }: PageProps) {
  const photos = await listTrainingPhotos();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const success = resolvedSearchParams?.success;
  const error = resolvedSearchParams?.error;

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Gestion entrainements</h1>
        <p className="mt-2 text-lg text-slate-600">
          Ajoutez des photos d exercices et ateliers visibles sur la page entrainements.
        </p>
      </header>

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Action terminee avec succes.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Une erreur est survenue.
        </div>
      )}

      <section className="card">
        <h2 className="text-2xl font-semibold text-blue-900">Ajouter un exercice</h2>
        <form action={ajouterExercice} className="mt-4 grid gap-4">
          <input name="file" type="file" accept="image/*" className="block w-full text-sm" required />
          <button className="button-primary" type="submit">
            Ajouter la photo
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold text-blue-900">Photos existantes</h2>
        {photos.length === 0 ? (
          <p className="mt-3 text-slate-600">Aucune photo pour le moment.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.path} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Image
                  src={photo.url}
                  alt={`Exercice ${photo.name}`}
                  width={640}
                  height={480}
                  className="h-auto w-full object-cover"
                />
                <form action={supprimerExercice} className="border-t border-slate-200 p-3">
                  <input type="hidden" name="path" value={photo.path} />
                  <button className="button-muted" type="submit">
                    Supprimer
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
