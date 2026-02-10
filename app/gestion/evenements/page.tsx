import Image from "next/image";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEvenements } from "@/lib/clubData";
import { supabase } from "@/lib/supabaseClient";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function ajouterEvenement(formData: FormData) {
  "use server";
  const titre = String(formData.get("titre"));
  const texte = String(formData.get("texte"));
  const files = formData.getAll("photos").filter((file) => file instanceof File) as File[];

  if (!titre || !texte) {
    redirect("/gestion/evenements?error=event");
  }

  const photoPaths: string[] = [];

  for (const file of files) {
    if (file.size === 0) {
      continue;
    }
    const safeName = sanitizeFileName(file.name);
    const path = `evenements/${Date.now()}-${safeName}`;
    const fileBytes = new Uint8Array(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("club-images")
      .upload(path, fileBytes, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });

    if (error) {
      redirect("/gestion/evenements?error=upload");
    }

    photoPaths.push(path);
  }

  const { error } = await supabase.from("evenements").insert({
    titre,
    texte,
    photo_paths: photoPaths,
  });

  if (error) {
    redirect("/gestion/evenements?error=event");
  }

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath("/gestion/evenements");
  redirect("/gestion/evenements?success=event");
}

async function mettreAJourEvenement(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const titre = String(formData.get("titre"));
  const texte = String(formData.get("texte"));

  if (Number.isNaN(id) || !titre || !texte) {
    redirect("/gestion/evenements?error=event");
  }

  const { error } = await supabase
    .from("evenements")
    .update({ titre, texte })
    .eq("id", id);

  if (error) {
    redirect("/gestion/evenements?error=event");
  }

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath("/gestion/evenements");
  redirect("/gestion/evenements?success=event");
}

async function supprimerEvenement(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));

  if (Number.isNaN(id)) {
    redirect("/gestion/evenements?error=event");
  }

  const { error } = await supabase.from("evenements").delete().eq("id", id);

  if (error) {
    redirect("/gestion/evenements?error=event");
  }

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath("/gestion/evenements");
  redirect("/gestion/evenements?success=event");
}

export default async function GestionEvenementsPage({ searchParams }: PageProps) {
  const evenements = await getEvenements();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const success = resolvedSearchParams?.success;
  const error = resolvedSearchParams?.error;

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Gestion evenements</h1>
        <p className="mt-2 text-lg text-slate-600">
          Ajoutez des textes et photos pour les evenements du club.
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
        <h2 className="text-2xl font-semibold text-blue-900">Ajouter un evenement</h2>
        <form action={ajouterEvenement} className="mt-4 grid gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="titre">
              Titre
            </label>
            <input
              id="titre"
              name="titre"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="texte">
              Texte
            </label>
            <textarea
              id="texte"
              name="texte"
              rows={4}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="photos">
              Photos
            </label>
            <input
              id="photos"
              name="photos"
              type="file"
              accept="image/*"
              multiple
              className="mt-2 block w-full text-sm"
            />
          </div>
          <button className="button-primary" type="submit">
            Ajouter l evenement
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold text-blue-900">Evenements existants</h2>
        {evenements.length === 0 ? (
          <p className="mt-3 text-slate-600">Aucun evenement pour le moment.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {evenements.map((evenement) => (
              <div key={evenement.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <form action={mettreAJourEvenement} className="grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={evenement.id} />
                  <div>
                    <label className="block text-xs font-semibold text-slate-600" htmlFor={`titre-${evenement.id}`}>
                      Titre
                    </label>
                    <input
                      id={`titre-${evenement.id}`}
                      name="titre"
                      defaultValue={evenement.titre}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600" htmlFor={`texte-${evenement.id}`}>
                      Texte
                    </label>
                    <textarea
                      id={`texte-${evenement.id}`}
                      name="texte"
                      rows={3}
                      defaultValue={evenement.texte}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-wrap gap-2">
                    <button className="button-primary" type="submit">
                      Mettre a jour
                    </button>
                    <button
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                      type="submit"
                      formAction={supprimerEvenement}
                    >
                      Supprimer
                    </button>
                  </div>
                </form>
                {evenement.photoUrls.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {evenement.photoUrls.map((url, index) => (
                      <div key={`${evenement.id}-${index}`} className="overflow-hidden rounded-lg">
                        <Image
                          src={url}
                          alt={`Evenement ${evenement.titre} ${index + 1}`}
                          width={480}
                          height={320}
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
