---
format: 1920x1080
duration: 49.6s
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
- duration: 5.6s
- global_start: 0
- transition_in: cut
- type: hook
- blueprint: kinetic-type-beats (Adapt)
- focal: « J'ai 45 secondes »
- roles: aucun asset image
- asset_candidates: none
- status: animated
- src: compositions/frames/01-defi.html
- voiceover: « Ok, j'ai quarante-cinq secondes pour vous convaincre que Réso est bien mieux que votre téléphone qui sonne en plein soin. » (« Ok » 0.2s ; « quarante-cinq secondes » 0.8–1.9s ; « Réso » 2.9s ; « téléphone qui sonne » 4.0–4.8s ; « en plein soin » 4.8–5.4s)

Scene 1 (0.0–0.7s) : « Ok, » claque au centre (scale 1.25→1, 0.2s), fond qui respire.
Scene 2 (0.7–2.2s) : « Ok, » glisse en haut ; « J'ai 45 secondes » arrive mot par mot, « 45 » plus gros ; la pastille du compte à rebours se pose en haut à droite à 1.0s (« 0:45 ») et décompte.
Scene 3 (2.2–5.6s) : la phrase « pour vous convaincre que Reso est bien mieux que votre téléphone qui sonne en plein soin. » en karaoké (2 lignes, ~84px) ; sur « téléphone qui sonne », une carte « Appel entrant · Numéro inconnu » (icône combiné, boutons rouge/vert génériques) entre par la droite en vibrant (oscillation x ±6px déterministe) puis sort.
- sfx: buzz sur l'appel entrant.

## Frame 2 — Soyons honnêtes

- scene: « Soyons honnêtes. » puis trois cartes-problèmes qui s'empilent en vrac avec badges rouges : « SMS · 3 nouveaux messages » (« Dispo samedi 14h ? », « Je peux décaler ? »), « Messages Insta · 5 » (« Bonjour, c'est possible demain ? »), « Agenda papier » (page griffonnée, rendez-vous rayés) ; puis « ça part dans tous les sens » : les cartes tournent et s'éparpillent ; enfin « Pendant un soin, impossible de décrocher. » avec un compteur rouge « 4 appels manqués ».
- duration: 7.8s
- global_start: 5.6
- transition_in: crossfade
- type: problem
- blueprint: overwhelm-surround (Adapt)
- focal: pile de cartes-problèmes
- roles: aucun asset image (cartes construites, icônes génériques — aucun logo de marque)
- asset_candidates: none
- status: animated
- src: compositions/frames/02-douleur.html
- voiceover: « Soyons honnêtes : les rendez-vous par SMS, les messages Insta, l'agenda papier… ça part dans tous les sens. Et pendant un soin, impossible de décrocher. » (« Soyons honnêtes » 0.1–0.9s ; « SMS » 1.6s ; « messages Insta » 2.2–2.8s ; « agenda papier » 3.0–3.8s ; « dans tous les sens » 4.3–5.0s ; « pendant un soin » 5.6–6.3s ; « impossible de décrocher » 6.4–7.5s)

Scene 1 (0.0–1.0s) : « Soyons honnêtes. » en karaoké au centre, puis remonte en titre (y≈150, 72px).
Scene 2 (1.0–4.0s) : les 3 cartes entrent une par une sur leur mot, inclinées, empilées au centre, badges rouges qui comptent (1→3, 1→5).
Scene 3 (4.0–5.4s) : « ça part dans tous les sens » : les cartes tournent et partent dans des directions différentes (rotations ±25°, flou de mouvement).
Scene 4 (5.4–7.8s) : « Pendant un soin, impossible de décrocher. » en karaoké ; pastille rouge « 4 appels manqués » qui incrémente.
- sfx: tick à chaque carte, whoosh sur l'éparpillement.

## Frame 3 — Avec Reso

- scene: « Avec Reso, » ; un téléphone avec la vraie page de réservation (Maison Alba) : une cliente réserve « même le soir » (pastille « Réservé à 22:47 ») ; puis la vraie capture de l'agenda desktop où le rendez-vous se pose ; puis deux cartes emails réelles « Rappel la veille » et « Demande d'avis » qui se posent devant.
- duration: 9.2s
- global_start: 13.4
- transition_in: crossfade
- type: solution
- blueprint: device-surface-showcase (Adapt)
- focal: les vraies captures Reso
- roles: app-page-publique-mobile = cutout (téléphone) · app-agenda = cutout (fenêtre desktop) · emails-mobile-haut, emails-mobile-avis = supporting (cartes emails) · reservation-mobile-creneaux = supporting (option : écran créneaux)
- asset_candidates: assets/app-page-publique-mobile.png, assets/app-agenda.png, assets/emails-mobile-haut.png, assets/emails-mobile-avis.png, assets/reservation-mobile-creneaux.png
- status: animated
- src: compositions/frames/03-solution.html
- voiceover: « Avec Réso, vos clientes réservent toutes seules, en ligne, même le soir. Tout arrive dans votre agenda, avec le rappel la veille et la demande d'avis après. » (« Avec Réso » 0.1–0.8s ; « réservent toutes seules » 1.3–2.4s ; « même le soir » 3.0–3.6s ; « agenda » 4.9s ; « rappel la veille » 6.0–6.9s ; « demande d'avis » 7.3–8.1s)

