import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/AuthForms";
import { offer } from "@/config/offer";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Créer mon compte", robots: { index: false } };

export default async function InscriptionPage() {
  if (await getCurrentUser()) redirect("/app");
  return (
    <AuthShell
      title="Créez votre espace"
      intro={
        offer.trialDays
          ? `${offer.trialDays} jours d’essai gratuit, sans carte bancaire. Quelques minutes suffisent pour ouvrir votre agenda ${offer.brandName} et partager votre lien de réservation.`
          : `Quelques minutes suffisent pour ouvrir votre agenda ${offer.brandName} et partager votre lien de réservation.`
      }
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-medium text-brand underline-offset-4 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
