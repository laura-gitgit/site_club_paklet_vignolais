import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getAllPlayers } from "@/lib/clubData";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function addJoueur(formData: FormData) {
  "use server";
  const prenom = String(formData.get("prenom") ?? "").trim();

  if (!prenom) {
    redirect("/gestion/joueurs?error=prenom");
  }

  const { error } = await supabase.from("joueurs").insert({
    nom: prenom,
    prenom,
  });

  if (error) {
    console.error("Supabase insert joueur failed", error);
    redirect("/gestion/joueurs?error=insert");
  }

  revalidatePath("/gestion/joueurs");
  redirect("/gestion/joueurs?success=added");
}

async function toggleJoueur(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));

  const { data, error } = await supabase
    .from("joueurs")
    .select("actif")
    .eq("id", id)
    .single();

  if (error || !data) {
    redirect("/gestion/joueurs?error=toggle");
  }

  const { error: updateError } = await supabase
    .from("joueurs")
    .update({ actif: !data.actif })
    .eq("id", id);

  if (updateError) {
    redirect("/gestion/joueurs?error=toggle");
  }

  revalidatePath("/gestion/joueurs");
  redirect("/gestion/joueurs?success=updated");
}

async function deleteJoueur(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));

  const { error } = await supabase.from("joueurs").delete().eq("id", id);

  if (error) {
    redirect("/gestion/joueurs?error=delete");
  }

  revalidatePath("/gestion/joueurs");
  redirect("/gestion/joueurs?success=deleted");
}

export default async function GestionJoueursPage({ searchParams }: PageProps) {
  const joueurs = await getAllPlayers();
  const resolvedSearchParams = await searchParams;
  const success = resolvedSearchParams?.success;
  const error = resolvedSearchParams?.error;

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Gestion des joueurs</h1>
        <p className="mt-2 text-lg text-slate-600">
          Ajoutez, modifiez ou supprimez les joueurs du club.
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
        <h2 className="text-2xl font-semibold text-blue-900">Ajouter un joueur</h2>
        <form action={addJoueur} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="prenom">
              Prenom *
            </label>
            <input
              id="prenom"
              name="prenom"
              required
              placeholder="Jean"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>
          <button className="button-primary md:col-span-2" type="submit">
            Ajouter
          </button>
        </form>
      </section>

      <section className="card overflow-hidden">
        <h2 className="px-6 py-4 text-2xl font-semibold text-blue-900">
          Liste des joueurs ({joueurs.length})
        </h2>
        {joueurs.length === 0 ? (
          <p className="px-6 py-4 text-slate-500">
            Aucun joueur pour le moment. Commencez par en ajouter un.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3">Prenom</th>
                  <th className="px-6 py-3 text-center">Statut</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {joueurs.map((joueur) => (
                  <tr key={joueur.id} className="border-b last:border-b-0">
                    <td className="px-6 py-3 font-semibold text-slate-700">
                      {joueur.prenom ?? joueur.nom}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          joueur.actif
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {joueur.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <form action={toggleJoueur} className="inline">
                        <input type="hidden" name="id" value={joueur.id} />
                        <button className="text-sm font-semibold text-blue-900 hover:underline" type="submit">
                          {joueur.actif ? "Desactiver" : "Activer"}
                        </button>
                      </form>
                      <form action={deleteJoueur} className="ml-4 inline">
                        <input type="hidden" name="id" value={joueur.id} />
                        <button className="text-sm font-semibold text-red-600 hover:underline" type="submit">
                          Supprimer
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
