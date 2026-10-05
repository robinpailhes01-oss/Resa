---
format: 1920x1080
duration: 59.5s
message: "J'ai 45 secondes pour vous convaincre que Reso est bien mieux que votre téléphone qui sonne en plein soin."
arc: Défi (compte à rebours) → douleur → solution (vraies captures) → bientôt (SEO/GEO, agents IA) → gag café → CTA → chute en dialogue
audience: Pros indépendants de la beauté en France (Reels, Meta Ads)
mode: autonomous
music: none
voiceover: phrases posées par mix.sh (narrateur masculin + Céline), voir SCRIPT.md
---

Format de la référence `ANALYSE.md` (motion design d'écran seul, sans captation). Toutes les frames portent le même compte à rebours (voir `frame.md`), calculé depuis leur `global_start`. Temps de voix **locaux à la frame** ; ils seront recalés sur la voix définitive.

## Video direction

Voir `frame.md` : fond uni bleu poudré, typographie crème très grasse (Outfit 700), une idée à la fois, karaoké de mots, cartes qui volent et s'empilent, stickers jaunes « BIENTÔT » / « PAS ENCORE », compte à rebours permanent en haut à droite. Rythme ultra dynamique mais lisible : chaque entrée tombe sur un mot de la voix, rien ne reste immobile plus de 1 s sauf la toute fin.

## Frame 1 — Le défi

- scene: « Ok, » énorme au centre, puis « J'ai 45 secondes » (le « 45 » en crème plein, gros), puis la phrase complète en karaoké ; la pastille compte à rebours apparaît et commence à 0:45 ; un téléphone qui sonne (carte d'appel entrant « Appel entrant… » qui vibre) traverse sur « téléphone qui sonne ».
- duration: 5.9s
- global_start: 0
- transition_in: cut
- type: hook
- blueprint: kinetic-type-beats (Adapt)
- focal: « J'ai 45 secondes »
- roles: aucun asset image
- asset_candidates: none
- status: animated
- src: compositions/frames/01-defi.html
- voiceover: André (narrateur) : « Ok ! J'ai quarante-cinq secondes pour vous convaincre que Réso est bien mieux que votre téléphone qui sonne en plein soin. » — temps locaux réels : « Ok » 0.18 ; « 45 » 0.82 ; « secondes » 1.23–1.8 ; « Réso » 3.15 ; « téléphone » 4.38 ; « qui sonne » 4.83–5.2 ; « en plein soin » 5.23–5.77

Scene 1 (0.0–0.7s) : « Ok, » claque au centre (scale 1.25→1, 0.2s), fond qui respire.
Scene 2 (0.7–2.2s) : « Ok, » glisse en haut ; « J'ai 45 secondes » arrive mot par mot, « 45 » plus gros ; la pastille du compte à rebours se pose en haut à droite à 1.0s (« 0:45 ») et décompte.
Scene 3 (2.2–5.6s) : la phrase « pour vous convaincre que Reso est bien mieux que votre téléphone qui sonne en plein soin. » en karaoké (2 lignes, ~84px) ; sur « téléphone qui sonne », une carte « Appel entrant · Numéro inconnu » (icône combiné, boutons rouge/vert génériques) entre par la droite en vibrant (oscillation x ±6px déterministe) puis sort.
- sfx: buzz sur l'appel entrant.


**Recalage voix (prioritaire sur les temps des scènes ci-dessus)** : la durée et les temps de voix ont changé ; garder la même mise en scène, décaler chaque beat sur le mot réel indiqué dans `voiceover`.

## Frame 2 — Soyons honnêtes

- scene: « Soyons honnêtes. » puis trois cartes-problèmes qui s'empilent en vrac avec badges rouges : « SMS · 3 nouveaux messages » (« Dispo samedi 14h ? », « Je peux décaler ? »), « Messages Insta · 5 » (« Bonjour, c'est possible demain ? »), « Agenda papier » (page griffonnée, rendez-vous rayés) ; puis « ça part dans tous les sens » : les cartes tournent et s'éparpillent ; enfin « Pendant un soin, impossible de décrocher. » avec un compteur rouge « 4 appels manqués ».
- duration: 9.7s
- global_start: 5.9
- transition_in: crossfade
- type: problem
- blueprint: overwhelm-surround (Adapt)
- focal: pile de cartes-problèmes
- roles: aucun asset image (cartes construites, icônes génériques — aucun logo de marque)
- asset_candidates: none
- status: animated
- src: compositions/frames/02-douleur.html
- voiceover: « Soyons honnêtes : les rendez-vous par SMS, les messages Insta, l'agenda papier… ça part dans tous les sens ! Et pendant un soin, impossible de décrocher. » — temps locaux réels : « Soyons » 0.1 ; « honnêtes » 0.45–1.0 ; « SMS » 2.13 ; « messages Insta » 2.7–3.6 ; « agenda papier » 3.92–4.9 ; « ça part dans tous les sens » 5.14–6.9 ; « pendant un soin » 7.1–8.0 ; « impossible de décrocher » 8.23–9.46

