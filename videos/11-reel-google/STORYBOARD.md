---
format: 1080x1920
duration: 20s
message: "De votre fiche Google à votre agenda en quelques minutes."
arc: Hook → 1. fiche Google → 2. prestations → 3. lien partagé → nouveau rendez-vous → signature
audience: Professionnels indépendants de la beauté en France (Reel organique, Meta Ads, Reel épinglé)
mode: autonomous
music: none
voiceover: media/*.mp3 posées par mix.sh (voix « Céline », ElevenLabs, accélérée de 8 %)
---

Une seule idée : « Essayer Reso ne va pas me prendre des heures. » Trois hooks interchangeables (frames 00-hook-a/b/c, même durée, même sortie) devant un corps identique. Voix off et musique ajoutées au mixage (`mix.sh`), hors pipeline audio. Les temps de voix indiqués sont **locaux à la frame**.

## Video direction

Voir `frame.md` (charte « éditorial ivoire »). Résumé : fond ivoire très épuré + grain discret, interfaces Reso posées sur des socles pierre, panneau bleu poudré pour le hook et la signature, encre `#1F2733`, accents bleu ardoise `#4A6179`, touches chrome uniquement sur le cadre du téléphone et un reflet. Outfit (titres), Manrope (interfaces), JetBrains Mono (étiquettes « 01 / 02 / 03 »). Mouvements fluides `power3`/`expo`, zooms précis, perspective légère, aucune `back`/`elastic`. Une idée par plan, beaucoup d'air. Interdits : néons, violet, symbole IA, explosion de notifications, interface inventée, fonctionnalité absente de Reso (pas de logo importé). Zones sûres Reels : rien d'important hors y 200–1560 ; pas de texte dans x 930–1080 sous y 1000.

## Frame 1 — Hook (3 variantes)

- scene: Panneau poudré plein cadre ; la phrase d'accroche monte mot par mot, grande ; puis un champ (barre de recherche / URL) crème glisse en bas du titre, vide, caret qui clignote : c'est l'objet qui porte la transition vers la frame 2.
- duration: 3.4s
- transition_in: cut
- type: hook
- blueprint: kinetic-type-beats (Adapt)
- focal: titre d'accroche
- roles: aucun asset image (texte + champ HTML)
- asset_candidates: none
- status: animated
- src: compositions/frames/00-hook-a.html
- voiceover: variante A « Et si votre agenda en ligne était prêt en quelques minutes ? » (0.1s ; « agenda » 0.77s ; « quelques minutes » 2.4–3.35s) · variante B « Vous pensez qu'installer un logiciel de réservation prend des heures ? » (0.1s ; « logiciel » 1.24s ; « des heures » 2.57–3.06s) · variante C « Votre fiche Google, quelques minutes, et votre agenda est prêt. » (0.1s ; « fiche Google » 0.53–1.66s ; « quelques minutes » 1.66–2.69s ; « votre agenda est prêt » 2.79–3.84s)

Trois fichiers, même construction, seul le texte change :
- `00-hook-a.html` : « Et si votre agenda en ligne / était prêt en / quelques minutes ? » (mot-clé « quelques minutes » souligné d'un trait ardoise clair qui se trace).
- `00-hook-b.html` : « Vous pensez qu'installer / un logiciel de réservation / prend des heures ? » (« des heures » : léger barré crème qui se trace à 3.0s, sans le remplacer).
- `00-hook-c.html` : trois temps empilés « Votre fiche Google. » / « Quelques minutes. » / « Votre agenda est prêt. », chacun arrive sur son mot de voix.
Scene 1 (0.0–0.25s) : premier mot déjà en mouvement à la première image (arrête le scroll), grain + panneau poudré ; petite signature mono « reso » en haut à gauche (y≈230, crème 60 %).
Scene 2 (0.1–2.6s) : titre centré verticalement autour de y≈760, crème, Outfit 500 ~104px, mot par mot sur la voix (montée + défloutage, `power3.out`).
Scene 3 (2.4–3.4s) : le champ crème (pilule 920×116, icône lien à gauche, caret ardoise qui clignote, placeholder « Collez le lien de votre fiche Google » à 50 %) glisse depuis le bas et se pose à y≈1180 ; dans les 0.35 dernières secondes la caméra pousse vers le champ (handoff).
- handoff_out: champ pilule centré (540, 1180), 920×116, scale 1 → push vers la caméra.

## Frame 2 — 1. Collez votre fiche Google

- scene: Le champ du hook devient le vrai bloc d'onboarding Reso « Gagnez du temps : importez votre fiche Google » ; un lien Google Maps est collé, « Rechercher », la fiche « Maison Alba » apparaît, clic, et le formulaire « Bienvenue » se remplit tout seul (nom, activité, ville, adresse, téléphone) pendant que les 4 photos et la pastille « Fiche importée » arrivent.
- duration: 4.2s
- transition_in: zoom-through
- type: feature_showcase
- blueprint: prompt-type-submit-generate (Adapt)
- focal: bloc import Google (reproduction fidèle de `src/components/app/GoogleImport.tsx`)
- roles: photo-1..4 = supporting (vignettes qui arrivent une à une sous le formulaire, coins 18px) · app-parametres = background (très flou, 20 %, profondeur)
- asset_candidates: assets/photo-1.png, assets/photo-2.png, assets/photo-3.png, assets/photo-4.png, assets/app-parametres.png
- status: animated
- src: compositions/frames/01-google.html
- voiceover: « Collez simplement le lien de votre fiche Google. » (0.5s ; « lien » ≈1.6s ; « fiche Google » 2.24–3.0s)

Textes exacts de l'app : titre « Gagnez du temps : importez votre fiche Google », intro « Nom, adresse, téléphone, activité, horaires, présentation et photos sont récupérés depuis votre fiche Google. Vous pourrez tout ajuster ensuite. », bouton « Rechercher » (pilule encre), résultat (carte avec icône épingle) « Maison Alba » / « 12 rue de l'Aiguillerie, 34000 Montpellier », état appliqué (bandeau vert succès) « ✓ Fiche importée : Maison Alba · horaires d'ouverture récupérés · 4 photos ». Formulaire « Bienvenue, Camille » / « Créons votre établissement. Vous pourrez tout modifier ensuite dans les paramètres. », champs « Nom de l'établissement », « Activité », « Ville », « Adresse (facultatif) », « Téléphone (facultatif) ».
Scene 1 (0.0–0.6s) : arrivée en zoom-through : le champ du hook (pilule) se pose et devient le champ de recherche du bloc import, qui se compose autour (carte crème rayon 32px sur socle pierre, fond ivoire). Étiquette mono en haut « 01 — Collez votre fiche Google » (y≈260, ardoise).
Scene 2 (0.5–1.6s) : le lien « https://maps.app.goo.gl/MaisonAlba » se colle d'un coup (pas tapé : flash de sélection ardoise 15 % puis texte), petite étiquette « Collé » fugace ; curseur clique « Rechercher » (pression 0.96 → 1).
Scene 3 (1.6–2.5s) : la carte résultat « Maison Alba » glisse sous le champ ; le curseur la sélectionne ; le bloc se replie en bandeau vert « ✓ Fiche importée … ».
Scene 4 (2.4–4.2s) : la caméra recule doucement : le formulaire se remplit en cascade rapide (chaque champ : texte qui apparaît de gauche à droite en 0.18s, décalage 0.12s) — Maison Alba / Institut de beauté / Montpellier / 12 rue de l'Aiguillerie / 04 67 00 00 00 ; les 4 photos montent en rangée sous le formulaire, la première avec un reflet chrome qui balaie. Tenue courte.
- sfx: tick au clic, paper sur la pastille.

## Frame 3 — 2. Ajoutez vos prestations

- scene: La vraie liste « Démarrez avec des prestations types » de l'onboarding : trois prestations se cochent une à une, « Ajouter les prestations cochées », puis la vue « Équipe » avec les deux agendas Camille et Inès glisse en profondeur.
- duration: 3.6s
- transition_in: crossfade
- type: feature_showcase
- blueprint: grid-card-assemble (Adapt)
- focal: liste des prestations types (reproduction fidèle de l'onboarding, voir textes ci-dessous)
- roles: app-equipe = supporting (capture réelle de la page Équipe, recadrée sur les deux cartes Camille / Inès, posée en carte inclinée) · app-prestations = background (flou)
- asset_candidates: assets/app-equipe.png, assets/app-prestations.png
- status: animated
- src: compositions/frames/02-prestations.html
- voiceover: « Ajoutez vos prestations et vos disponibilités. » (0.2s ; « prestations » 0.89–1.48s ; « disponibilités » 2.0–2.98s)

Textes exacts (prestations types « institut » de `src/content/fr/service-templates.ts`) : titre « Démarrez avec des prestations types », sous-titre « Cochez celles que vous proposez : durées et prix indicatifs, modifiables ensuite en un clic. », lignes (case + nom + « durée · prix ») : « Soin du visage » 1 h · 60 € ; « Manucure » 45 min · 30 € ; « Épilation sourcils » 15 min · 12 € ; (non cochées, plus pâles) « Épilation demi-jambes » 30 min · 25 €, « Modelage relaxant » 1 h · 65 €. Bouton pilule encre « Ajouter les prestations cochées ». Disponibilités : ligne « Horaires · Lundi au vendredi 9 h 30 – 19 h · samedi 9 h 30 – 17 h » (texte réel de la page Paramètres de la démo).
Scene 1 (0.0–0.5s) : étiquette « 02 — Ajoutez vos prestations » ; la carte liste arrive (socle pierre).
Scene 2 (0.4–1.9s) : trois coches se posent l'une après l'autre (case ardoise remplie + coche blanche tracée, ligne qui s'éclaire en `#EEF2F6`), la première sur « prestations » (≈0.9s).
Scene 3 (1.8–2.6s) : clic sur « Ajouter les prestations cochées » ; la ligne « Horaires » apparaît sous la liste sur « disponibilités » (≈2.1s).
Scene 4 (2.5–3.6s) : la carte recule et pivote légèrement ; la capture réelle Équipe (cartes « Camille · Esthéticienne » et « Inès · Prothésiste ongulaire ») glisse devant, plus petite, comme deux agendas prêts. Tenue.
- sfx: tick à chaque coche.

## Frame 4 — 3. Partagez votre lien

- scene: Le lien « reso-app.fr/r/maison-alba » se copie (pilule) ; un smartphone premium (cadre chrome) arrive avec la vraie page de réservation de Maison Alba, et le parcours cliente défile vite : prestation → praticienne → créneau → confirmation.
- duration: 3.8s
- transition_in: crossfade
- type: product_demo
- blueprint: device-surface-showcase (Adapt)
- focal: téléphone avec la page publique réelle (assets/page-publique-mobile.png, 1170×2188)
- roles: page-publique-mobile = cutout (écran du téléphone, étape 1) · page-publique-mobile-long = supporting (même page plus longue pour un défilement)
- asset_candidates: assets/page-publique-mobile.png, assets/page-publique-mobile-long.png
- status: animated
- src: compositions/frames/03-lien.html
- voiceover: « Et votre page de réservation est prête à être partagée. » (0.15s ; « page de réservation » 0.68–1.87s ; « prête » 2.23s ; « partagée » 2.96–3.6s)

Écrans du parcours (reproductions fidèles du `BookingShell` de l'app, même style que la capture : en-tête « Votre rendez-vous chez » + « reso », « Maison Alba », pastilles d'étapes 1–2–3–4 bleu ardoise) : étape 1 = la capture réelle (« Choix de la prestation », tap sur « Soin visage éclat · 65 € ») ; étape 2 « Choisissez votre créneau » avec les pastilles « Camille » (sélectionnée) / « Inès » ; étape 3 bande de dates « Ven. 02 » + grille de créneaux, tap sur 10:30 ; étape 4 confirmation réelle de l'app : bandeau vert « Votre rendez-vous est confirmé. Un email de confirmation est envoyé à julie.martin@example.com. » puis carte « Votre rendez-vous » (Prestation « Soin visage éclat », Date « vendredi 2 octobre à 10:30 », Durée « 1 h », Avec « Camille », Prix « 65 € · paiement sur place »).
Scene 1 (0.0–0.8s) : étiquette « 03 — Partagez votre lien » ; pilule crème « reso-app.fr/r/maison-alba » + bouton « Copier » → « Copié ✓ » (sur « page de réservation »).
Scene 2 (0.6–1.6s) : la pilule glisse vers le haut et le téléphone (cadre chrome, rayons 64/50, ~600px de large) monte du bas avec la page réelle ; léger défilement.
Scene 3 (1.5–3.0s) : parcours accéléré : tap prestation → écran praticienne (tap Camille) → créneaux (tap 10:30) ; chaque écran glisse latéralement dans le téléphone (0.25s), tap = petit cercle crème qui s'étend.
Scene 4 (2.9–3.8s) : écran de confirmation, le bandeau vert éclot ; la caméra pousse légèrement sur le téléphone. Tenue.
- sfx: tick à chaque tap, ding doux sur la confirmation.

## Frame 5 — Nouveau rendez-vous + promesse

- scene: Une seule notification élégante (email reçu par le pro, objet réel de Reso) glisse en haut ; puis tout s'efface vers une composition très épurée : « De votre fiche Google à votre agenda en quelques minutes. » puis « 7 jours gratuits · sans carte bancaire ».
- duration: 2.2s
- transition_in: crossfade
- type: benefit_highlight
- blueprint: titlecard-reveal (Adapt)
- focal: la phrase de promesse
- roles: aucun asset image
- asset_candidates: none
- status: animated
- src: compositions/frames/04-promesse.html
- voiceover: (la voix de fin commence à 1.2s : « Essayez Réso gratuitement… »)

Scene 1 (0.0–0.8s) : sur l'ivoire, le téléphone de la frame précédente s'éloigne (flou) ; une notification carte crème (icône enveloppe dans un carré ardoise, « Email · maintenant », titre « Nouveau rendez-vous : Julie Martin · Soin visage éclat », ligne « Vendredi 2 octobre · 10:30 · avec Camille ») descend et se pose à y≈420, ombre douce, un seul « ding ».
Scene 2 (0.7–2.2s) : la notification s'éloigne vers le haut et se fond ; « De votre fiche Google / à votre agenda / en quelques minutes. » (encre, Outfit 500 ~96px, centré, y≈700–1000) monte mot par mot ; dessous, en mono ardoise, « 7 jours gratuits · sans carte bancaire » (à 1.5s). Tenue immobile.
- sfx: ding sur la notification.

## Frame 6 — Signature

- scene: Panneau poudré ; le logo reso crème se forme ; « Votre métier. Sans la gestion qui va avec. » ; pilule crème « Essayez gratuitement » ; « reso-app.fr ».
- duration: 2.8s
- transition_in: crossfade
- type: cta
- blueprint: logo-assemble-lockup (Adapt)
- focal: assets/logo-reso-creme.svg
- roles: logo-reso-creme = cutout
- asset_candidates: assets/logo-reso-creme.svg
- status: animated
- src: compositions/frames/05-signature.html
- voiceover: suite de « …gratuitement pendant sept jours. Sans carte bancaire. » (« sans carte bancaire » 1.95–2.75s)

Scene 1 (0.0–0.8s) : le panneau poudré remplit le cadre (balayage depuis le bas, `expo.out`) ; logo reso crème ~520px de large révélé par masque gauche→droite avec un reflet chrome unique, centré à y≈720.
Scene 2 (0.6–1.6s) : « Votre métier. / Sans la gestion qui va avec. » (crème, Outfit 500 ~64px, y≈920–1060).
Scene 3 (1.4–2.8s) : pilule crème « Essayez gratuitement » (texte encre, 560×120) se pose à y≈1230 avec un léger halo crème ; dessous « reso-app.fr » en mono crème 70 % (y≈1380). Tenue immobile jusqu'à la fin.
- sfx: logo sonore à 0.3s.
