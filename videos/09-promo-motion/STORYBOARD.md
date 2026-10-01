---
format: 1920x1080
duration: 37.7s
message: "Vos clientes réservent en ligne, toutes seules — Reso s'occupe du reste."
arc: Hook → Product intro → Demo loop (page → créneau → agenda → emails) → CTA
audience: Professionnels indépendants de la beauté en France
mode: collaborative
music: none
voiceover: media/vo.wav (assemblée par mix.sh, hors pipeline)
---

Voix off féminine (SCRIPT.md, ElevenLabs « Céline », accélérée de 6 %) découpée phrase par phrase et posée sur chaque frame par `mix.sh` ; les titres à l'écran reprennent les mots-clés de la voix. Musique et bruitages (kit sonore Reso) ajoutés au même mixage, hors du pipeline audio. Les écrans de l'app viennent de la démo en ligne (reso-app.fr/demo, données d'exemple) capturée en 2880 px.

## Video direction

- **Palette (frame.md › Reso adaptation)** : plateau = dégradé radial `stage` #617990 (centre, légèrement haut) → `stage-deep` #3E5166 (bords), vignette douce ; grille fine crème à 5–6 % d'opacité en perspective au sol et un ou deux longs arcs lumineux crème (~25 %) qui traversent le fond, comme la référence. Cartes et appareils : `card` #FFFDF8, liseré `border` #E7DFD0, ombre longue et douce, coins arrondis. Titres sur le plateau : Outfit 500, crème `text-on-stage`, tracking serré −0.03em ; étiquettes (kicker) en JetBrains Mono majuscules, crème à ~70 %. Accent lavande #B6A6D8 rare : curseur, créneau sélectionné, un mot-clé, halo du bouton final. Jamais de violet sombre, jamais de noir pur.
- **Monde 3D** : chaque frame est une scène en perspective (≈1600–2000px) ; les captures sont de vraies images (assets/…png) posées sur des cartes / téléphones flottants inclinés (rotateX/rotateY modérés), à plusieurs profondeurs ; ce qui n'est pas au point est flouté (profondeur de champ) et plus sombre. Une caméra virtuelle continue (`multi-phase-camera`, `viewport-change`, `coordinate-target-zoom`) porte chaque frame : un mouvement motivé par plan, qui se pose, pas de dérive gratuite.
- **Grammaire de mouvement** : courbes longues `power3` / `expo.out` pour les arrivées rapides ; aucun rebond, aucun `back`/`elastic`. Titres en **per-word staggered reveal** montant d'un masque (`dynamic-content-sequencing`), légère montée + défloutage. Les éléments n'arrivent que quand le titre les nomme ; rien n'est posé d'un coup au début.
- **Rythme** : frames 1, 4, 6 = énergie (caméra active) ; frame 2 = sting bref ; frame 5 = respiration (un seul mouvement puis tenue) ; frame 7 = atterrissage calme puis signature tenue. Les tenues sont immobiles, au plus une micro-oscillation (`sine-wave-loop` basse amplitude).
- **Interdits** : diaporama (tout posé puis figé), « économiseur d'écran » (tout flotte indépendamment), respiration en boucle, pan lent en fin de plan, `repeat`/`yoyo`, aléatoire. Pas d'interface inventée à la place d'une vraie capture (seuls la barre de recherche du frame 1, les pastilles/notifications et le bouton CTA sont reconstruits en HTML). Pas de faux chiffres ni d'avis. Rien d'important dans les 17 % du bas.

## Frame 1 — Accroche : « Vos clientes vous cherchent en ligne. »

- scene: Barre de recherche 3D inclinée qui se tape toute seule « esthéticienne près de chez moi », suggestions qui tombent ; au-dessus, « Vos clientes vous cherchent en ligne. »
- duration: 4.5s
- transition_in: cut
- type: hook
- blueprint: prompt-type-submit-generate (Adapt)
- focal: barre de recherche reconstruite (HTML)
- roles: aucun asset image (tout est construit) · fond = plateau poudré avec silhouettes floues de cartes
- asset_candidates: none
- status: animated
- src: compositions/frames/01-accroche.html
- voiceover: (aucune) — à l'écran : kicker « AUJOURD'HUI » · « Vos clientes vous cherchent en ligne. »

Adapt : on garde la signature « la requête se tape dans un vrai champ et la machine répond » (suggestions qui tombent), sans produit visible encore ; la réponse est une liste de suggestions de recherche.
Scene 1 (0.0–1.2s) : ouverture en légère plongée sur le plateau ; un champ de 8–10 cartes-fantômes floues (rectangles crème à 8–15 % d'opacité, profondeur de champ) en arrière-plan incliné ; la caméra se redresse (arrivée `expo.out`). Le kicker « AUJOURD'HUI » se tape en mono en haut au centre (`discrete-text-sequence`).
Scene 2 (0.6–2.2s) : « Vos clientes vous cherchent en ligne. » monte mot par mot au tiers supérieur, centré, grande taille (h1 ~3:1 sur le reste) (`dynamic-content-sequencing`).
Scene 3 (1.6–3.4s) : la barre de recherche (pilule crème, icône loupe, ~55 % de largeur) glisse en avant depuis la profondeur, inclinée ~12° en rotateX, au centre bas du tiers médian ; le texte « esthéticienne près de chez moi » se tape avec caret lavande (`discrete-text-sequence`).
Scene 4 (3.0–4.5s) : 3 suggestions tombent sous la barre en cascade (« esthéticienne près de chez moi », « soin du visage Lyon », « pose semi-permanent ce soir »), la première surlignée bleu poudré ; la caméra amorce un push vers la barre dans les 0.4 dernières secondes (vitesse croissante) pour enchaîner sur le zoom-through du frame 2. Mise en page : centrée, 3 couches (fond flou / titre / barre).
- handoff_out: barre de recherche au centre (x 960, y 640), scale 1.0 → en accélération vers la caméra (push-in), opacity 1.
- sfx: type (frappe), tick sur chaque suggestion.

## Frame 2 — Marque : reso®

- scene: Push-in à travers la barre ; le mot-symbole reso® se dévoile au centre, « Beauty business simplified » en dessous.
- duration: 2.5s
- transition_in: zoom-through
- type: branding
- blueprint: logo-assemble-lockup (Adapt)
- focal: assets/logo-reso-creme.svg
- roles: logo-reso-creme = cutout (centre)
- asset_candidates: assets/logo-reso-creme.svg
- status: animated
- src: compositions/frames/02-marque.html
- voiceover: (aucune) — à l'écran : reso® · BEAUTY BUSINESS SIMPLIFIED

Adapt : sous-forme « camera pushes through negative space » ; on arrive en zoom-through depuis la barre du frame 1 (inverse zoom-through = arrivée), puis le logo se dévoile.
- handoff_in: la barre de recherche arrive très grande et floue (scale ~3, flou de mouvement) au centre et disparaît en traversant la caméra.
Scene 1 (0.0–0.5s) : fin du zoom-through : traînée de flou (`motion-blur-streak`) qui se dissipe sur le plateau vide, un halo crème doux s’ouvre au centre (lueur radiale douce).
Scene 2 (0.4–1.4s) : le mot-symbole reso® se dévoile de gauche à droite par masque, légère montée et défloutage (révélation par masque), centré, ~28 % de la largeur.
Scene 3 (1.1–2.5s) : un trait crème fin se trace sous le logo, puis « BEAUTY BUSINESS SIMPLIFIED » apparaît en tracking large qui se resserre ; tenue immobile. Centré, 2 couches.
- sfx: whoosh à l'entrée, logo (logo sonore) à 0.5s.

## Frame 3 — « Votre page de réservation. »

- scene: Le vrai écran desktop « Ma page de réservation » (photos, bio) arrive en grand panneau 3D incliné ; puis la page publique « Maison Alba » côté client glisse devant dans un téléphone, comme son aperçu.
- duration: 5.2s
- transition_in: crossfade
- type: product_intro
- blueprint: device-surface-showcase (Adapt)
- focal: assets/app-ma-page.png
- roles: app-ma-page = cutout (grand écran desktop, héros, 2880×1694) · app-page-publique-mobile = supporting (téléphone devant, à droite, 1170×2532) · app-page-publique-desktop = background (grande carte très floue en profondeur, ~30 %)
- asset_candidates: assets/app-ma-page.png, assets/app-page-publique-mobile.png, assets/app-page-publique-desktop.png
- status: animated
- src: compositions/frames/03-page.html
- voiceover: « Vous avez votre propre page de réservation : vos photos, vos prestations, vos avis. » (débute à 0.3s ; « vos photos » ≈ 2.75s, « vos prestations » ≈ 3.3s, « vos avis » ≈ 4.2s)

Adapt : écran desktop réel en héros (fenêtre crème à coins arrondis, fine barre de titre avec 3 pastilles et l'URL « reso-app.fr/r/maison-alba »), incliné en rotateY ~14° et rotateX ~6°, occupant ~62 % de la largeur à droite ; un téléphone (page publique) passe devant.
Scene 1 (0.0–1.3s) : kicker « MA PAGE » + titre « Votre page de réservation. » monte mot par mot à gauche (colonne ~34 %, tiers supérieur). La fenêtre desktop arrive depuis la profondeur à droite (`power3`/`expo.out`), ombre longue.
Scene 2 (1.3–2.6s) : la caméra glisse vers la rangée « Photos » de la capture ; les 4 photos sont mises en valeur une à une par un léger soulèvement (calques recadrés sur les vraies photos de la capture, aux coordonnées exactes) au rythme de « vos photos » (≈2.75s).
Scene 3 (2.6–4.0s) : le téléphone (page publique mobile) glisse depuis le bas-droite devant la fenêtre, incliné rotateY -16°, l'écran défile doucement de la photo vers « Choix de la prestation » (≈ « vos prestations » 3.3s).
Scene 4 (4.0–5.2s) : une petite pastille crème « ★ 4,9 · avis Google » éclot près du téléphone sur « vos avis » (≈4.2s) — chiffre visible sur la capture de démo ; tenue avec micro push de caméra.
- sfx: whoosh doux à l'arrivée de la fenêtre, tick sur la pastille avis.

## Frame 4 — « Elles réservent seules, 24h/24. »

- scene: Caméra qui plonge sur la grille de créneaux réelle ; un curseur choisit 10:30, la carte « Vos coordonnées » pivote en avant, une pastille « Réservation confirmée » éclot.
- duration: 4.5s
- transition_in: crossfade
- type: feature_showcase
- blueprint: cursor-ui-demo (Adapt)
- focal: assets/reservation-mobile-creneaux.png
- roles: reservation-mobile-creneaux = cutout (grande carte inclinée) · reservation-mobile-coordonnees = supporting (carte qui pivote en avant)
- asset_candidates: assets/reservation-mobile-creneaux.png, assets/reservation-mobile-coordonnees.png
- status: animated
- src: compositions/frames/04-creneau.html
- voiceover: (aucune) — à l'écran : « Elles réservent seules, 24h/24. »

Adapt : la capture est une image fixe ; le curseur et le surlignage du créneau sont des calques HTML posés aux coordonnées du bouton « 10:30 » dans l'image ; la caméra suit le curseur.
Scene 1 (0.0–1.2s) : grande carte de la capture « créneaux » posée à plat et inclinée (rotateX ~35°, comme une table vue en plongée), occupant ~70 % du cadre ; la caméra descend vers la grille des créneaux (`coordinate-target-zoom`). Titre « Elles réservent seules, 24h/24. » monte mot par mot en haut à gauche, sur le plateau.
Scene 2 (1.2–2.4s) : un curseur crème (pointe ombrée) entre et glisse vers le créneau « 10:30 » ; au clic, le créneau se remplit de lavande et une onde s'étend (`cursor-click-ripple`).
Scene 3 (2.2–3.6s) : la carte « Vos coordonnées » (reservation-mobile-coordonnees, champs Julie / Martin remplis) pivote depuis la profondeur et se pose devant, à droite (rotateY 25° → 8°), la grille passe en flou d'arrière-plan.
Scene 4 (3.4–4.5s) : une pastille verte-poudrée « ✓ Réservation confirmée · ven. 2 oct. · 10:30 » éclot au-dessus de la carte (`spring-pop-entrance`, version douce) ; tenue.
- sfx: tick au clic, ding doux sur la confirmation.

## Frame 5 — « Tout arrive dans votre agenda. »

- scene: Le vrai agenda desktop (deux colonnes Camille / Inès) en grand panneau 3D ; un nouveau rendez-vous « 11:00 · Julie Martin · Soin du visage » tombe dans un créneau vide avec un « ding ».
- duration: 4s
- transition_in: crossfade
- type: benefit_highlight
- blueprint: camera-journey (Adapt)
- focal: assets/app-agenda.png
- roles: app-agenda = cutout (grand écran desktop incliné, 2880×1756)
- asset_candidates: assets/app-agenda.png
- status: animated
- src: compositions/frames/05-agenda.html
- voiceover: « Et tout arrive directement dans votre agenda. » (débute à 0.2s ; « agenda » ≈ 2.1s)

Adapt : une seule jambe de caméra (travelling latéral + push) qui se pose sur la grille, puis la conséquence (le bloc qui tombe) ; plan respiration.
Scene 1 (0.0–1.4s) : la fenêtre desktop de l'agenda (fenêtre crème, barre de titre fine) arrive par travelling de droite à gauche et se pose, inclinée rotateY ~-12°, ~68 % de la largeur à droite ; titre « Tout arrive dans votre agenda. » à gauche mot par mot, « agenda. » en lavande claire.
Scene 2 (1.4–2.6s) : la caméra pousse vers un créneau vide de la colonne « Inès » entre 11:00 et 13:00 ; un bloc HTML lavande clair aux couleurs exactes des blocs de la capture « 11:00 · Julie Martin / Soin du visage » descend du haut et se loge à l'atterrissage ≈2.1s (sur « agenda »), ombre qui se resserre, anneau lavande.
Scene 3 (2.6–4.0s) : une notification « Nouvelle réservation · Julie Martin · 11:00 » (icône reso) glisse au-dessus de la fenêtre et se pose ; tenue.
- sfx: ding à l'atterrissage du bloc.

## Frame 6 — Tableau de bord : « vos rendez-vous, vos revenus, votre remplissage »

- scene: Le vrai tableau de bord : les 4 tuiles d'activité (Rendez-vous 86, Revenus 4 230 €, Remplissage 78 %, Annulations 3) puis le graphique « Rendez-vous par jour » ; la caméra passe de tuile en tuile au rythme de la voix.
- duration: 6.2s
- transition_in: crossfade
- type: feature_showcase
- blueprint: camera-journey (Adapt)
- focal: assets/app-dashboard-activite.png
- roles: app-dashboard-activite = cutout (grande carte, 2240×1000 : tuiles + graphique) · app-dashboard = background (écran complet très flou en profondeur, « Bonjour Camille »)
- asset_candidates: assets/app-dashboard-activite.png, assets/app-dashboard.png
- status: animated
- src: compositions/frames/055-tableau.html
- voiceover: « Votre tableau de bord vous montre vos rendez-vous, vos revenus, votre remplissage… en un coup d'œil. » (débute à 0.3s ; « rendez-vous » ≈ 2.0s, « revenus » ≈ 2.8s, « remplissage » ≈ 3.7s, « coup d'œil » ≈ 4.8s)

Adapt : les chiffres des tuiles sont des données d'exemple de la démo ; on les montre tels quels (capture), avec une mention discrète « Données d'exemple » en mono en bas à droite de la carte. Les comptes animés sont des calques HTML posés exactement sur les chiffres de la capture (même police Outfit 500, même couleur encre #1F2733, fond de tuile #FFFDF8 qui masque le chiffre d'origine) et finissent exactement sur la valeur capturée.
Scene 1 (0.0–1.4s) : kicker « TABLEAU DE BORD » + titre « Tout, en un coup d'œil. » en haut à gauche, mot par mot ; la carte d'activité arrive depuis la profondeur, inclinée rotateX ~18°, comme posée sur une table, ~78 % de la largeur ; en fond, l'écran complet très flou.
Scene 2 (1.4–4.4s) : la caméra (`coordinate-target-zoom`) passe sur la tuile Rendez-vous (≈2.0s : 0 → 86 en count-up), puis Revenus (≈2.8s : 0 → 4 230 €), puis Remplissage (≈3.7s : 0 → 78 %), chaque tuile active se soulève légèrement (ombre plus longue, liseré lavande) pendant que les autres restent nettes.
Scene 3 (4.4–6.0s) : la caméra recule pour montrer tout le tableau ; les barres du graphique « Rendez-vous par jour » montent de gauche à droite (calque de masque qui révèle la capture de bas en haut, barre par barre) sur « en un coup d'œil » ; tenue.
- sfx: tick à chaque tuile.

## Frame 7 — « Confirmation, rappel, avis : automatiques. »

- scene: Un nœud central reso relié par des arcs lumineux à trois cartes qui s'allument tour à tour : Confirmation · Rappel la veille · Demande d'avis Google ; en fond, la vraie page « Emails automatiques ».
- duration: 4.8s
- transition_in: crossfade
- type: feature_showcase
- blueprint: constellation-hub (Adapt)
- focal: nœud reso + 3 cartes emails (HTML)
- roles: emails-mobile-haut = background (grande carte inclinée floutée, ~35 %) · emails-mobile-avis = supporting (petite carte nette, en bas à droite)
- asset_candidates: assets/emails-mobile-haut.png, assets/emails-mobile-avis.png
- status: animated
- src: compositions/frames/06-emails.html
- voiceover: (aucune) — à l'écran : « Confirmation, rappel, avis. Automatiques. »

Adapt : pas d'anneau de logos ; un hub (pastille bleu nuit avec le mot-symbole reso) et 3 satellites-cartes reliés par des arcs SVG qui se dessinent ; finisher = push-in de caméra avec profondeur de champ sur la 3e carte.
Scene 1 (0.0–1.0s) : en fond, la capture « Emails automatiques » en grande carte inclinée et floutée ; le hub reso apparaît au centre-gauche (`spring-pop-entrance` douce), anneaux concentriques fins.
Scene 2 (0.8–3.2s) : le titre se construit mot par mot en haut : « Confirmation, » / « rappel, » / « avis. » — à chaque mot, un arc lumineux se dessine du hub vers une carte qui s'allume (`svg-path-draw` + `avatar-cloud-network`) : carte 1 « Confirmation de réservation · envoyée tout de suite », carte 2 « Rappel · la veille du rendez-vous », carte 3 « Demande d'avis Google · après la visite ».
Scene 3 (3.0–4.5s) : « Automatiques. » arrive en accent lavande ; la caméra pousse doucement vers la carte 3, les autres passent en flou (`depth-of-field-blur`) ; tenue.
- sfx: tick à chaque carte qui s'allume.

## Frame 8 — Appel à l'action et signature

- scene: « Envie d'essayer ? » ; carte « 7 jours offerts · sans carte bancaire » ; bouton « Créer ma page » cliqué par le curseur ; résolution sur la signature reso® + « puis 39 € HT/mois, sans engagement ».
- duration: 6s
- transition_in: crossfade
- type: cta
- blueprint: titlecard-reveal (Adapt)
- focal: bouton « Créer ma page » (HTML) puis assets/logo-reso-creme.svg
- roles: dashboard-tablette-bonjour = background (tablette inclinée très floue derrière le titre, ~25 %) · logo-reso-creme = cutout (signature finale)
- asset_candidates: assets/logo-reso-creme.svg, assets/dashboard-tablette-bonjour.png
- status: animated
- src: compositions/frames/07-cta.html
- voiceover: (aucune) — à l'écran : « Envie d'essayer ? » · « 7 jours offerts, sans carte bancaire » · « Créer ma page » · reso® Beauty business simplified

Adapt : chaîne de deux cartes (CTA puis signature), seule la seconde est tenue jusqu'à la fin ; c'est la seule frame avec une vraie sortie.
Scene 1 (0.0–1.4s) : en fond très flou, la tablette (dashboard-tablette-bonjour) inclinée ; « Envie d'essayer ? » monte mot par mot au centre, grande taille.
Scene 2 (1.2–2.6s) : sous le titre, la ligne « 7 jours offerts · sans carte bancaire » apparaît (mono, crème) puis le bouton pilule crème « Créer ma page » (texte encre) se pose avec un halo lavande (`ambient-glow-bloom`).
Scene 3 (2.4–3.3s) : le curseur entre, clique le bouton : compression puis retour, onde lavande (`press-release-spring` + `cursor-click-ripple`).
Scene 4 (3.3–5.5s) : le contenu se dissout vers le centre (`scale-swap-transition`) et la signature se forme : reso® crème centré, trait fin, « BEAUTY BUSINESS SIMPLIFIED », puis en petit dessous « puis 39 € HT/mois · sans engagement » ; tenue immobile jusqu'à la fin.
- sfx: tick au clic, logo (logo sonore) à 3.4s.
