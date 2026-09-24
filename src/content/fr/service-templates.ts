/**
 * Prestations types proposées à l'onboarding, par activité. Durées et prix
 * indicatifs, modifiables ensuite. Aucune source externe : Google ne fournit
 * pas les prestations d'un établissement.
 */
export interface ServiceTemplate {
  key: string;
  name: string;
  durationMin: number;
  price: number;
  description?: string;
}

export const serviceTemplates: Record<string, ServiceTemplate[]> = {
  coiffure_barbier: [
    { key: "coupe-homme", name: "Coupe homme", durationMin: 30, price: 25, description: "Shampoing et coiffage inclus." },
    { key: "coupe-barbe", name: "Coupe + barbe", durationMin: 45, price: 35 },
    { key: "barbe", name: "Taille de barbe", durationMin: 20, price: 15 },
    { key: "coupe-enfant", name: "Coupe enfant (-12 ans)", durationMin: 30, price: 18 },
    { key: "coupe-femme", name: "Coupe femme", durationMin: 45, price: 40, description: "Shampoing, coupe et brushing." },
    { key: "coloration", name: "Coloration", durationMin: 90, price: 65 },
    { key: "brushing", name: "Brushing", durationMin: 30, price: 25 },
  ],
  institut: [
    { key: "soin-visage", name: "Soin du visage", durationMin: 60, price: 60 },
    { key: "epilation-sourcils", name: "Épilation sourcils", durationMin: 15, price: 12 },
    { key: "epilation-jambes", name: "Épilation demi-jambes", durationMin: 30, price: 25 },
    { key: "epilation-maillot", name: "Épilation maillot", durationMin: 20, price: 20 },
    { key: "manucure", name: "Manucure", durationMin: 45, price: 30 },
    { key: "modelage", name: "Modelage relaxant", durationMin: 60, price: 65 },
  ],
  onglerie: [
    { key: "pose-gel", name: "Pose gel complète", durationMin: 90, price: 55 },
    { key: "remplissage", name: "Remplissage gel", durationMin: 75, price: 45 },
    { key: "semi-permanent", name: "Vernis semi-permanent", durationMin: 45, price: 30 },
    { key: "depose", name: "Dépose", durationMin: 30, price: 15 },
    { key: "manucure", name: "Manucure classique", durationMin: 40, price: 25 },
    { key: "pedicure", name: "Beauté des pieds", durationMin: 45, price: 35 },
  ],
  regard_cils: [
    { key: "cils-cil-a-cil", name: "Extension de cils cil à cil", durationMin: 90, price: 70 },
    { key: "cils-volume", name: "Extension de cils volume russe", durationMin: 120, price: 90 },
    { key: "remplissage-cils", name: "Remplissage cils", durationMin: 60, price: 45 },
    { key: "rehaussement", name: "Rehaussement de cils", durationMin: 60, price: 55 },
    { key: "brow-lift", name: "Brow lift", durationMin: 45, price: 45 },
    { key: "teinture-sourcils", name: "Teinture sourcils", durationMin: 20, price: 15 },
  ],
  spa_soins: [
    { key: "massage-60", name: "Massage relaxant 60 min", durationMin: 60, price: 70 },
    { key: "massage-90", name: "Massage relaxant 90 min", durationMin: 90, price: 95 },
    { key: "soin-corps", name: "Gommage corps", durationMin: 45, price: 50 },
    { key: "soin-visage", name: "Soin du visage", durationMin: 60, price: 65 },
    { key: "hammam", name: "Accès hammam", durationMin: 60, price: 25 },
  ],
  autre: [
    { key: "prestation-30", name: "Prestation 30 min", durationMin: 30, price: 30 },
    { key: "prestation-60", name: "Prestation 1 h", durationMin: 60, price: 50 },
  ],
};

export function templatesFor(businessType: string): ServiceTemplate[] {
  return serviceTemplates[businessType] ?? serviceTemplates.autre;
}