Scene 1 (0.0–1.0s) : « Soyons honnêtes. » en karaoké au centre, puis remonte en titre (y≈150, 72px).
Scene 2 (1.0–4.0s) : les 3 cartes entrent une par une sur leur mot, inclinées, empilées au centre, badges rouges qui comptent (1→3, 1→5).
Scene 3 (4.0–5.4s) : « ça part dans tous les sens » : les cartes tournent et partent dans des directions différentes (rotations ±25°, flou de mouvement).
Scene 4 (5.4–7.8s) : « Pendant un soin, impossible de décrocher. » en karaoké ; pastille rouge « 4 appels manqués » qui incrémente.
- sfx: tick à chaque carte, whoosh sur l'éparpillement.


**Recalage voix (prioritaire sur les temps des scènes ci-dessus)** : la durée et les temps de voix ont changé ; garder la même mise en scène, décaler chaque beat sur le mot réel indiqué dans `voiceover`.

## Frame 3 — Avec Reso

- scene: « Avec Reso, » ; un téléphone avec la vraie page de réservation (Maison Alba) : une cliente réserve « même le soir » (pastille « Réservé à 22:47 ») ; puis la vraie capture de l'agenda desktop où le rendez-vous se pose ; puis deux cartes emails réelles « Rappel la veille » et « Demande d'avis » qui se posent devant.
- duration: 8.9s
- global_start: 15.6
- transition_in: crossfade
- type: solution
- blueprint: device-surface-showcase (Adapt)
- focal: les vraies captures Reso
- roles: app-page-publique-mobile = cutout (téléphone) · app-agenda = cutout (fenêtre desktop) · emails-mobile-haut, emails-mobile-avis = supporting (cartes emails) · reservation-mobile-creneaux = supporting (option : écran créneaux)
- asset_candidates: assets/app-page-publique-mobile.png, assets/app-agenda.png, assets/emails-mobile-haut.png, assets/emails-mobile-avis.png, assets/reservation-mobile-creneaux.png
- status: animated
- src: compositions/frames/03-solution.html
- voiceover: « Avec Réso, vos clientes réservent toutes seules, en ligne, même le soir. Tout arrive dans votre agenda, avec le rappel la veille, et la demande d'avis après. » — temps locaux réels : « Avec » 0.13 ; « Réso » 0.33 ; « réservent » 1.38 ; « toutes seules » 1.89–2.5 ; « en ligne » 2.8–3.3 ; « même le soir » 3.44–4.1 ; « Tout arrive » 4.41 ; « agenda » 5.51 ; « rappel la veille » 6.4–7.2 ; « demande d'avis » 7.66–8.3 ; « après » 8.35–8.7

Scene 1 (0.0–0.9s) : « Avec Reso, » au centre, logo reso crème qui se forme à côté.
Scene 2 (0.8–3.8s) : titre en haut « Elles réservent toutes seules. » (karaoké) ; le téléphone (page publique réelle) monte à gauche-centre ; pastille « Réservé à 22:47 · Soin visage éclat » éclot à côté sur « même le soir ».
Scene 3 (3.8–6.0s) : le téléphone file à gauche en se réduisant ; la fenêtre agenda (capture réelle) arrive à droite, grande ; un bloc « 11:00 · Julie Martin » s'y pose sur « agenda » ; titre « Tout arrive dans votre agenda. ».
Scene 4 (6.0–9.2s) : deux cartes emails (captures réelles recadrées) se posent devant en éventail : « Rappel · la veille » sur « rappel la veille », « Demande d'avis Google » sur « demande d'avis » ; titre « Rappel la veille. Avis après. ».
- sfx: ding sur la réservation, tick sur chaque carte.


**Recalage voix (prioritaire sur les temps des scènes ci-dessus)** : la durée et les temps de voix ont changé ; garder la même mise en scène, décaler chaque beat sur le mot réel indiqué dans `voiceover`.

## Frame 4 — Bientôt

