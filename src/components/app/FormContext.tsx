"use client";

import { createContext, useContext } from "react";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
} | null;

const FormStateContext = createContext<FormState>(null);

export const FormStateProvider = FormStateContext.Provider;

/** Erreur de validation du champ courant, fournie par le formulaire parent. */
export function useFieldError(name: string | undefined): string | undefined {
  const state = useContext(FormStateContext);
  if (!name || !state?.fieldErrors) return undefined;
  return state.fieldErrors[name];
}

/** Affiche l'erreur d'un champ nommé, si le formulaire parent en a une. */
export function FieldError({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const error = useFieldError(name);
  if (!error) return null;
  return (
    <span className={className ?? "text-small font-medium text-error"}>
      {error}
    </span>
  );
}
