# 14 — Pub Ludivine « ce message est pour toi » (9:16, ~42 s)

Rushs : 16 prises de Ludivine (Google Drive, 720×1280), téléchargées dans `media/rushes/r01…r16.mov` (non versionnés). Prises retenues et ordre : `cuts.txt` → `media/face.mp4`.

Prix : « 29 € par mois » (dit par Ludivine), validé par Robin. ⚠️ `src/config/offer.ts` affiche encore 39 € HT par défaut (`RESO_MONTHLY_PRICE_EX_VAT`) : à aligner sur le site. La capture des emails démarre à 1,6 s pour masquer le bandeau « 39 € HT/mois » de l'essai.

## Texte dit

1. Coiffeur ou coiffeuse, barbier, esthéticienne, ce message est pour toi.
2. Tu bosses dans la beauté et tu prends encore tes rendez-vous par DM ?
3. 22 h 15, tu réponds toujours à tes clientes.
4. Ou alors tu payes un logiciel bien trop cher.
5. Il y a beaucoup plus simple.
6. Reso, c'est tes rendez-vous sans décrocher.
7. Tu colles le lien de ta fiche Google et ta page de réservation se crée avec tes photos, tes horaires et ton adresse.
8. Tu partages ton lien, ta cliente choisit son créneau et c'est réservé.
9. Et même à 23 h.
10. Les rappels et les avis Google partent sans toi.
11. Tout ça pour 29 € par mois.
12. Tu veux essayer ? Essaie gratuitement, écris-moi « Reso » en message.

## Images

Face caméra (accroche, problème, CTA) ; carte « Tes rendez-vous, sans décrocher. » ; import de la fiche Google et partage du lien → réservation (extraits du rendu de `11-reel-google`, dans `media/app/`) ; page publique, emails automatiques (bibliothèque `_bibliotheque/media/app`) ; carte prix ; signature reso®.

Générer : `node .claude/skills/reso-facecam-app/scripts/build-montage.mjs videos/14-ads-ludivine`.
