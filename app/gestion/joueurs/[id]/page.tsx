import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  params: { id: string };
};

async function updateJoueur(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const prenom = String(formData.get("prenom") ?? "").trim();
  const nom = String(formData.get("nom") ?? "").trim();
  const licence = String(formData.get("licence") ?? "").trim();
  const actif = formData.get("actif") ? true : false;

  if (!prenom || !nom) {
    redirect(`/gestion/joueurs?error=prenom`);
  }

  const { error } = await supabase
    .from("joueurs")
    .update({ prenom, nom, licence: licence || null, actif })
    .eq("id", id);

  if (error) {
    console.error("Supabase update joueur failed", error);
    redirect(`/gestion/joueurs?error=update`);
  }

  revalidatePath("/gestion/joueurs");
  redirect(`/gestion/joueurs?success=updated`);
}

export default async function EditJoueurPage({ params }: Props) {
  const id = Number(params.id);

  const { data, error } = await supabase
    .from("joueurs")
    .select("id, prenom, nom, licence, actif")
    .eq("id", id)
    .single();

  if (error || !data) {
    redirect(`/gestion/joueurs?error=notfound`);
  }

  const joueur = data as {
    id: number;
    prenom?: string | null;
    nom?: string | null;
    licence?: string | null;
    actif?: boolean;
  };

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-3xl font-semibold text-blue-900">Modifier un joueur</h1>
      </header>

      <section className="card">
        <form action={updateJoueur} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={joueur.id} />

          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="prenom">
              Prenom *
            </label>
            <input
              id="prenom"
              name="prenom"
              required
              defaultValue={joueur.prenom ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="nom">
              Nom *
            </label>
            <input
              id="nom"
              name="nom"
              required
              defaultValue={joueur.nom ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="licence">
              Licence
            </label>
            <input
              id="licence"
              name="licence"
              defaultValue={joueur.licence ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="actif">
              Actif
            </label>
            <input id="actif" name="actif" type="checkbox" defaultChecked={!!joueur.actif} className="h-5 w-5 accent-blue-900" />
          </div>

          <div className="md:col-span-2">
            <button className="button-primary" type="submit">Enregistrer</button>
          </div>
        </form>
      </section>
    </div>
  );
}
