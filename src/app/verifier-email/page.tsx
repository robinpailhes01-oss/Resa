import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SimplePage } from "@/components/pages/SimplePage";
import { verifyEmailToken } from "@/server/auth/actions";

export const metadata: Metadata = { title: "Vérification de l’email", robots: { index: false, follow: false } };

export default async function VerifierEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  let result: "ok" | "invalid" = "invalid";
  try {
    result = token ? await verifyEmailToken(token) : "invalid";
  } catch {
    result = "invalid";
  }
  return (
    <SimplePage title={result === "ok" ? "Adresse confirmée" : "Lien invalide"} width="narrow">
      {result === "ok" ? (
        <StatusMessage tone="success">Votre adresse email est confirmée. Merci.</StatusMessage>
      ) : (
        <StatusMessage tone="error">Ce lien a expiré ou a déjà été utilisé. Vous pourrez en redemander un depuis vos paramètres.</StatusMessage>
      )}
      <Button href="/app" className="mt-8">
        Aller à mon espace
      </Button>
    </SimplePage>
  );
}
