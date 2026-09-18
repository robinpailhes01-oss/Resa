import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SimplePage } from "@/components/pages/SimplePage";
import { offer } from "@/config/offer";
import { peekConfirmToken } from "@/server/waitlist/service";

export const metadata: Metadata = {
  title: "Confirmer mon inscription",
  robots: { index: false, follow: false },
};

/**
 * GET : affiche un écran avec un bouton ; le POST (route /api/waitlist/confirm)
 * consomme le jeton. Un scanner de liens ne peut donc pas confirmer à la
 * place de la personne (§10).
 */
export default async function ConfirmerInscriptionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const etat = typeof params.etat === "string" ? params.etat : "";

  if (etat === "confirme") {
    return (
      <SimplePage title="Inscription confirmée" width="narrow">
        <StatusMessage tone="success">
          Votre inscription est confirmée. Nous vous préviendrons à l’ouverture de {offer.brandName}.
        </StatusMessage>
        <Button href="/" variant="secondary" className="mt-8">
          Retour à l’accueil
        </Button>
      </SimplePage>
    );
  }

  if (etat === "expire") {
    return (
      <SimplePage title="Lien expiré" width="narrow">
        <StatusMessage tone="error">Ce lien a expiré. Demandez un nouvel email de confirmation.</StatusMessage>
        <Button href="/#inscription" className="mt-8">
          Demander un nouvel email
        </Button>
      </SimplePage>
    );
  }

  if (etat === "erreur" || etat === "limite") {
    return (
      <SimplePage title="Confirmation impossible pour le moment" width="narrow">
        <StatusMessage tone="error">
          {etat === "limite"
            ? "Trop de tentatives. Merci de réessayer un peu plus tard."
            : "Votre confirmation n’a pas pu être enregistrée. Réessayez dans quelques instants depuis le lien reçu par email."}
        </StatusMessage>
        <Button href="/" variant="secondary" className="mt-8">
          Retour à l’accueil
        </Button>
      </SimplePage>
    );
  }

  let status: Awaited<ReturnType<typeof peekConfirmToken>> = "invalid";
  if (token && etat !== "invalide") {
    try {
      status = await peekConfirmToken(token);
    } catch (error) {
      console.error("[waitlist] lecture du jeton échouée", error instanceof Error ? error.message : "erreur inconnue");
      return (
        <SimplePage title="Confirmation impossible pour le moment" width="narrow">
          <StatusMessage tone="error">Le service est momentanément indisponible. Réessayez dans quelques instants.</StatusMessage>
        </SimplePage>
      );
    }
  }

  if (status === "valid") {
    return (
      <SimplePage
        title="Confirmez votre inscription"
        intro={`Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et être informé de l’ouverture de ${offer.brandName}.`}
        width="narrow"
      >
        <form method="post" action="/api/waitlist/confirm">
          <input type="hidden" name="token" value={token} />
          <Button type="submit">Confirmer mon inscription</Button>
        </form>
      </SimplePage>
    );
  }

  if (status === "already_confirmed") {
    return (
      <SimplePage title="Inscription confirmée" width="narrow">
        <StatusMessage tone="success">Cette inscription est déjà confirmée. Nous vous préviendrons à l’ouverture de {offer.brandName}.</StatusMessage>
        <Button href="/" variant="secondary" className="mt-8">
          Retour à l’accueil
        </Button>
      </SimplePage>
    );
  }

  if (status === "expired") {
    return (
      <SimplePage title="Lien expiré" width="narrow">
        <StatusMessage tone="error">Ce lien a expiré. Demandez un nouvel email de confirmation.</StatusMessage>
        <Button href="/#inscription" className="mt-8">
          Demander un nouvel email
        </Button>
      </SimplePage>
    );
  }

  return (
    <SimplePage title="Lien invalide" width="narrow">
      <StatusMessage tone="error">
        Ce lien de confirmation n’est pas valide. Vous pouvez demander un nouvel email depuis la page d’accueil.
      </StatusMessage>
      <Button href="/#inscription" className="mt-8">
        Demander un nouvel email
      </Button>
    </SimplePage>
  );
}
