---
name: reso-rapport-test
description: Rapport d'un test publicitaire RESO à partir des chiffres Meta (export ou capture) et du tunnel RESO. À utiliser quand Robin envoie des statistiques, demande « où on en est », ou à chaque point d'étape d'un test T-XXX. Produit dépenses, inscriptions, activés, payants, diagnostic, niveau de confiance et une seule prochaine action, puis met à jour le journal.
---

# Rapport de test RESO

## 1. Charger le contexte

Lire dans cet ordre : `ads/pilotage/regles.md`, `ads/pilotage/definitions.md`, `ads/pilotage/budget.md`,
`ads/pilotage/journal.md` (fiche du test concerné et rapports précédents).

## 2. Rassembler les chiffres

| Source | Quoi | Comment |
|---|---|---|
| Meta | dépense, impressions, vues 3 s, clics lien, vues de page de destination, conversations, leads, par pub | export CSV ou capture envoyé par Robin |
| RESO | visites, inscriptions, onboardings, pages publiées, 1res réservations, abonnements payés, par `utm_campaign` / `utm_content` | page admin « Tunnel » (quand elle existe), sinon chiffres donnés par Robin ou alertes Telegram |
| Leads DM | conversations qualifiées, rendez-vous de setting | fiche de suivi de Robin |

S'il manque une source, le dire et la nommer ; ne jamais estimer un chiffre manquant comme s'il était mesuré.
Abonnements : uniquement `payments` payés. `booking_payments` = usage, jamais conversion.

## 3. Contrôles

- Dépense cumulée ≤ plafond de `budget.md` ? Sinon : alerte en tête du rapport.
- Volume suffisant ? Appliquer les seuils de `regles.md` §3 et attribuer un niveau :
  **signal faible**, **tendance** ou **fiable**.
- Écart entre Meta et RESO (ex. Meta compte 12 inscriptions, RESO 7) : le signaler, ne pas trancher au hasard.

## 4. Écrire le rapport (toujours ce format)

```
RAPPORT T-XXX · <date> · jour N/M du test

Dépensé        : X € sur Y € validés (reste Z €)
Vu / cliqué    : impressions · taux d'arrêt · taux de clic  (une phrase d'explication chacun)
Leads          : inscriptions site · conversations qualifiées DM
Activés        : pages publiées · 1res réservations
Payants        : abonnements RESO payés · coût par client (ou « pas encore calculable »)

Par cellule    : tableau A / B avec les mêmes lignes
Maillon faible : <étape> — pourquoi, en 2 phrases
Confiance      : signal faible | tendance | fiable — pourquoi
Comparaison    : avec le rapport précédent / le test précédent

PROCHAINE ACTION RECOMMANDÉE (attend ton accord) :
<une seule action, concrète, avec son coût éventuel>
```

Phrases courtes, sans jargon non traduit. Ne jamais recommander une hausse de budget sans
justification chiffrée et sans la présenter comme une demande d'accord.

## 5. Mettre à jour la mémoire

- `journal.md` : sous la fiche du test, ajouter « Rapport <date> » (chiffres clés, maillon, confiance).
  Si le test est terminé : statut « terminé », résultat, et un `E-XXX` dans Enseignements.
- `budget.md` : mettre à jour « Dépensé (cumul) » et « Restant ».
- Quand Robin valide ou refuse la prochaine action : ajouter une décision `D-XXX`.