- scene: « Mais ce n'est pas tout. » ; trois cartes « à venir », chacune tamponnée « BIENTÔT » : (1) un résultat de recherche générique (barre « esthéticienne Montpellier », premier résultat « Maison Alba · Réserver en ligne », étoiles) ; (2) un assistant IA générique (bulle question « Un institut pour un soin visage à Montpellier ? » → réponse qui cite « Maison Alba — réservable en ligne ») ; (3) un agent IA qui prépare une publication (carte post carré avec photo réelle du salon, légende qui s'écrit, bouton « Programmer »). Chaque carte : sticker « BIENTÔT ».
- duration: 11.9s
- global_start: 24.5
- transition_in: crossfade
- type: roadmap
- blueprint: fixed-anchor-cycle (Adapt)
- focal: les cartes « Bientôt »
- roles: photo-1..4 = supporting (photo du post) · app-page-publique-mobile = supporting (option : vignette de la page dans le résultat)
- asset_candidates: assets/photo-1.png, assets/photo-2.png, assets/photo-3.png, assets/photo-4.png, assets/app-page-publique-mobile.png
- status: animated
- src: compositions/frames/04-bientot.html
- voiceover: « Mais ce n'est pas tout ! Bientôt, votre page de réservation sera pensée pour remonter sur Google… et dans les réponses des IA comme ChatGPT. Et des agents IA prépareront vos publications Instagram pour vous. » — temps locaux réels : « Mais ce n'est pas tout » 0.11–1.1 ; « Bientôt » 1.31 ; « page de réservation » 2.2–3.1 ; « remonter sur Google » 4.32–5.5 ; « réponses des IA » 6.29–7.3 ; « ChatGPT » 7.69–8.2 ; « agents IA » 8.58–9.2 ; « publications Instagram » 9.83–11.0 ; « pour vous » 11.07–11.8

Scene 1 (0.0–1.2s) : « Mais ce n'est pas tout. » karaoké centré, puis remonte (y≈140) et devient « Bientôt sur Reso… ».
Scene 2 (1.2–4.8s) : carte recherche au centre ; sur « remonter sur Google » le résultat Maison Alba monte en première position ; tampon « BIENTÔT » + légende « Référencement SEO de votre page ».
Scene 3 (4.8–6.6s) : la carte recherche glisse à gauche (réduite) ; carte assistant IA (bulle de question, réponse qui s'écrit et cite Maison Alba) ; tampon « BIENTÔT » + légende « Visible dans les réponses des IA (GEO) ».
Scene 4 (6.6–9.0s) : les deux cartes s'écartent ; carte agent IA au centre (post en préparation, légende qui s'écrit, bouton « Programmer ») ; tampon « BIENTÔT » + légende « Agents IA pour vos publications ».
- sfx: tampon (paper) à chaque sticker.


**Recalage voix (prioritaire sur les temps des scènes ci-dessus)** : la durée et les temps de voix ont changé ; garder la même mise en scène, décaler chaque beat sur le mot réel indiqué dans `voiceover`.

## Frame 5 — Le café (gag)

- scene: « Et même… » ; carte action « Préparer un café » (icône tasse, sous-ligne « Entre deux clientes · serré »), bouton « Lancer la cafetière » ; le curseur clique, le bouton tremble et passe au rouge « Indisponible », sticker « PAS ENCORE » penché ; texte « Bon ça, j'avoue… » puis « on le fait pas encore. »
- duration: 5.5s
- global_start: 36.4
- transition_in: crossfade
- type: gag
- blueprint: cursor-ui-demo (Adapt)
- focal: carte café
- roles: aucun asset image
- asset_candidates: none
- status: animated
- src: compositions/frames/05-cafe.html
- voiceover: « Et même… vous faire un café entre deux clientes. Bon ça, j'avoue, on le fait pas encore. » — temps locaux réels : « Et même » 0.16–0.5 ; « faire un café » 0.97–1.9 ; « entre deux clientes » 2.01–2.9 ; « Bon ça, j'avoue » 3.08–4.1 ; « on le fait » 4.26–4.7 ; « pas encore » 4.7–5.37

Scene 1 (0.0–1.0s) : « Et même… » karaoké en haut ; la carte café se pose au centre.
Scene 2 (1.0–2.5s) : curseur qui vient sur « Lancer la cafetière » et clique à 2.2s.
Scene 3 (2.5–4.4s) : bouton qui tremble (oscillation déterministe), devient rouge « Indisponible » ; tampon « PAS ENCORE » sur « pas encore » (3.7s) ; sous-titre « Bon ça, j'avoue… on le fait pas encore. » en karaoké.
- sfx: tick au clic, buzz léger sur l'échec, paper sur le tampon.


**Recalage voix (prioritaire sur les temps des scènes ci-dessus)** : la durée et les temps de voix ont changé ; garder la même mise en scène, décaler chaque beat sur le mot réel indiqué dans `voiceover`.

