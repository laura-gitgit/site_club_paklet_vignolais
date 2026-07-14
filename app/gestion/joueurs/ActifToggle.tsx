"use client";

import { useTransition } from "react";

type ActifToggleProps = {
  joueurId: number;
  initialActif: boolean;
  toggleActif: (formData: FormData) => Promise<void>;
};

export function ActifToggle({ joueurId, initialActif, toggleActif }: ActifToggleProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const form = event.currentTarget.form;
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    startTransition(() => {
      void toggleActif(formData);
    });
  }

  return (
    <input
      type="checkbox"
      name="actif"
      defaultChecked={initialActif}
      disabled={isPending}
      onChange={handleChange}
      className="h-5 w-5 accent-blue-900"
    />
  );
}