Scene 1 (0.0–0.9s) : « Avec Reso, » au centre, logo reso crème qui se forme à côté.
Scene 2 (0.8–3.8s) : titre en haut « Elles réservent toutes seules. » (karaoké) ; le téléphone (page publique réelle) monte à gauche-centre ; pastille « Réservé à 22:47 · Soin visage éclat » éclot à côté sur « même le soir ».
Scene 3 (3.8–6.0s) : le téléphone file à gauche en se réduisant ; la fenêtre agenda (capture réelle) arrive à droite, grande ; un bloc « 11:00 · Julie Martin » s'y pose sur « agenda » ; titre « Tout arrive dans votre agenda. ».
Scene 4 (6.0–9.2s) : deux cartes emails (captures réelles recadrées) se posent devant en éventail : « Rappel · la veille » sur « rappel la veille », « Demande d'avis Google » sur « demande d'avis » ; titre « Rappel la veille. Avis après. ».
- sfx: ding sur la réservation, tick sur chaque carte.

## Frame 4 — Bientôt

- scene: « Mais ce n'est pas tout. » ; trois cartes « à venir », chacune tamponnée « BIENTÔT » : (1) un résultat de recherche générique (barre « esthéticienne Montpellier », premier résultat « Maison Alba · Réserver en ligne », étoiles) ; (2) un assistant IA générique (bulle question « Un institut pour un soin visage à Montpellier ? » → réponse qui cite « Maison Alba — réservable en ligne ») ; (3) un agent IA qui prépare une publication (carte post carré avec photo réelle du salon, légende qui s'écrit, bouton « Programmer »). Chaque carte : sticker « BIENTÔT ».
- duration: 9.0s
- global_start: 22.6
- transition_in: crossfade
- type: roadmap
- blueprint: fixed-anchor-cycle (Adapt)
- focal: les cartes « Bientôt »
- roles: photo-1..4 = supporting (photo du post) · app-page-publique-mobile = supporting (option : vignette de la page dans le résultat)
- asset_candidates: assets/photo-1.png, assets/photo-2.png, assets/photo-3.png, assets/photo-4.png, assets/app-page-publique-mobile.png
- status: animated
- src: compositions/frames/04-bientot.html
- voiceover: « Mais ce n'est pas tout. Bientôt, votre page de réservation sera pensée pour remonter sur Google… et dans les réponses des IA comme ChatGPT. Et des agents IA prépareront vos publications Instagram pour vous. » (« pas tout » 0.6–1.1s ; « Bientôt » 1.3–1.8s ; « remonter sur Google » 3.4–4.6s ; « réponses des IA » 5.0–5.8s ; « agents IA » 6.6–7.3s ; « publications Instagram » 7.6–8.6s)

Scene 1 (0.0–1.2s) : « Mais ce n'est pas tout. » karaoké centré, puis remonte (y≈140) et devient « Bientôt sur Reso… ».
Scene 2 (1.2–4.8s) : carte recherche au centre ; sur « remonter sur Google » le résultat Maison Alba monte en première position ; tampon « BIENTÔT » + légende « Référencement SEO de votre page ».
Scene 3 (4.8–6.6s) : la carte recherche glisse à gauche (réduite) ; carte assistant IA (bulle de question, réponse qui s'écrit et cite Maison Alba) ; tampon « BIENTÔT » + légende « Visible dans les réponses des IA (GEO) ».
Scene 4 (6.6–9.0s) : les deux cartes s'écartent ; carte agent IA au centre (post en préparation, légende qui s'écrit, bouton « Programmer ») ; tampon « BIENTÔT » + légende « Agents IA pour vos publications ».
- sfx: tampon (paper) à chaque sticker.

## Frame 5 — Le café (gag)

