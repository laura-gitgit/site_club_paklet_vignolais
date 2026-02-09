import type { Metadata } from "next";
import { Cinzel, Source_Sans_3 } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Club de Palet Vignolais",
  description: "Site officiel du club de palet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${cinzel.variable} ${sourceSans.variable} antialiased`}>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6">
              <div className="flex items-center justify-center rounded-xl bg-slate-100 p-3">
                <Image
                  src="/images/logo.jpeg"
                  alt="Logo du club"
                  width={220}
                  height={140}
                  priority
                />
              </div>
              <nav className="rounded-full bg-blue-900 px-4 py-3 text-white shadow">
                <ul className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold uppercase tracking-wide">
                  <li>
                    <Link className="rounded-full px-4 py-2 transition hover:bg-blue-800" href="/">
                      Accueil
                    </Link>
                  </li>
                  <li>
                    <Link className="rounded-full px-4 py-2 transition hover:bg-blue-800" href="/evenements">
                      Evenements
                    </Link>
                  </li>
                  <li>
                    <Link className="rounded-full px-4 py-2 transition hover:bg-blue-800" href="/classement">
                      Classement
                    </Link>
                  </li>
                  <li>
                    <Link className="rounded-full px-4 py-2 transition hover:bg-blue-800" href="/tirage-au-sort">
                      Tirage au sort
                    </Link>
                  </li>
                  <li>
                    <Link className="rounded-full px-4 py-2 transition hover:bg-blue-800" href="/tournoi">
                      Tournoi interne 1vs1
                    </Link>
                  </li>
                  <li>
                    <Link className="rounded-full px-4 py-2 transition hover:bg-blue-800" href="/entrainements">
                      Entrainements
                    </Link>
                  </li>
                  <li>
                    <Link className="rounded-full px-4 py-2 transition hover:bg-blue-800" href="/gestion">
                      Gestion
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 py-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
