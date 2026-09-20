"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { requestPasswordReset, resetPassword, signIn, signUp, type AuthState } from "@/server/auth/actions";

function FormStatus({ state }: { state: AuthState }) {
  if (!state) return null;
  return (
    <div aria-live="polite" role="status">
      {state.error ? <StatusMessage tone="error">{state.error}</StatusMessage> : null}
      {state.success ? <StatusMessage tone="success">{state.success}</StatusMessage> : null}
    </div>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, null);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Input id="fullName" name="fullName" label="Votre nom" autoComplete="name" required error={state?.fieldErrors?.fullName} />
      <Input id="email" name="email" type="email" label="Email professionnel" autoComplete="email" inputMode="email" required error={state?.fieldErrors?.email} />
      <Input
        id="password"
        name="password"
        type="password"
        label="Mot de passe"
        autoComplete="new-password"
        minLength={8}
        required
        help="8 caractères minimum."
        error={state?.fieldErrors?.password}
      />
      <FormStatus state={state} />
      <Button type="submit" disabled={pending} aria-busy={pending} fullWidth className="mt-2">
        {pending ? "Création du compte…" : "Créer mon compte"}
      </Button>
      <p className="text-[13px] leading-5 text-ink-muted">
        En créant un compte, vous acceptez que vos données soient traitées pour faire fonctionner votre espace.{" "}
        <Link href="/confidentialite" className="font-medium text-brand underline underline-offset-4">
          En savoir plus
        </Link>
        .
      </p>
    </form>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Input id="email" name="email" type="email" label="Email" autoComplete="email" inputMode="email" required />
      <Input id="password" name="password" type="password" label="Mot de passe" autoComplete="current-password" required />
      <div className="-mt-1 text-right text-[14px]">
        <Link href="/mot-de-passe-oublie" className="font-medium text-brand underline-offset-4 hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>
      <FormStatus state={state} />
      <Button type="submit" disabled={pending} aria-busy={pending} fullWidth>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Input id="email" name="email" type="email" label="Email" autoComplete="email" inputMode="email" required error={state?.fieldErrors?.email} />
      <FormStatus state={state} />
      <Button type="submit" disabled={pending || Boolean(state?.success)} aria-busy={pending} fullWidth>
        {pending ? "Envoi…" : "Recevoir un lien"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, null);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <Input
        id="password"
        name="password"
        type="password"
        label="Nouveau mot de passe"
        autoComplete="new-password"
        minLength={8}
        required
        help="8 caractères minimum."
        error={state?.fieldErrors?.password}
      />
      <FormStatus state={state} />
      <Button type="submit" disabled={pending} aria-busy={pending} fullWidth>
        {pending ? "Enregistrement…" : "Enregistrer et me connecter"}
      </Button>
    </form>
  );
}
