import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { StatusMessage } from "@/components/ui/StatusMessage";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default async function ReinitialiserPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return (
    <AuthShell
      title="Nouveau mot de passe"
      footer={
        <Link href="/connexion" className="font-medium text-brand underline-offset-4 hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <StatusMessage tone="error">
          Ce lien n’est pas valide.{" "}
          <Link href="/mot-de-passe-oublie" className="underline underline-offset-4">
            Demander un nouvel email
          </Link>
          .
        </StatusMessage>
      )}
    </AuthShell>
  );
}
