---
format: 1920x1080
duration: 67.2s
message: "J'ai 45 secondes pour vous convaincre que Reso est bien mieux que votre téléphone qui sonne en plein soin."
arc: Défi (compte à rebours) → douleur → solution (vraies captures) → bascule « ce n'est que le début » → 3 nouveautés BIENTÔT plein écran (SEO/GEO, agent IA community manager, relance des clientes) → « j'ai dépassé » + CTA → chute en dialogue
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

## Frame 4 — La bascule

- scene: « Mais ce n'est pas tout. » en karaoké ; puis tout s'éteint d'un coup (fond qui passe au bleu nuit `#1F2733` presque noir, la pastille compte à rebours reste seule allumée) ; silence ; puis « Et ça… ce n'est que le début. » apparaît en crème, lettres qui se dévoilent avec une lueur, la fin « le début. » plus grosse ; le fond se rallume en bleu poudré par un balayage lumineux vers la frame suivante.
- duration: 3.9s
- global_start: 24.5
- transition_in: crossfade
- type: reveal
- blueprint: kinetic-type-beats (Adapt)
- focal: « ce n'est que le début »
- roles: aucun asset image
- asset_candidates: none
- status: animated
- src: compositions/frames/04-bascule.html
- voiceover: André « Mais ce n'est pas tout. » 0.1–1.1 (« pas tout » 0.69–1.1) · silence 1.25–2.0 · « Et ça… ce n'est que le début. » 2.03–3.5 (« Et ça » 2.03–2.3 ; « ce n'est que » 2.36–2.95 ; « le début » 2.96–3.5)

Scene 1 (0.0–1.2s) : « Mais ce n'est pas tout. » karaoké centré (110px).
Scene 2 (1.2–2.0s) : coupure : le texte s'efface en 0.12s, le fond tombe au presque noir, seule la pastille reste (elle pulse une fois) — moment de tension (un « riser » monte dans le son).
Scene 3 (2.0–3.5s) : « Et ça… ce n'est que le début. » se dévoile mot à mot avec une lueur crème, « le début. » 1.4× plus gros.
Scene 4 (3.5–3.9s) : balayage de lumière bleu poudré qui rallume le fond (impact sonore) et passe le relais.
- sfx: riser 1.2–2.0, impact à 3.5.

## Frame 5 — Bientôt : une page pensée pour Google et les IA

- scene: Titre « Bientôt » (surligné jaune) + « Votre page, en tête des recherches. » ; une grande barre de recherche générique « esthéticienne Montpellier » ; les résultats tombent ; « Maison Alba · Réserver en ligne » (vignette réelle de la page) monte en première position, badge « N°1 » ; tampon BIENTÔT + légende « Référencement SEO » ; puis la scène bascule vers un assistant IA générique (bulle « Un institut pour un soin visage à Montpellier ? ») dont la réponse s'écrit et cite « Maison Alba — réservable en ligne », la carte de la page apparaît dans la réponse ; tampon BIENTÔT + légende « Recommandée par les IA (GEO) ».
- duration: 7.8s
- global_start: 28.4
- transition_in: crossfade
- type: roadmap
- blueprint: camera-journey (Adapt)
- focal: le résultat Maison Alba puis la réponse de l'assistant
- roles: app-page-publique-mobile = supporting (vignette de la page dans le résultat et la réponse) · photo-1 = supporting
- asset_candidates: assets/app-page-publique-mobile.png, assets/photo-1.png
- status: animated
- src: compositions/frames/05-seo.html
- voiceover: « Bientôt, votre page de réservation sera pensée pour remonter sur Google… et pour apparaître dans les réponses des IA, comme ChatGPT. » (« Bientôt » 0.1–0.6 ; « page de réservation » 0.98–2.0 ; « remonter sur Google » 3.07–4.2 ; « apparaître » 4.59–5.1 ; « réponses des IA » 5.51–6.4 ; « ChatGPT » 6.79–7.46)

Scene 1 (0.0–1.0s) : « Bientôt » tamponné en surligné jaune en haut à gauche, puis « Votre page, en tête des recherches. ».
Scene 2 (0.9–4.3s) : barre de recherche plein écran (grande, 1300px), requête tapée, résultats ; sur « remonter sur Google » le résultat Maison Alba remonte de la 4e à la 1re place (les autres descendent), badge N°1 ; tampon BIENTÔT + « Référencement SEO » à ~4.3.
Scene 3 (4.4–7.8s) : la caméra glisse latéralement vers l'assistant IA (icône bulle neutre, sans logo) ; question, points qui écrivent, réponse qui s'écrit sur « réponses des IA » et cite Maison Alba avec la carte de la page ; tampon BIENTÔT + « Recommandée par les IA (GEO) » sur « ChatGPT » (~7.0).
- sfx: impact sur chaque tampon.

## Frame 6 — Bientôt : votre community manager IA

- scene: Le moment « waouh » : un agent IA (pastille « Agent IA · au travail » avec une petite animation d'activité, sans robot ni cerveau) prend les 4 vraies photos du salon (elles volent depuis une grille « Vos photos »), assemble en direct un **Reel vertical** dans un téléphone (les photos se succèdent en plans, un titre animé « Soin visage éclat ✨ » s'écrit, barre de progression de montage), écrit la légende avec hashtags, puis une vue **calendrier de la semaine** se remplit de publications (Lun « Reel », Mer « Post », Ven « Reel », Dim « Story ») qui se posent une à une avec une coche « Programmé » ; titre final « Votre community manager… qui ne prend jamais de pause. » ; tampon BIENTÔT.
- duration: 8.9s
- global_start: 36.2
- transition_in: crossfade
- type: roadmap
- blueprint: zoom-out-workspace-reveal (Adapt)
- focal: le Reel qui se monte tout seul, puis le calendrier qui se remplit
- roles: photo-1..4 = supporting (photos réelles du salon, matière du Reel et des posts)
- asset_candidates: assets/photo-1.png, assets/photo-2.png, assets/photo-3.png, assets/photo-4.png
- status: animated
- src: compositions/frames/06-agent.html
- voiceover: « Un agent IA créera vos Reels et vos publications à partir de vos photos, et les programmera pour vous. Votre community manager… qui ne prend jamais de pause ! » (« agent IA » 0.25–0.8 ; « Reels » 1.43 ; « publications » 2.15–2.8 ; « vos photos » 3.3–4.0 ; « programmera » 4.53–5.0 ; « pour vous » 4.94–5.4 ; « community manager » 6.03–7.0 ; « qui ne prend jamais de pause » 7.09–8.68)

Scene 1 (0.0–1.2s) : pastille « Agent IA · au travail » apparaît au centre, puis se pose en haut ; titre « Bientôt : un agent IA » (Bientôt surligné jaune).
Scene 2 (1.2–3.9s) : grille « Vos photos » (4 photos réelles) à gauche ; sur « Reels » un téléphone 9:16 à droite ; les photos volent dans le téléphone et le Reel se monte (plans qui défilent, titre animé, barre de progression) ; sur « publications » une carte post carré se forme à côté.
Scene 3 (3.9–6.0s) : zoom arrière : un calendrier de la semaine apparaît ; sur « programmera » les publications s'y posent une à une avec « Programmé ✓ ».
Scene 4 (6.0–8.9s) : titre « Votre community manager… qui ne prend jamais de pause. » en karaoké ; tampon BIENTÔT sur l'ensemble ; le compte à rebours arrive à 0:01 et pulse rouge.
- sfx: whoosh sur les photos qui volent, tick à chaque publication programmée, impact sur le tampon.

## Frame 7 — Bientôt : la relance des clientes

- scene: Une fiche cliente générique « Julie M. · dernière visite il y a 2 mois » (pastille ambre « À relancer ») ; sur « petit message », un SMS/email de relance s'écrit dans une bulle (« Bonjour Julie, cela fait un moment ! Envie d'un soin ? Réservez en un clic : reso-app.fr/r/maison-alba ») et part ; une notification « Julie a réservé · Soin visage éclat » arrive ; tampon BIENTÔT + légende « Relance automatique des clientes ». Le compte à rebours est passé au rouge en « +0:0N ».
- duration: 5.7s
- global_start: 45.1
- transition_in: crossfade
- type: roadmap
- blueprint: cursor-ui-demo (Adapt)
- focal: le message de relance
- roles: aucun asset image (cartes construites)
- asset_candidates: none
- status: animated
- src: compositions/frames/07-relance.html
- voiceover: « Et une cliente qui n'est pas revenue depuis deux mois ? Réso lui enverra un petit message pour reprendre rendez-vous. » (« cliente » 0.32 ; « pas revenue » 0.97–1.4 ; « deux mois » 1.68–2.2 ; « Réso » 2.3 ; « petit message » 3.42–4.0 ; « reprendre rendez-vous » 4.61–5.46)

