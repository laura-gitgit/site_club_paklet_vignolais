import { Suspense } from "react";
import LoginForm from "./LoginForm";


export const dynamic = "force-dynamic";

export default function GestionLoginPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-4xl font-semibold text-blue-900">Connexion admin</h1>
        <p className="mt-2 text-lg text-slate-600">
          Connectez-vous pour acceder a la gestion.
        </p>
      </header>

      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
