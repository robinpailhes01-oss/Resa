import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SimplePage } from "@/components/pages/SimplePage";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <SimplePage title="Page introuvable" intro="La page demandée n’existe pas ou a été déplacée." width="narrow">
      <Button href="/">Retour à l’accueil</Button>
    </SimplePage>
  );
}
