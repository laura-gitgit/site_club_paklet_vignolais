import Image from "next/image";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
import { createClient } from "@/lib/server"; // <- nouveau import
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
  const supabase = await createClient(); // <- au lieu de createServerActionClient({ cookies })

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
    .upsert(
      { key, path, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) {
    redirect("/gestion/classement?error=upload");
  }

  revalidatePath("/classement");
  revalidatePath("/gestion/classement");
  redirect("/gestion/classement?success=upload");
}

async function ajouterRencontre(formData: FormData) {
  "use server";
  const supabase = await createClient(); // <- idem

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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

// le reste de ton composant ne change pas
export default async function GestionClassementPage({ searchParams }: PageProps) {
  const [rencontres, assets] = await Promise.all([
    getRencontres(),
    getClassementAssets(),
  ]);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const success = resolvedSearchParams?.success;
  const error = resolvedSearchParams?.error;

  // ...
}
