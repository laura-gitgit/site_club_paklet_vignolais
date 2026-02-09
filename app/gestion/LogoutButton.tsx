"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
        const supabase = createClientComponentClient();
        await supabase.auth.signOut();
        router.push("/gestion/login");
        router.refresh();
      }}
    >
      Se deconnecter
    </button>
  );
}
