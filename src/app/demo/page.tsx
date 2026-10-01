import type { Metadata } from "next";
import { ProDemo } from "@/components/demo/ProDemo";
import { setupCall } from "@/content/fr/landing";
import { byMode, cta } from "@/content/fr/landing";
import { teamContactHref } from "@/lib/contact";
import { addDaysToDateKey, formatDateKeyLong, todayDateKey } from "@/lib/time";

export const metadata: Metadata = {
  title: "Démo de l’espace pro",
  description: "Cliquez dans l’espace pro Reso avec des données d’exemple : agenda, clients, prestations, paiements.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

/** Démo cliquable de l'espace pro (données d'exemple, rien n'est enregistré). */
export default function DemoPage() {
  const today = todayDateKey("Europe/Paris");
  const days = [-1, 0, 1, 2, 3, 4, 5, 6].map((offset) => ({ offset, label: formatDateKeyLong(addDaysToDateKey(today, offset), false) }));
  return <ProDemo days={days} signupHref={byMode(cta.primary).href} contactHref={teamContactHref(setupCall.whatsappMessage, setupCall.emailSubject)} />;
}
