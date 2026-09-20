"use client";

import { useActionState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { FormStateProvider, type FormState } from "./FormContext";

export type { FormState } from "./FormContext";
export type FormAction = (
  prev: FormState,
  formData: FormData,
) => Promise<FormState>;

type ActionFormProps = {
  action: FormAction;
  /** Contenu du formulaire. Les champs de `Fields` lisent leurs erreurs via le contexte. */
  children: ReactNode | ((state: FormState) => ReactNode);
  submitLabel: string;
  pendingLabel?: string;
  className?: string;
  /** Contenu à droite du bouton (lien d'annulation, action secondaire). */
  aside?: ReactNode;
  variant?: "primary" | "secondary";
};

/** Formulaire branché sur une action serveur, avec état de chargement et messages. */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  className,
  aside,
  variant = "primary",
}: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form
      action={formAction}
      className={className ?? "flex flex-col gap-5"}
      noValidate
    >
      <FormStateProvider value={state}>
        {typeof children === "function" ? children(state) : children}
      </FormStateProvider>
      <div aria-live="polite" role="status">
        {state?.error ? (
          <StatusMessage tone="error">{state.error}</StatusMessage>
        ) : null}
        {state?.success ? (
          <StatusMessage tone="success">{state.success}</StatusMessage>
        ) : null}
        {state?.fieldErrors &&
        Object.keys(state.fieldErrors).length > 0 &&
        !state.error ? (
          <StatusMessage tone="error">
            <ul className="list-disc pl-4">
              {Object.values(state.fieldErrors).map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </StatusMessage>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant={variant}
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? (pendingLabel ?? "Enregistrement…") : submitLabel}
        </Button>
        {aside}
      </div>
    </form>
  );
}