- scene: « Et même… » ; carte action « Préparer un café » (icône tasse, sous-ligne « Entre deux clientes · serré »), bouton « Lancer la cafetière » ; le curseur clique, le bouton tremble et passe au rouge « Indisponible », sticker « PAS ENCORE » penché ; texte « Bon ça, j'avoue… » puis « on le fait pas encore. »
- duration: 4.4s
- global_start: 31.6
- transition_in: crossfade
- type: gag
- blueprint: cursor-ui-demo (Adapt)
- focal: carte café
- roles: aucun asset image
- asset_candidates: none
- status: animated
- src: compositions/frames/05-cafe.html
- voiceover: « Et même… vous faire un café entre deux clientes. Bon ça, j'avoue, on le fait pas encore. » (« Et même » 0.1–0.6s ; « un café » 1.1–1.6s ; « entre deux clientes » 1.6–2.4s ; « Bon ça, j'avoue » 2.5–3.2s ; « pas encore » 3.6–4.2s)

Scene 1 (0.0–1.0s) : « Et même… » karaoké en haut ; la carte café se pose au centre.
Scene 2 (1.0–2.5s) : curseur qui vient sur « Lancer la cafetière » et clique à 2.2s.
Scene 3 (2.5–4.4s) : bouton qui tremble (oscillation déterministe), devient rouge « Indisponible » ; tampon « PAS ENCORE » sur « pas encore » (3.7s) ; sous-titre « Bon ça, j'avoue… on le fait pas encore. » en karaoké.
- sfx: tick au clic, buzz léger sur l'échec, paper sur le tampon.

## Frame 6 — Essayez

- scene: « Mais en attendant… » ; « Essayez Reso gratuitement » en grand ; bouton crème « Créer ma page » ; pastilles « 7 jours offerts » et « sans carte bancaire » ; URL « reso-app.fr » ; pastille prix « 39 € HT/mois » ; « Votre page est prête en quelques minutes. » ; le compte à rebours approche 0:00 et passe en rouge vers 45 s.
- duration: 9.0s
- global_start: 36.0
- transition_in: crossfade
- type: cta
- blueprint: cta-morph-press (Adapt)
- focal: bouton « Créer ma page »
- roles: logo-reso-creme = cutout (petit, au-dessus du titre)
- asset_candidates: assets/logo-reso-creme.svg
- status: animated
- src: compositions/frames/06-essai.html
- voiceover: « Mais en attendant, essayez Réso gratuitement pendant sept jours, sans carte bancaire, sur reso-app point f r. Trente-neuf euros hors taxe par mois, et votre page est prête en quelques minutes. » (« en attendant » 0.4–1.0s ; « gratuitement » 1.6–2.3s ; « sept jours » 2.6–3.1s ; « sans carte bancaire » 3.2–4.1s ; « reso-app point f r » 4.3–5.5s ; « trente-neuf euros » 5.7–6.5s ; « quelques minutes » 7.8–8.6s)

Scene 1 (0.0–1.4s) : « Mais en attendant… » puis logo + « Essayez Reso gratuitement » (karaoké, 104px).
Scene 2 (1.4–4.2s) : pastilles « 7 jours offerts » et « sans carte bancaire » qui se posent sur leurs mots ; bouton « Créer ma page » qui se pose.
Scene 3 (4.2–6.6s) : « reso-app.fr » s'écrit sous le bouton (mono crème) ; pastille « 39 € HT/mois » se pose sur « trente-neuf euros ».
Scene 4 (6.6–9.0s) : « Votre page est prête en quelques minutes. » ; le curseur clique « Créer ma page » (pression) ; tenue.
- sfx: tick sur chaque pastille, tick au clic.

## Frame 7 — La chute

- scene: Dialogue en bulles de chat (style messagerie générique, sans logo) : bulle gauche (Céline, avatar « C ») « Attends… t'as vraiment annoncé ChatGPT ? » ; bulle droite (narrateur) « Bientôt ! Mais avoue que ça donne envie. » avec un sticker « BIENTÔT » collé ; puis logo reso + bouton « Créer ma page » + reso-app.fr ; le compte à rebours affiche « +0:0N » en rouge.
- duration: 4.6s
- global_start: 45.0
- transition_in: crossfade
- type: outro
- blueprint: titlecard-reveal (Adapt)
- focal: bulles de dialogue
- roles: logo-reso-creme = cutout
- asset_candidates: assets/logo-reso-creme.svg
- status: animated
- src: compositions/frames/07-chute.html
- voiceover: Céline « Attends… t'as vraiment annoncé ChatGPT ? » (0.0–1.6s) · narrateur « Bientôt ! Mais avoue que ça donne envie. » (1.8–4.4s)

Scene 1 (0.0–1.7s) : bulle gauche qui s'écrit (indicateur « … » puis texte) sur la voix de Céline.
Scene 2 (1.7–3.2s) : bulle droite qui arrive, sticker « BIENTÔT » tamponné sur « Bientôt ».
Scene 3 (3.0–4.6s) : les bulles remontent et se réduisent ; logo reso crème + « Créer ma page » + « reso-app.fr » au centre ; tenue immobile.
- sfx: tick par bulle, logo sonore final.
