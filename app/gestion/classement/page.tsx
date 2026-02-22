import Image from "next/image";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { getClassementAssets, getRencontres } from "@/lib/clubData";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

type UploadKey =
  | "classement_equipe1"
  | "classement_equipe2"
  | "calendrier_equipe1"
  | "calendrier_equipe2";

async function uploadAsset(formData: FormData) {
  "use server";
  const supabase = createServerActionClient({ cookies });
  const key = String(formData.get("key")) as UploadKey;
  const file = formData.get("file");

  if (!key || !(file instanceof File) || file.size === 0) {
    redirect("/gestion/classement?error=upload");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${key}.${extension}`;

  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("club-images")
    .upload(path, fileBytes, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    redirect("/gestion/classement?error=upload");
  }

  const { error } = await supabase
    .from("classement_assets")
    .upsert({ key, path, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) {
    redirect("/gestion/classement?error=upload");
  }

  revalidatePath("/classement");
  revalidatePath("/gestion/classement");
  redirect("/gestion/classement?success=upload");
}

async function ajouterRencontre(formData: FormData) {
  "use server";
  const supabase = createServerActionClient({ cookies });
  const equipe = String(formData.get("equipe"));
  const type = String(formData.get("type"));
  const date = String(formData.get("date"));
  const lieu = String(formData.get("lieu"));
  const adversaire = String(formData.get("adversaire"));

  if (!equipe || !type || !date || !lieu || !adversaire) {
    redirect("/gestion/classement?error=rencontre");
  }

  const { error } = await supabase.from("rencontres").insert({
    equipe,
    type,
    date,
    lieu,
    adversaire,
  });

  if (error) {
    redirect("/gestion/classement?error=rencontre");
  }

  revalidatePath("/classement");
  revalidatePath("/gestion/classement");
  redirect("/gestion/classement?success=rencontre");
}

async function mettreAJourRencontre(formData: FormData) {
  "use server";
  const supabase = createServerActionClient({ cookies });
  const id = Number(formData.get("id"));
  const equipe = String(formData.get("equipe"));
  const type = String(formData.get("type"));
  const date = String(formData.get("date"));
  const lieu = String(formData.get("lieu"));
  const adversaire = String(formData.get("adversaire"));

  if (Number.isNaN(id) || !equipe || !type || !date || !lieu || !adversaire) {
    redirect("/gestion/classement?error=rencontre");
  }

  const { error } = await supabase
    .from("rencontres")
    .update({ equipe, type, date, lieu, adversaire })
    .eq("id", id);

  if (error) {
    redirect("/gestion/classement?error=rencontre");
  }

  revalidatePath("/classement");
  revalidatePath("/gestion/classement");
  redirect("/gestion/classement?success=rencontre");
}

async function supprimerRencontre(formData: FormData) {
  "use server";
  const supabase = createServerActionClient({ cookies });
  const id = Number(formData.get("id"));
  if (Number.isNaN(id)) {
    redirect("/gestion/classement?error=rencontre");
  }

  const { error } = await supabase.from("rencontres").delete().eq("id", id);
  if (error) {
    redirect("/gestion/classement?error=rencontre");
  }

  revalidatePath("/classement");
  revalidatePath("/gestion/classement");
  redirect("/gestion/classement?success=rencontre");
}

export default async function GestionClassementPage({ searchParams }: PageProps) {
  const [rencontres, assets] = await Promise.all([
    getRencontres(),
    getClassementAssets(),
  ]);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const success = resolvedSearchParams?.success;
  const error = resolvedSearchParams?.error;

  const assetMap = new Map(assets.map((asset) => [asset.key, asset.url]));
  const resolveAsset = (key: UploadKey, fallback: string) => assetMap.get(key) ?? fallback;

  const uploads = [
    {
      key: "classement_equipe1" as const,
      label: "Classement Equipe 1",
      fallback: "/images/classement_equipe1.png",
    },
    {
      key: "classement_equipe2" as const,
      label: "Classement Equipe 2",
      fallback: "/images/classement_equipe2.png",
    },
    {
      key: "calendrier_equipe1" as const,
      label: "Calendrier Equipe 1",
      fallback: "/images/calendrier_equipe1.jpg",
    },
    {
      key: "calendrier_equipe2" as const,
      label: "Calendrier Equipe 2",
      fallback: "/images/calendrier_equipe2.jpg",
    },
  ];

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Gestion classement</h1>
        <p className="mt-2 text-lg text-slate-600">
          Ajoutez les rencontres et mettez a jour les photos D3 / D4.
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
        <h2 className="text-2xl font-semibold text-blue-900">Photos classement & calendriers</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {uploads.map((upload) => (
            <form
              key={upload.key}
              action={uploadAsset}
              className="rounded-xl border border-slate-200 bg-white p-4"
              encType="multipart/form-data"
            >
              <input type="hidden" name="key" value={upload.key} />
              <p className="text-sm font-semibold text-slate-700">{upload.label}</p>
              <div className="mt-3 rounded-lg bg-slate-100 p-2">
                <Image
                  src={resolveAsset(upload.key, upload.fallback)}
                  alt={upload.label}
                  width={600}
                  height={400}
                  className="h-auto w-full rounded-md object-cover"
                />
              </div>
              <input
                name="file"
                type="file"
                accept="image/*"
                className="mt-3 block w-full text-sm"
                required
              />
              <button className="button-primary mt-3" type="submit">
                Mettre a jour la photo
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-semibold text-blue-900">Rencontres Equipe 1 / Equipe 2</h2>
        <form action={ajouterRencontre} className="mt-4 grid gap-4 md:grid-cols-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="equipe">
              Equipe
            </label>
            <select
              id="equipe"
              name="equipe"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              defaultValue="Equipe 1"
            >
              <option value="Equipe 1">Equipe 1</option>
              <option value="Equipe 2">Equipe 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="type">
              Type
            </label>
            <select
              id="type"
              name="type"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              defaultValue="Championnat"
            >
              <option value="Championnat">Championnat</option>
              <option value="Coupe">Coupe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="adversaire">
              Club rencontre
            </label>
            <input
              id="adversaire"
              name="adversaire"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="lieu">
              Lieu
            </label>
            <input
              id="lieu"
              name="lieu"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <button className="button-primary md:col-span-5" type="submit">
            Ajouter la rencontre
          </button>
        </form>

        <div className="mt-6 grid gap-4">
          {rencontres.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune rencontre enregistree.</p>
          ) : (
            rencontres.map((rencontre) => (
              <div key={rencontre.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <form action={mettreAJourRencontre} className="grid gap-3 md:grid-cols-6">
                  <input type="hidden" name="id" value={rencontre.id} />
                  <select
                    name="equipe"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    defaultValue={rencontre.equipe}
                  >
                    <option value="Equipe 1">Equipe 1</option>
                    <option value="Equipe 2">Equipe 2</option>
                  </select>
                  <select
                    name="type"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    defaultValue={rencontre.type}
                  >
                    <option value="Championnat">Championnat</option>
                    <option value="Coupe">Coupe</option>
                  </select>
                  <input
                    name="date"
                    type="date"
                    defaultValue={rencontre.date}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    name="adversaire"
                    defaultValue={rencontre.adversaire}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    name="lieu"
                    defaultValue={rencontre.lieu}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button className="button-primary" type="submit">
                      Mettre a jour
                    </button>
                    <button
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600"
                      type="submit"
                      formAction={supprimerRencontre}
                    >
                      Supprimer
                    </button>
                  </div>
                </form>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
