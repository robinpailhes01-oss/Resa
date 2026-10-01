---
format: 1920x1080
duration: 30s
message: "Vos clientes réservent en ligne, toutes seules — Reso s'occupe du reste."
arc: Hook → Product intro → Demo loop (page → créneau → agenda → emails) → CTA
audience: Professionnels indépendants de la beauté en France
mode: collaborative
music: none
---

Pas de voix off : le texte à l'écran porte le message (titres courts révélés mot par mot), et les reveals sont calés sur ces titres comme ils le seraient sur une voix. Musique et bruitages (kit sonore Reso) sont ajoutés à l'assemblage, hors du pipeline audio.

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

## Frame 3 — « On crée votre page de réservation. »

- scene: La vraie page publique « Maison Alba » arrive dans un téléphone flottant incliné en 3D, une 2e carte (prestations + horaires) glisse derrière en profondeur.
- duration: 4.5s
- transition_in: crossfade
- type: product_intro
- blueprint: device-surface-showcase (Adapt)
- focal: assets/page-publique-mobile-haut.png
- roles: page-publique-mobile-haut = cutout (dans un téléphone, héros) · page-publique-mobile-horaires = supporting (carte en profondeur, floue)
- asset_candidates: assets/page-publique-mobile-haut.png, assets/page-publique-mobile-horaires.png
- status: animated
- src: compositions/frames/03-page.html
- voiceover: (aucune) — à l'écran : « On crée votre page de réservation. »

Adapt : variante « floating-window push-scroll » : un téléphone crème flottant (cadre fin, coins ~56px) incliné ~-18° en rotateY, l'écran fait défiler doucement la page réelle.
Scene 1 (0.0–1.2s) : titre « On crée votre page de réservation. » monte mot par mot à gauche (colonne 40 %, tiers supérieur). Mise en page asymétrique 40/60.
Scene 2 (0.8–2.4s) : le téléphone arrive depuis la droite et la profondeur (translateZ négatif → 0, rotateY -30° → -18°, `power3`), ombre longue au sol ; l'écran montre la page publique (haut : « Maison Alba », bouton « Prendre rendez-vous », photo).
Scene 3 (2.2–3.6s) : derrière lui, en profondeur et légèrement floue, la carte « prestations + horaires » (page-publique-mobile-horaires) glisse en place, décalée en haut à droite (`depth-of-field-blur`).
Scene 4 (3.2–4.5s) : l'écran du téléphone fait défiler doucement la page jusqu'au bouton « Prendre rendez-vous » qui s'illumine d'un halo lavande (`3d-page-scroll` + `asr-keyword-glow`) ; tenue.
- sfx: whoosh doux à l'arrivée du téléphone.

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

- scene: Travelling latéral vers l'agenda réel ; un nouveau bloc « Soin du visage · Julie M. » tombe dans la journée avec un « ding ».
- duration: 4s
- transition_in: crossfade
- type: benefit_highlight
- blueprint: camera-journey (Adapt)
- focal: assets/agenda-mobile-lundi.png
- roles: agenda-mobile-lundi = cutout (téléphone / grande carte)
- asset_candidates: assets/agenda-mobile-lundi.png
- status: animated
- src: compositions/frames/05-agenda.html
- voiceover: (aucune) — à l'écran : « Tout arrive dans votre agenda. »

Adapt : une seule jambe de caméra (travelling latéral + léger push) qui se pose sur l'agenda, puis la conséquence (le bloc qui tombe) ; c'est le plan respiration.
Scene 1 (0.0–1.4s) : travelling latéral de droite à gauche qui se pose (`viewport-change`, `power3`) : l'agenda (capture) dans un grand téléphone légèrement incliné, à droite du cadre ; titre « Tout arrive dans votre agenda. » à gauche, mot par mot. Asymétrique 45/55.
Scene 2 (1.4–2.8s) : un bloc de rendez-vous HTML crème-lavande « Soin du visage · 10:30 · Julie M. » descend du haut et se loge dans un créneau vide de la colonne de l'agenda (aligné sur la grille de l'image), petite ombre qui se resserre à l'atterrissage.
Scene 3 (2.8–4.0s) : une notification « Nouvelle réservation » (icône reso) glisse brièvement au-dessus du téléphone puis se pose ; tenue immobile.
- sfx: ding à l'atterrissage du bloc.

## Frame 6 — « Confirmation, rappel, avis : automatiques. »

- scene: Un nœud central reso relié par des arcs lumineux à trois cartes qui s'allument tour à tour : Confirmation · Rappel la veille · Demande d'avis Google ; en fond, la vraie page « Emails automatiques ».
- duration: 4.5s
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

## Frame 7 — Appel à l'action et signature

- scene: « Envie d'essayer ? » ; carte « 7 jours offerts · sans carte bancaire » ; bouton « Créer ma page » cliqué par le curseur ; résolution sur la signature reso® + « puis 39 € HT/mois, sans engagement ».
- duration: 5.5s
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