## Frame 6 — Essayez

- scene: « Mais en attendant… » ; « Essayez Reso gratuitement » en grand ; bouton crème « Créer ma page » ; pastilles « 7 jours offerts » et « sans carte bancaire » ; URL « reso-app.fr » ; pastille prix « 39 € HT/mois » ; « Votre page est prête en quelques minutes. » ; le compte à rebours approche 0:00 et passe en rouge vers 45 s.
- duration: 11.4s
- global_start: 41.9
- transition_in: crossfade
- type: cta
- blueprint: cta-morph-press (Adapt)
- focal: bouton « Créer ma page »
- roles: logo-reso-creme = cutout (petit, au-dessus du titre)
- asset_candidates: assets/logo-reso-creme.svg
- status: animated
- src: compositions/frames/06-essai.html
- voiceover: « Mais en attendant, essayez Réso gratuitement pendant sept jours, sans carte bancaire, sur reso-app.fr. Trente-neuf euros hors taxe par mois, et votre page est prête en quelques minutes. » — temps locaux réels : « Mais en attendant » 0.14–1.2 ; « essayez » 1.28 ; « Réso » 1.78 ; « gratuitement » 2.1–2.7 ; « sept jours » 3.16–3.6 ; « sans carte bancaire » 3.77–4.7 ; « reso-app.fr » 4.9–7.0 ; « trente-neuf euros » 7.56–8.1 ; « hors taxe par mois » 8.05–9.1 ; « page est prête » 9.63–10.3 ; « quelques minutes » 10.42–11.3 (le compte à rebours atteint 0:00 à 3.1 local = 45 s global)

Scene 1 (0.0–1.4s) : « Mais en attendant… » puis logo + « Essayez Reso gratuitement » (karaoké, 104px).
Scene 2 (1.4–4.2s) : pastilles « 7 jours offerts » et « sans carte bancaire » qui se posent sur leurs mots ; bouton « Créer ma page » qui se pose.
Scene 3 (4.2–6.6s) : « reso-app.fr » s'écrit sous le bouton (mono crème) ; pastille « 39 € HT/mois » se pose sur « trente-neuf euros ».
Scene 4 (6.6–9.0s) : « Votre page est prête en quelques minutes. » ; le curseur clique « Créer ma page » (pression) ; tenue.
- sfx: tick sur chaque pastille, tick au clic.


**Recalage voix (prioritaire sur les temps des scènes ci-dessus)** : la durée et les temps de voix ont changé ; garder la même mise en scène, décaler chaque beat sur le mot réel indiqué dans `voiceover`.

## Frame 7 — La chute

- scene: Dialogue en bulles de chat (style messagerie générique, sans logo) : bulle gauche (Céline, avatar « C ») « Attends… t'as vraiment annoncé ChatGPT ? » ; bulle droite (narrateur) « Bientôt ! Mais avoue que ça donne envie. » avec un sticker « BIENTÔT » collé ; puis logo reso + bouton « Créer ma page » + reso-app.fr ; le compte à rebours affiche « +0:0N » en rouge.
- duration: 6.2s
- global_start: 53.3
- transition_in: crossfade
- type: outro
- blueprint: titlecard-reveal (Adapt)
- focal: bulles de dialogue
- roles: logo-reso-creme = cutout
- asset_candidates: assets/logo-reso-creme.svg
- status: animated
- src: compositions/frames/07-chute.html
- voiceover: Céline « Attends… t'as vraiment annoncé ChatGPT ? » 0.14–2.95 (« ChatGPT » 2.1–2.95) · André « Bientôt ! Mais avoue que ça donne envie. » « Bientôt » 3.2–3.8 ; « Mais avoue que ça donne envie » 4.29–5.4 ; carte finale à partir de ~4.6, tenue immobile jusqu'à 6.2

Scene 1 (0.0–1.7s) : bulle gauche qui s'écrit (indicateur « … » puis texte) sur la voix de Céline.
Scene 2 (1.7–3.2s) : bulle droite qui arrive, sticker « BIENTÔT » tamponné sur « Bientôt ».
Scene 3 (3.0–4.6s) : les bulles remontent et se réduisent ; logo reso crème + « Créer ma page » + « reso-app.fr » au centre ; tenue immobile.
- sfx: tick par bulle, logo sonore final.

**Recalage voix (prioritaire sur les temps des scènes ci-dessus)** : la durée et les temps de voix ont changé ; garder la même mise en scène, décaler chaque beat sur le mot réel indiqué dans `voiceover`.

