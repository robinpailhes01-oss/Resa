import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SimplePage } from "@/components/pages/SimplePage";
import { offer } from "@/config/offer";
import { peekUnsubscribeToken } from "@/server/waitlist/service";

export const metadata: Metadata = {
  title: "Retirer mon inscription",
  robots: { index: false, follow: false },
};

/** Désinscription par jeton distinct, sans compte (§10, §16). */
export default async function DesinscriptionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const etat = typeof params.etat === "string" ? params.etat : "";

  if (etat === "retire") {
    return (
      <SimplePage title="Inscription retirée" width="narrow">
        <StatusMessage tone="success">
          Votre inscription est retirée. Vous ne recevrez plus de notification de {offer.brandName}.
        </StatusMessage>
        <Button href="/" variant="secondary" className="mt-8">
          Retour à l’accueil
        </Button>
      </SimplePage>
    );
  }

  if (etat === "erreur" || etat === "limite") {
    return (
      <SimplePage title="Retrait impossible pour le moment" width="narrow">
        <StatusMessage tone="error">
          {etat === "limite"
            ? "Trop de tentatives. Merci de réessayer un peu plus tard."
            : "Votre demande n’a pas pu être enregistrée. Réessayez dans quelques instants."}
        </StatusMessage>
      </SimplePage>
    );
  }

  let valid = false;
  if (token && etat !== "invalide") {
    try {
      valid = (await peekUnsubscribeToken(token)) === "valid";
    } catch (error) {
      console.error("[waitlist] lecture du jeton échouée", error instanceof Error ? error.message : "erreur inconnue");
      return (
        <SimplePage title="Retrait impossible pour le moment" width="narrow">
          <StatusMessage tone="error">Le service est momentanément indisponible. Réessayez dans quelques instants.</StatusMessage>
        </SimplePage>
      );
    }
  }

  if (valid) {
    return (
      <SimplePage
        title="Retirer mon inscription"
        intro={`Confirmez pour ne plus recevoir de notification de ${offer.brandName}. Aucun compte n’est nécessaire.`}
        width="narrow"
      >
        <form method="post" action="/api/waitlist/unsubscribe">
          <input type="hidden" name="token" value={token} />
          <Button type="submit">Retirer mon inscription</Button>
        </form>
      </SimplePage>
    );
  }

  return (
    <SimplePage title="Lien invalide" width="narrow">
      <StatusMessage tone="error">
        Ce lien de retrait n’est pas valide. Utilisez le lien présent dans l’un de nos emails
        {offer.supportEmail ? (
          <>
            {" "}
            ou écrivez-nous à <a className="underline underline-offset-4" href={`mailto:${offer.supportEmail}`}>{offer.supportEmail}</a>
          </>
        ) : null}
        .
      </StatusMessage>
    </SimplePage>
  );
}