Scene 1 (0.0–2.2s) : titre « Bientôt » (surligné) ; la fiche cliente glisse, l'étiquette « 2 mois » apparaît sur « deux mois », pastille ambre.
Scene 2 (2.2–4.4s) : sur « petit message » la bulle de relance s'écrit et part (glisse vers la droite) avec un petit son.
Scene 3 (4.4–5.7s) : sur « reprendre rendez-vous » la notification « Julie a réservé » arrive ; tampon BIENTÔT + légende.
- sfx: tick à l'envoi, ding sur la réservation, impact sur le tampon.

## Frame 8 — « J'ai dépassé » et essayez

- scene: « Mais en attendant… » ; « Essayez Reso gratuitement » en grand ; bouton crème « Créer ma page » ; pastilles « 7 jours offerts » et « sans carte bancaire » ; URL « reso-app.fr » ; pastille prix « 39 € HT/mois » ; « Votre page est prête en quelques minutes. » ; le compte à rebours approche 0:00 et passe en rouge vers 45 s.
- duration: 10.2s
- global_start: 50.8
- transition_in: crossfade
- type: cta
- blueprint: cta-morph-press (Adapt)
- focal: bouton « Créer ma page »
- roles: logo-reso-creme = cutout (petit, au-dessus du titre)
- asset_candidates: assets/logo-reso-creme.svg
- status: animated
- src: compositions/frames/06-essai.html
- voiceover: André « Bon… j'ai dépassé. Mais ça valait le coup ! En attendant, essayez Réso gratuitement pendant sept jours, sans carte bancaire, sur reso-app.fr. » — temps locaux réels : « Bon » 0.1 ; « j'ai dépassé » 0.53–1.4 ; « Mais ça valait le coup » 1.65–2.7 ; « En attendant » 2.82–3.5 ; « essayez » 3.62 ; « Réso » 4.05 ; « gratuitement » 4.37–4.9 ; « sept jours » 5.17–5.9 ; « sans carte bancaire » 5.92–7.0 ; « reso-app.fr » 7.13–9.1 ; tenue jusqu'à 10.2. (Le prix n'est plus dit mais la pastille « 39 € HT/mois » reste affichée.)

