"use client";

import type { FormHTMLAttributes } from "react";

type ResetTournoiFormProps = {
  action: FormHTMLAttributes<HTMLFormElement>["action"];
};

export default function ResetTournoiForm({ action }: ResetTournoiFormProps) {
  return (
    <form
      action={action}
      className="mt-4"
      onSubmit={(event) => {
        if (!window.confirm("Cette action est irreversible. Reinitialiser le tournoi ?")) {
          event.preventDefault();
        }
      }}
    >
      <button className="button-muted" type="submit">
        Reinitialiser le tournoi
      </button>
    </form>
  );
}
