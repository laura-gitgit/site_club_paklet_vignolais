"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <section className="card">
      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsLoading(true);
          setError(null);

          const supabase = createClientComponentClient();
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            setError("Connexion impossible. Verifiez vos identifiants.");
            setIsLoading(false);
            return;
          }

          const next =
            typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("next") || "/gestion"
              : "/gestion";
          router.push(next);
          router.refresh();
        }}
      >
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button className="button-primary" type="submit" disabled={isLoading}>
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </section>
  );
}