Scene 1 (0.0–1.4s) : « Mais en attendant… » puis logo + « Essayez Reso gratuitement » (karaoké, 104px).
Scene 2 (1.4–4.2s) : pastilles « 7 jours offerts » et « sans carte bancaire » qui se posent sur leurs mots ; bouton « Créer ma page » qui se pose.
Scene 3 (4.2–6.6s) : « reso-app.fr » s'écrit sous le bouton (mono crème) ; pastille « 39 € HT/mois » se pose sur « trente-neuf euros ».
Scene 4 (6.6–9.0s) : « Votre page est prête en quelques minutes. » ; le curseur clique « Créer ma page » (pression) ; tenue.
- sfx: tick sur chaque pastille, tick au clic.


**v2** : nouvelle ouverture « Bon… j'ai dépassé. » — la pastille du compte à rebours (déjà rouge, « +0:06 ») grossit au centre de l'écran en tremblant, puis « Mais ça valait le coup ! » (clin d'œil) ; elle revient en haut à droite et la suite de la frame existante (« Essayez Reso gratuitement », pastilles, bouton, URL, prix, clic) se recale sur « En attendant… » (2.82 s). Supprimer « Mais en attendant… » et la phrase « Votre page est prête en quelques minutes ».

## Frame 9 — La chute

- scene: Dialogue en bulles de chat (style messagerie générique, sans logo) : bulle gauche (Céline, avatar « C ») « Attends… t'as vraiment annoncé ChatGPT ? » ; bulle droite (narrateur) « Bientôt ! Mais avoue que ça donne envie. » avec un sticker « BIENTÔT » collé ; puis logo reso + bouton « Créer ma page » + reso-app.fr ; le compte à rebours affiche « +0:0N » en rouge.
- duration: 6.2s
- global_start: 61.0
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

**v2** : seul le `global_start` change (61.0) : le compte à rebours affiche +0:16 → +0:22. Mêmes temps de voix locaux.

