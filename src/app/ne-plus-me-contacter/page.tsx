import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { SimplePage } from "@/components/pages/SimplePage";
import { prospectionContent } from "@/content/fr/prospection";
import { peekProspectToken } from "@/server/prospection";
import { unsubscribeProspectAction } from "@/server/prospection/actions";

export const metadata: Metadata = {
  title: "Ne plus recevoir d’emails",
  robots: { index: false, follow: false },
};

const t = prospectionContent.unsubscribePage;

/** Désinscription des emails de prospection : un clic, sans compte ni saisie. */
export default async function NePlusMeContacterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const etat = typeof params.etat === "string" ? params.etat : "";

  if (etat === "ok") {
    return (
      <SimplePage title={t.doneTitle} width="narrow">
        <StatusMessage tone="success">{t.done}</StatusMessage>
        <Button href="/" variant="secondary" className="mt-8">
          Retour à l’accueil
        </Button>
      </SimplePage>
    );
  }
  if (etat === "erreur") {
    return (
      <SimplePage title="Demande impossible pour le moment" width="narrow">
        <StatusMessage tone="error">Votre demande n’a pas pu être enregistrée. Réessayez dans quelques instants ou répondez à l’email reçu.</StatusMessage>
      </SimplePage>
    );
  }
  const valid = etat !== "invalide" && token ? await peekProspectToken(token).catch(() => false) : false;
  if (!valid) {
    return (
      <SimplePage title={t.invalidTitle} width="narrow">
        <StatusMessage tone="error">{t.invalid}</StatusMessage>
      </SimplePage>
    );
  }
  return (
    <SimplePage title={t.title} intro={t.intro} width="narrow">
      <form action={unsubscribeProspectAction}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit">{t.button}</Button>
      </form>
    </SimplePage>
  );
}
