import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/AuthForms";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function ConnexionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  if (await getCurrentUser()) redirect(next && next.startsWith("/") ? next : "/app");
  return (
    <AuthShell
      title="Connexion"
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-brand underline-offset-4 hover:underline">
            Créer mon espace
          </Link>
        </>
      }
    >
      <SignInForm next={next} />
    </AuthShell>
  );
}
