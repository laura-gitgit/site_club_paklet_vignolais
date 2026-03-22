"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser"; 

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      className="button-muted"
      type="button"
      disabled={isLoading}
      onClick={async () => {
        setIsLoading(true);
        await supabaseBrowser.auth.signOut();
        router.push("/gestion/login");
        router.refresh();
      }}
    >
      Se deconnecter
    </button>
  );
}