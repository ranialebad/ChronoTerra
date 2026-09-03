import kaboom from "https://unpkg.com/kaboom@3000.1.17/dist/kaboom.mjs";

kaboom({
  background: [200, 225, 245],
  width: 960,
  height: 540,
  letterbox: true,
});

// -------------------- Helpers --------------------
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmtPct = (x) => `${Math.round(x * 100)}%`;
const MAX_LOOPS = 7;
// ✅ "once" compatible toutes versions : s'auto-désactive après 1 pression
function keyOnce(key, fn) {
  const h = onKeyPress(key, () => {
    h.cancel();   // supprime le handler
    fn();
  });
  return h;
}


function worldDarkness(state) {
  // 0 = clair, 1 = sombre
  const co2 = clamp(state.co2 ?? 0.25, 0, 1);
  const loops = clamp((state.loops ?? 0) / MAX_LOOPS, 0, 1);
  // CO2 pèse plus, boucles ajoutent un peu de noirceur
  return clamp(co2 * 0.8 + loops * 0.2, 0, 1);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function worldColor(state) {
  const t = worldDarkness(state);
  // clair (début) -> sombre (fin)
  const r = Math.round(lerp(200, 12, t));
  const g = Math.round(lerp(225, 16, t));
  const b = Math.round(lerp(245, 30, t));
  return rgb(r, g, b);
}

// ✅ FIX: le fond est détruit à chaque go(scene)
// donc on le (re)crée au besoin DANS CHAQUE scène
function ensureBG(state) {
  if (!state) return;
  if (!state.bg || !state.bg.exists()) {
    state.bg = add([
      rect(width(), height()),
      pos(0, 0),
      fixed(),
      z(-9999),
      color(worldColor(state)),
    ]);

    state.bg.onUpdate(() => {
      state.bg.color = worldColor(state);
    });
  }
}

function applyDelta(state, delta) {
  state.co2 = clamp(state.co2 + (delta.co2 ?? 0), 0, 1);
  state.bio = clamp(state.bio + (delta.bio ?? 0), 0, 1);
  state.well = clamp(state.well + (delta.well ?? 0), 0, 1);
}

// -------------------- UI --------------------
function drawHUD(state, subtitle = "") {
  add([text("ChronoTerra", { size: 16 }), pos(24, 10), color(180, 180, 210), fixed()]);
  add([text(subtitle, { size: 14 }), pos(24, 30), color(160, 160, 190), fixed()]);

  const t = add([text("", { size: 16 }), pos(24, 56), fixed()]);
  t.onUpdate(() => {
    t.text =
      `CO₂ ${fmtPct(state.co2)}   Biodiv ${fmtPct(state.bio)}   Bien-être ${fmtPct(state.well)}   Boucles ${state.loops}`;
  });

  
}

// -------------------- STORY NODES --------------------
function getStoryNode(nodeId, state) {
  const loops = state.loops ?? 0;

  const base = {
    prehistory: {
      title: "Préhistoire",
      text: "Tout est gratuit, personne ne scrolle, et la planète respire. Profite : c'est une phase.\nTu as un pouvoir immense : poser les bases d'une trajectoire (et, accessoirement, ruiner tout).",
      fact: "Les écosystèmes régulent l'eau, les sols et une partie du climat.",
      choices: [
        {
          label: "Chasser sans limite (YOLO)",
          delta: { bio: -0.14, well: +0.08 },
          consequence: "Moins d'animaux, plus de barbecue. L'histoire commence bien.",
          nextNode: "agriculture",
        },
        {
          label: "Chasser avec modération (rare concept)",
          delta: { bio: -0.05, well: +0.04 },
          consequence: "Tu viens d'inventer la retenue. Personne ne te croira plus tard.",
          nextNode: "agriculture",
        },
      ],
    },

    agriculture: {
      title: "Révolution agricole",
      text: "Tu découvres l'agriculture : nourrir plus de monde, au prix de quelques forêts. Détail.\nLe futur adore ce genre de détails.",
      fact: "L'expansion agricole est une cause majeure de perte de biodiversité.",
      choices: [
        {
          label: "Défricher massivement",
          delta: { co2: +0.06, bio: -0.16, well: +0.12 },
          consequence: "Efficace. Radical. Les arbres n'ont pas signé.",
          nextNode: "antiquity",
        },
        {
          label: "Défricher avec limites (compromis tiède)",
          delta: { co2: +0.03, bio: -0.08, well: +0.09 },
          consequence: "Personne n'est vraiment content. Donc probablement plus durable.",
          nextNode: "antiquity",
        },
      ],
    },

    antiquity: {
      title: loops === 0 ? "Antiquité & Empires" : `Antiquité & Empires (retour ${loops})`,
      text: loops === 0
        ? "Commerce, villes, infrastructures : la civilisation s'installe. Et la pression sur les ressources aussi."
        : "Te revoilà. Oui, c'est encore l'Antiquité. C'est ça, ton 'plan B'.\nSpoiler : la trajectoire est déjà abîmée, mais tu t'obstines. Respect.",
      fact: "Urbanisation et extraction augmentent la pression sur les écosystèmes.",
      choices: [
        {
          label: "Construire partout, vite, grand (pour la gloire)",
          delta: { co2: +0.05, bio: -0.10, well: +0.07 },
          consequence: "La gloire est éternelle… sauf quand il n'y a plus de ressources.",
          nextNode: "industrial_story",
        },
        {
          label: "Réguler un peu (oui, déjà)",
          delta: { co2: +0.02, bio: -0.04, well: +0.05 },
          consequence: "Tu viens d'inventer une politique publique. Les scribes n'en reviennent pas.",
          nextNode: "industrial_story",
        },
      ],
    },

    industrial_story: {
      title: loops === 0 ? "Révolution industrielle" : "Révolution industrielle - à nouveau",
      text: loops === 0
        ? "Charbon, usines, productivité. L'air devient épais mais le PIB est ravi."
        : "On rejoue l'industrialisation. Cette fois, sans illusion et avec moins de marge.",
      fact: "Les combustibles fossiles augmentent fortement les émissions de CO₂ et la pollution de l'air.",
      choices: [
        {
          label: "Lancer la machine : on industrialise à vitesse grand V",
          delta: {},
          consequence: "Tu appuies sur 'Accélérer'. Le système te remercie (et te juge).",
          nextScene: "mg_industrial_narration",
        },
      ],
    },

    present_A: {
      title: loops === 0 ? "Croissance fossile verrouillée" : "Toujours plus vite",
      text: "Le monde 'fonctionne'. Surtout pour ceux qui ne respirent pas trop près des zones industrielles.\nLa question n'est pas 'faut-il changer ?' mais 'jusqu'où peut-on repousser la facture ?'",
      fact: "Les solutions uniquement compensatoires traitent souvent les symptômes, pas la cause.",
      choices: [
        {
          label: "Investir dans la compensation technologique (captage, offset, promesses)",
          delta: { co2: -0.03, bio: -0.02, well: +0.04 },
          consequence: "Tu gagnes du temps. Comme on gagne du temps sur une fuite d'eau avec du scotch.",
          nextScene: "mg_lobby_narration",
        },
        {
          label: "Protéger les zones stratégiques, sacrifier le reste",
          delta: { bio: -0.06, well: +0.03 },
          consequence: "Tout le monde n'est pas protégé. Mais les rapports sont 'optimisés'.",
          nextScene: "mg_lobby_narration",
        },
        {
          label: "Maintenir la croissance coûte que coûte",
          delta: { co2: +0.06, bio: -0.05, well: +0.06 },
          consequence: "Ça tient. Jusqu'à ce que ça ne tienne plus. Très conceptuel.",
          nextScene: "mg_lobby_narration",
        },
      ],
    },

    present_B: {
      title: loops === 0 ? "Transition tardive et conflictuelle" : "Fatigue collective",
      text: "La transition a commencé. Elle coûte cher, elle divise, et elle arrive tard.\nLa question devient : qui fait l'effort, et qui a le droit de se plaindre ?",
      fact: "Agir tard peut rendre les mesures plus brutales et moins acceptées.",
      choices: [
        {
          label: "Accélérer malgré l'opposition (mesures fortes)",
          delta: { co2: -0.06, bio: +0.02, well: -0.03 },
          consequence: "Tu fais baisser les courbes. Tu fais monter les tensions.",
          nextScene: "mg_pressure_narration",
        },
        {
          label: "Compromis politiques (exceptions, transitions partielles)",
          delta: { co2: -0.02, bio: -0.01, well: +0.02 },
          consequence: "Tout le monde est un peu mécontent. Donc tout le monde signe. Classique.",
          nextScene: "mg_pressure_narration",
        },
        {
          label: "Ralentir pour préserver l'économie",
          delta: { co2: +0.04, bio: -0.03, well: +0.05 },
          consequence: "Soulagement immédiat. Le futur adore ton sens du timing.",
          nextScene: "mg_pressure_narration",
        },
      ],
    },

    present_C: {
      title: loops === 0 ? "Sobriété forcée et tensions sociales" : "La contrainte s'installe",
      text: "Les émissions baissent réellement. Le confort et les libertés aussi.\nLa question n'est plus technique : elle est politique. Jusqu'où imposer pour survivre ?",
      fact: "Des réponses rapides et efficaces peuvent entraîner des tensions sociales et politiques.",
      choices: [
        {
          label: "Rationnement strict (quotas obligatoires)",
          delta: { co2: -0.06, bio: +0.02, well: -0.04 },
          consequence: "Efficace. Brutal. Tu stabilises des courbes, pas des relations.",
          nextScene: "mg_pressure_narration",
        },
        {
          label: "Contrôle et sanctions (surveillance des usages)",
          delta: { co2: -0.05, well: -0.05 },
          consequence: "Ça marche. Et ça change la société. Définitivement.",
          nextScene: "mg_pressure_narration",
        },
        {
          label: "Prioriser certains usages et certains groupes",
          delta: { bio: +0.01, well: -0.03 },
          consequence: "Tu répartis. Et tu crées des perdants. Ils vont le remarquer.",
          nextScene: "mg_pressure_narration",
        },
      ],
    },
  };
  return base[nodeId];
}

// -------------------- BRIEFING PAGES --------------------
// -------------------- BRIEFING PAGES (2 PAGES) --------------------
function createNarrationPage(narration, nextPage, state) {
  ensureBG(state);
  
  // Fond très sombre pour focus sur le texte
  add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(0.8),
    fixed(),
    z(50)
  ]);
  
  // Texte de narration centré
  add([
    text(narration, {
      size: 22,
      width: width() - 100,
      lineSpacing: 14
    }),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(240, 245, 255),
    fixed(),
    z(52)
  ]);
  
  // Prompt minimal en bas
  const prompt = add([
    text("ESPACE pour continuer", {
      size: 16
    }),
    pos(width() / 2, height() - 50),
    anchor("center"),
    color(180, 190, 220),
    fixed(),
    z(52)
  ]);
  
  // Animation très subtile
  let blink = true;
  loop(1.2, () => {
    blink = !blink;
    prompt.opacity = blink ? 1 : 0.2;
  });
  
  // Navigation
  keyOnce("space", () => go(nextPage, { state }));
  onKeyPress("escape", () => go("story", { nodeId: "industrial_story", state }));
}

function createInstructionsPage(instructions, controls, nextScene, state) {
  ensureBG(state);
  
  // Fond plus léger
  add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(0.7),
    fixed(),
    z(50)
  ]);
  
  // Titre INSTRUCTIONS
  add([
    text("COMMENT JOUER", {
      size: 28,
      font: "monospace",
      letterSpacing: 1
    }),
    pos(width() / 2, 120),
    anchor("center"),
    color(220, 230, 250),
    fixed(),
    z(52)
  ]);
  
  // Instructions (objectif/but du jeu)
  add([
    text(instructions, {
      size: 20,
      width: width() - 120,
      lineSpacing: 12
    }),
    pos(width() / 2, 200),
    anchor("center"),
    color(220, 230, 250),
    fixed(),
    z(52)
  ]);
  
  // Séparateur
  add([
    rect(width() - 150, 1),
    pos(width() / 2, 280),
    anchor("center"),
    color(80, 90, 120),
    fixed(),
    z(52)
  ]);
  
  // Titre CONTRÔLES
  add([
    text("CONTRÔLES", {
      size: 24,
      font: "monospace",
      letterSpacing: 1
    }),
    pos(width() / 2, 320),
    anchor("center"),
    color(220, 230, 250),
    fixed(),
    z(52)
  ]);
  
  // Contrôles
  add([
    text(controls, {
      size: 20,
      width: width() - 120,
      lineSpacing: 10
    }),
    pos(width() / 2, 380),
    anchor("center"),
    color(220, 230, 250),
    fixed(),
    z(52)
  ]);
  
  // Prompt
  const prompt = add([
    text("ESPACE pour commencer", {
      size: 18
    }),
    pos(width() / 2, height() - 60),
    anchor("center"),
    color(180, 190, 220),
    fixed(),
    z(52)
  ]);
  
  // Animation
  let blink = true;
  loop(0.8, () => {
    blink = !blink;
    prompt.opacity = blink ? 1 : 0.3;
  });
  
  // Navigation
  keyOnce("space", () => go(nextScene, { state }));
  onKeyPress("escape", () => go("story", { nodeId: "industrial_story", state }));
}

// -------------------- SCENES DE BRIEFING (2 PAGES CHACUNE) --------------------

// 1. INDUSTRIALISATION
scene("mg_industrial_narration", ({ state }) => {
  const narration = "Tu viens d'inventer la machine.\n\nElle transforme tout :\nle travail, les villes, le confort…\net l'atmosphère.\n\nOn va te demander de « gérer »\nce qui tombe du ciel.\n\nQuand tout s'accélère, \nque choisis-tu de laisser passer ?";
  
  createNarrationPage(narration, "mg_industrial_instructions", state);
});

scene("mg_industrial_instructions", ({ state }) => {
  const instructions = "Des blocs tombent.\n\nCertains renforcent le système.\nD'autres l'enferment.\n\nAttrape-les.\nOu laisse-les passer.";
  
  const controls = "← / → ou A / D : se déplacer";
  
  createInstructionsPage(instructions, controls, "minigame_industry", state);
});

// 2. COULOIRS DU POUVOIR
scene("mg_lobby_narration", ({ state }) => {
  const narration = "Ici, le futur ne se décide\npas en public.\n\nIl se négocie :\ndans des phrases,\ndes exceptions,\ndes délais.\n\nTon travail : faire passer\nun texte.\n\nLe problème : qu'il dise\nencore quelque chose.";
  
  createNarrationPage(narration, "mg_lobby_instructions", state);
});

scene("mg_lobby_instructions", ({ state }) => {
  const instructions = "Tu circules dans un bâtiment.\n\nTu ramasses ce qui renforce le texte.\nTu évites ce qui le vide.\n\nObjectif : 3 clauses valides.";
  
  const controls = "WASD / Flèches : bouger\nShift : courir\nEspace : dash\nE : interagir";
  
  createInstructionsPage(instructions, controls, "minigame_lobby", state);
});

// 3. LE PRÉSENT SOUS PRESSION
scene("mg_pressure_narration", ({ state }) => {
  const narration = "La transition est en cours.\n\nTout arrive en même temps.\n\nPlus tu attends,\nplus ça frappe fort.\n\nTu n'as pas à gagner.\nTu dois tenir.";
  
  createNarrationPage(narration, "mg_pressure_instructions", state);
});

scene("mg_pressure_instructions", ({ state }) => {
  const instructions = "Des menaces arrivent\nde toutes parts.\n\nÉvite-les.\nGagne du temps.";
  
  const controls = "WASD / Flèches : se déplacer\nShift : mouvement précis\nEspace : dash";
  
  createInstructionsPage(instructions, controls, "minigame_bullethell", state);
});

// 4. FUTUR — TRIAGE
scene("mg_triage_narration", ({ state }) => {
  const narration = "Les émissions ont baissé.\n\nPas les conséquences.\n\nCe qui reste à faire\nn'est plus technique.\n\nC'est du tri.";
  
  createNarrationPage(narration, "mg_triage_instructions", state);
});

scene("mg_triage_instructions", ({ state }) => {
  const instructions = "Des abris entrent en crise.\nTu as peu de ressources.\nPas assez pour tous.\n\nChaque choix en sauve certains.\nEt en sacrifie d'autres.";
  
  const controls = "Clic : prendre une ressource\nGlisser : l'attribuer\nCliquer un abri : le sélectionner\nCANNIBALISER : sacrifier un abri pour récupérer des ressources";
  
  createInstructionsPage(instructions, controls, "future_triage", state);
});









// -------------------- TITLE SCREEN --------------------
scene("title", ({ state }) => {
  // Fond dynamique
  const bg = add([
    rect(width(), height()),
    pos(0, 0),
    fixed(),
    z(-1000),
    color(worldColor(state)),
  ]);

  // voile sombre pour lisibilité
  add([
    rect(width(), height()),
    pos(0, 0),
    fixed(),
    z(-900),
    color(0, 0, 0),
    opacity(0.18),
  ]);

  // Animation lente du fond (respiration)
  let t = 0;
  bg.onUpdate(() => {
    t += dt();
    const pulse = 1 + Math.sin(t * 0.4) * 0.02;
    bg.scale = vec2(pulse);
    bg.color = worldColor(state);
  });

  // helper texte avec ombre (lisibilité)
  function shadowText(str, opts, p, mainCol = rgb(245, 248, 255), shadowCol = rgb(0, 0, 0), off = vec2(3, 3), zIndex = 10) {
    add([
      text(str, opts),
      pos(p.x + off.x, p.y + off.y),
      anchor("center"),
      color(shadowCol),
      fixed(),
      z(zIndex),
      opacity(0.55),
    ]);
    return add([
      text(str, opts),
      pos(p),
      anchor("center"),
      color(mainCol),
      fixed(),
      z(zIndex + 1),
    ]);
  }

  // Titre principal
  shadowText("CHRONOTERRA", { size: 64, letterSpacing: 4 }, vec2(width() / 2, 170));

  // Sous-titre
  shadowText(
    "un jeu sur le temps, les choix, et l’inertie",
    { size: 18, letterSpacing: 1 },
    vec2(width() / 2, 220),
    rgb(200, 210, 230),
    rgb(0, 0, 0),
    vec2(2, 2),
    20
  );

  // Texte narratif (cynique)
  shadowText(
    "Tu ne choisis pas le futur.\nTu verrouilles une trajectoire.",
    { size: 22, lineSpacing: 8 },
    vec2(width() / 2, 290),
    rgb(235, 238, 250),
    rgb(0, 0, 0),
    vec2(2, 2),
    20
  );

  // Instructions (plus lisibles)
  shadowText(
    "ESPACE — Commencer",
    { size: 20 },
    vec2(width() / 2, 390),
    rgb(245, 248, 255),
    rgb(0, 0, 0),
    vec2(2, 2),
    30
  );

  shadowText(
    "I — Introduction",
    { size: 16 },
    vec2(width() / 2, 425),
    rgb(200, 210, 230),
    rgb(0, 0, 0),
    vec2(2, 2),
    30
  );

  // Petit clignotement
  const blinkArrow = add([
    text("▸", { size: 22 }),
    pos(width() / 2 - 160, 388),
    anchor("center"),
    color(245, 248, 255),
    fixed(),
    z(31),
  ]);

  let blink = true;
  loop(0.6, () => {
    blink = !blink;
    blinkArrow.opacity = blink ? 1 : 0.2;
  });

    // Inputs (IMPORTANT: Once pour éviter les handlers qui se cumulent)
 keyOnce("space", () => {
  go("intro_1", { state });
});

keyOnce("i", () => {
  go("intro_1", { state });
});
});






// -------------------- INTRO SCENES --------------------
// 👉 Colle ces 3 scènes juste après scene("title") et avant scene("story")

function introCard(title, body, footer = "") {
  // Overlay sombre pour la lisibilité
  add([
    rect(width(), height()),
    pos(0, 0),
    fixed(),
    color(0, 0, 0),
    opacity(0.35),
    z(50),
  ]);

  // Carte centrale
  add([
    rect(860, 360),
    pos(width() / 2, height() / 2 + 10),
    anchor("center"),
    fixed(),
    color(18, 22, 34),
    opacity(0.92),
    outline(2, rgb(90, 105, 140)),
    z(60),
  ]);

  add([
    text(title, { size: 30 }),
    pos(width() / 2, 150),
    anchor("center"),
    fixed(),
    color(240, 245, 255),
    z(70),
  ]);

  add([
    text(body, { size: 20, width: 780, lineSpacing: 10 }),
    pos(width() / 2, 245),
    anchor("center"),
    fixed(),
    color(220, 230, 245),
    z(70),
  ]);

  if (footer) {
    add([
      text(footer, { size: 16 }),
      pos(width() / 2, 430),
      anchor("center"),
      fixed(),
      color(190, 200, 220),
      z(70),
    ]);
  }

  // Petit hint en bas (lisible)
  add([
    text("ESPACE : continuer    |    ECHAP : revenir au titre", { size: 16 }),
    pos(width() / 2, height() - 40),
    anchor("center"),
    fixed(),
    color(230, 230, 240),
    z(70),
  ]);
}

scene("intro_1", ({ state }) => {
  ensureBG(state);

  introCard(
    "INTRO — Le pacte",
    "Bienvenue dans CHRONOTERRA.\n\n" +
      "Ici, tu ne “choisis” pas le futur.\n" +
      "Tu crées des conditions qui rendent certains futurs… inévitables.\n\n" +
      "Chaque époque te donne des options.\n" +
      "Elles ont l’air petites.\n" +
      "Elles s’accumulent.",
    "Ton seul super-pouvoir : décider avant que ce soit trop tard (spoiler : c’est déjà tard)."
  );

  // ✅ IMPORTANT: Once (sinon ça se cumule et ça bug)
  keyOnce("space", () => go("intro_2", { state }));
keyOnce("escape", () => go("title", { state }));

});

scene("intro_2", ({ state }) => {
  ensureBG(state);

  introCard(
    "INTRO — Comment tu “perds”",
    "Tu vas voir des mini-jeux.\n\n" +
      "Ils ne sont pas là pour te “récompenser”.\n" +
      "Ils sont là pour te montrer l’inertie :\n" +
      "- tu rates,\n" +
      "- tu reviens en arrière,\n" +
      "- mais le monde n’est plus exactement le même.\n\n" +
      "Et parfois… tu gagnes quand même, mais c’est une victoire sale.",
    "Boucler = apprendre, mais aussi s’épuiser. Et l’épuisement, ça gagne souvent."
  );

  keyOnce("space", () => go("intro_3", { state }));
  keyOnce("escape", () => go("title", { state }));
});

scene("intro_3", ({ state }) => {
  ensureBG(state);

  introCard(
    "INTRO — Ton tableau de bord",
    "En haut, tu verras :\n\n" +
      "CO₂ : plus c’est haut, plus le monde s’assombrit.\n" +
      "Biodiv : plus c’est bas, plus les pertes deviennent irréversibles.\n" +
      "Bien-être : plus c’est bas, plus la société se fissure.\n" +
      "Boucles : chaque retour en arrière a un prix.\n\n" +
      "Quand tu es prêt·e : commence par la Préhistoire.",
    "Dernier conseil : si tout semble “gérable”, c’est que tu ne regardes pas au bon endroit."
  );

  keyOnce("space", () => {
    go("story", { nodeId: "prehistory", state });
  });

  keyOnce("escape", () => go("title", { state }));
});



// -------------------- Ending Scene (Trop de boucles) --------------------
scene("ending_too_many_loops", ({ state }) => {
  ensureBG(state);
  
  // Fond très sombre (comme épuisé)
  add([
    rect(width(), height()),
    pos(0, 0),
    color(10, 10, 15),
    opacity(0.92),
    fixed(),
    z(100)
  ]);
  
  // Titre principal
  add([
    text("TERMINÉ", { 
      size: 68,
      font: "monospace",
      weight: "bold"
    }),
    pos(width() / 2, 100),
    anchor("center"),
    color(255, 120, 120),
    fixed(),
    z(110)
  ]);
  
  // Sous-titre explicatif
  add([
    text("La Terre n'a pas autant de secondes chances", { 
      size: 24
    }),
    pos(width() / 2, 170),
    anchor("center"),
    color(220, 150, 150),
    fixed(),
    z(110)
  ]);
  
  // Message principal
  add([
    text(
      `Tu as utilisé ${state.loops} boucles temporelles.\n\n` +
      "Chaque retour en arrière semblait innocent.\n" +
      "Mais à force de 'recommencer',\n" +
      "tu as épuisé les ressources du système.\n" +
      "Tu as épuisé ton capital politique.\n" +
      "Tu as épuisé la patience du climat.\n\n" +
      "Maintenant, il n'y a plus de 'retry'.\n" +
      "La réalité n'a pas de bouton 'reset' infini.",
      { 
        size: 20,
        width: width() - 120,
        lineSpacing: 10
      }
    ),
    pos(width() / 2, 240),
    anchor("center"),
    color(220, 200, 200),
    fixed(),
    z(110)
  ]);
  
  // Stats finales
  const co2 = Math.round((state.co2 ?? 0.25) * 100);
  const bio = Math.round((state.bio ?? 0.8) * 100);
  const well = Math.round((state.well ?? 0.4) * 100);
  
  add([
    text(`État du monde — CO₂: ${co2}% | Biodiv: ${bio}% | Bien-être: ${well}%`, { 
      size: 18
    }),
    pos(width() / 2, 380),
    anchor("center"),
    color(200, 180, 180),
    fixed(),
    z(110)
  ]);
  
  // Bouton recommencer
  const restartBtn = add([
    rect(350, 60),
    pos(width() / 2, 450),
    anchor("center"),
    color(60, 30, 30),
    outline(2, rgb(200, 100, 100)),
    area(),
    "restart_btn",
    fixed(),
    z(110)
  ]);
  
  add([
    text("ACCEPTER ET RECOMMENCER", { 
      size: 22,
      font: "monospace",
      letterSpacing: 1
    }),
    pos(width() / 2, 450),
    anchor("center"),
    color(250, 200, 200),
    fixed(),
    z(111)
  ]);
  
  // Animation légère du bouton (pulsation lente)
  let btnScale = 1;
  restartBtn.onUpdate(() => {
    btnScale = 1 + Math.sin(time() * 1.2) * 0.02;
    restartBtn.scale = vec2(btnScale);
  });
  
  // Effet de survol
  onHover("restart_btn", (btn) => {
    btn.color = rgb(80, 40, 40);
    btn.outline.color = rgb(255, 120, 120);
  });
  
  onHoverEnd("restart_btn", (btn) => {
    btn.color = rgb(60, 30, 30);
    btn.outline.color = rgb(200, 100, 100);
  });
  
  // Actions
  onClick("restart_btn", () => {
    beep("bad");
    go("start"); // Recommence complètement
  });
  
  onKeyPress("space", () => {
    go("start"); // Recommence complètement
  });
  
  // Instruction
  add([
    text("ESPACE ou clic pour accepter et recommencer", { 
      size: 16
    }),
    pos(width() / 2, 520),
    anchor("center"),
    color(180, 150, 150),
    fixed(),
    z(110)
  ]);
});



// -------------------- Story Scene --------------------
scene("story", ({ nodeId, state }) => {
  ensureBG(state);
  const n = getStoryNode(nodeId, state);
  
  // Fin si trop de boucles
  if ((state.loops ?? 0) >= MAX_LOOPS) {
    return go("ending_too_many_loops", { state });
  }
  
  drawHUD(state, "Narration");
  
  add([text(n.title, { size: 34 }), pos(24, 120)]);
  add([text(n.text, { size: 18, width: 900 }), pos(24, 175), color(230, 230, 240)]);
  
  const info = add([text("", { size: 16, width: 900 }), pos(24, 275), color(200, 200, 220)]);
  
  if (state.lastMessage) {
    add([text(state.lastMessage, { size: 16, width: 900 }), pos(24, 315), color(210, 210, 240)]);
    state.lastMessage = "";
  }
  
  let y = 360;
  n.choices.forEach((choice) => {
    add([rect(900, 50), pos(24, y), area(), color(40, 55, 90), outline(2), "choice", { choiceData: choice }]);
    add([text(choice.label, { size: 18, width: 860 }), pos(40, y + 14)]);
    y += 74;
  });
  
  onClick("choice", (b) => {
    const c = b.choiceData;
    state.bhBonus = null;
    
    if (nodeId === "present_C") {
      if (c.label.startsWith("Rationnement strict")) state.bhBonus = "C_GOOD";
      else if (c.label.startsWith("Prioriser certains usages")) state.bhBonus = "C_OK";
    }
    
    applyDelta(state, c.delta ?? {});
    info.text = (c.consequence ? c.consequence + "\n" : "") + (n.fact ?? "");
    
    wait(0.8, () => {
      if (c.nextScene) {
        go(c.nextScene, { state });
        return;
      }
      go("story", { nodeId: c.nextNode, state });
    });
  });
});









// -------------------- Mini-jeu #1: Industrie (SAFE MODE) --------------------
scene("minigame_industry", ({ state }) => {
  ensureBG(state);
  drawHUD(state, "Industrialisation");

  // --- Zone de jeu (cadre) ---
  const PLAY_TOP = 140;
  const PLAY_BOTTOM = height() - 40;
  const PLAY_LEFT = 40;
  const PLAY_RIGHT = width() - 40;

  const W = PLAY_RIGHT - PLAY_LEFT;
  const H = PLAY_BOTTOM - PLAY_TOP;

  add([
    rect(W, H),
    pos(PLAY_LEFT, PLAY_TOP),
    anchor("topleft"),
    color(12, 14, 22),
    opacity(0.65),
    outline(2, rgb(70, 85, 120)),
  ]);

  // scanlines légères (style)
  for (let y = PLAY_TOP + 6; y < PLAY_BOTTOM; y += 10) {
    add([rect(W, 1), pos(PLAY_LEFT, y), color(255, 255, 255), opacity(0.03)]);
  }

  // --- HUD MG1 minimal (ne donne pas la règle) ---
  let good = 0;
  let bad = 0;
  let timeLeft = 20;

  const info = add([text("", { size: 18 }), pos(24, 160), color(200, 200, 220)]);

  const goodMessages = [
    "Transition propre (+1 illusion)",
    "Efficacité énergétique (applaudissements polis)",
    "Régulation tardive mais sincère",
    "Tu ralentis un peu la machine",
    "Le système tousse, mais continue",
  ];

  const badMessages = [
    "Inertie fossile renforcée",
    "Encore du charbon. Original.",
    "Croissance d'abord, climat après",
    "Externalités ? Quelles externalités ?",
    "Le futur va adorer ça",
  ];

  let feedback = null;
  function showMessage(msg, col) {
    if (feedback) destroy(feedback);
    feedback = add([text(msg, { size: 20 }), pos(width() / 2, height() / 2), anchor("center"), color(col)]);
    wait(1, () => feedback && destroy(feedback));
  }

  const player = add([rect(80, 30), pos(width() / 2 - 40, height() - 80), area(), color(120, 180, 255), "player"]);

  onUpdate(() => {
    if (isKeyDown("left") || isKeyDown("a")) player.move(-600, 0);
    if (isKeyDown("right") || isKeyDown("d")) player.move(600, 0);

    player.pos.x = clamp(player.pos.x, 0, width() - 80);
    info.text = `Temps: ${timeLeft}s   Vert: ${good}   Rouge: ${bad}`;
  });

  function spawn(kind) {
    const obj = add([
      rect(40, 40),
      pos(rand(PLAY_LEFT, PLAY_RIGHT - 40), PLAY_TOP - 40),
      area(),
      color(kind === "good" ? rgb(80, 220, 140) : rgb(220, 80, 80)),
      kind,
    ]);

    obj.onUpdate(() => {
      obj.move(0, 300);
      if (obj.pos.y > PLAY_BOTTOM + 40) destroy(obj);
    });
  }

  onCollide("player", "good", (p, g) => {
    good += 1;
    beep("good");
    showMessage(pick(goodMessages), rgb(100, 220, 160));
    destroy(g);
  });

  onCollide("player", "bad", (p, b) => {
    bad += 1;
    beep("bad");
    showMessage(pick(badMessages), rgb(220, 100, 100));
    destroy(b);
  });

  loop(0.8, () => spawn(Math.random() < 0.5 ? "good" : "bad"));

  loop(1, () => {
    timeLeft -= 1;
    if (timeLeft <= 0) {
      const diff = good - bad;

      // AJOUT : Cas spécial pour 0 rouge et 0 vert (inaction totale)
      if (good === 0 && bad === 0) {
        state.presentType = "D"; // Nouveau type pour inaction
        state.lastMessage = "Ne pas faire de choix, ne pas agir...\nC'est aussi un choix.";
        go("inaction_end", { state }); // Nouvelle scène pour l'inaction
        return; // Important : quitter la fonction ici
      }

      // Logique originale pour les autres cas
      if (diff <= -1) state.presentType = "A";
      else if (diff <= 1) state.presentType = "B";
      else state.presentType = "C";

      state.lastMessage = "Tu n'as pas choisi un futur.\nTu as verrouillé une trajectoire.";
      go("present_router", { state });
    }
  });
});

// -------------------- Present Router --------------------
scene("present_router", ({ state }) => {
  ensureBG(state);
  
  // AJOUT : Gestion du type D (inaction)
  if (state.presentType === "D") {
    // Créer un présent spécial pour l'inaction
    state.presentType = "A"; // Par défaut, on va vers A (croissance fossile)
    state.lastMessage = "L'inaction est un choix : laisser le système suivre sa trajectoire la plus probable.\nLa croissance fossile s'impose.";
    return go("story", { nodeId: "present_A", state });
  }
  
  // Logique originale
  if (state.presentType === "A") return go("story", { nodeId: "present_A", state });
  if (state.presentType === "B") return go("story", { nodeId: "present_B", state });
  return go("story", { nodeId: "present_C", state });
});




// -------------------- Ending Scene (Victoire Cynique) --------------------
scene("ending_cynical", ({ state }) => {
  ensureBG(state);
  
  // Fond sombre
  add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(0.85),
    fixed(),
    z(100)
  ]);
  
  // Titre
  add([
    text("VICTOIRE", { 
      size: 72,
      font: "monospace",
      weight: "bold"
    }),
    pos(width() / 2, 100),
    anchor("center"),
    color(100, 220, 140),
    fixed(),
    z(110)
  ]);
  
  add([
    text("(Mais tu sais ce que ça coûte)", { 
      size: 24
    }),
    pos(width() / 2, 170),
    anchor("center"),
    color(200, 200, 200),
    fixed(),
    z(110)
  ]);
  
  // Message cynique
  const cynicalMessages = [
    "Tu as gagné. Le système fonctionne. La planète, un peu moins.",
    "Victoire procédurale. Défaite environnementale.",
    "L'accord est signé. Les émissions vont baisser... en théorie.",
    "Tu viens de prouver qu'on peut réussir sans vraiment réussir.",
    "Le papier est vert. Le monde, de moins en moins."
  ];
  
  const msg = cynicalMessages[Math.floor(Math.random() * cynicalMessages.length)];
  
  add([
    text(msg, { 
      size: 22,
      width: width() - 100,
      lineSpacing: 12
    }),
    pos(width() / 2, 240),
    anchor("center"),
    color(220, 220, 240),
    fixed(),
    z(110)
  ]);
  
  // Stats
  add([
    text(`Clauses: ${state.mg2?.proofs || 0}/3 | Capture: ${state.mg2?.capture || 0} | Corruption: ${state.mg2?.corruption || 0}`, { 
      size: 18
    }),
    pos(width() / 2, 320),
    anchor("center"),
    color(180, 200, 220),
    fixed(),
    z(110)
  ]);
  
  // Bouton recommencer
  const restartBtn = add([
    rect(350, 60),
    pos(width() / 2, 400),
    anchor("center"),
    color(40, 50, 80),
    outline(2, rgb(100, 200, 150)),
    area(),
    "restart_btn",
    fixed(),
    z(110)
  ]);
  
  add([
    text("RECOMMENCER DU DÉBUT", { 
      size: 26,
      font: "monospace"
    }),
    pos(width() / 2, 400),
    anchor("center"),
    color(230, 250, 230),
    fixed(),
    z(111)
  ]);
  
  // Animation du bouton
  let btnScale = 1;
  restartBtn.onUpdate(() => {
    btnScale = 1 + Math.sin(time() * 1.5) * 0.03;
    restartBtn.scale = vec2(btnScale);
  });
  
  // Hover effect
  onHover("restart_btn", (btn) => {
    btn.color = rgb(50, 70, 100);
    btn.outline.color = rgb(120, 230, 170);
  });
  
  onHoverEnd("restart_btn", (btn) => {
    btn.color = rgb(40, 50, 80);
    btn.outline.color = rgb(100, 200, 150);
  });
  
  // Actions
  onClick("restart_btn", () => {
    beep("good");
    go("start"); // Recommence complètement
  });
  
  onKeyPress("space", () => {
    go("start"); // Recommence complètement
  });
  
  // Instruction
  add([
    text("ESPACE ou clic pour recommencer complètement", { 
      size: 16
    }),
    pos(width() / 2, 480),
    anchor("center"),
    color(160, 180, 200),
    fixed(),
    z(110)
  ]);
});


// -------------------- Ending Scene (Défaite - Trop de capture) --------------------
scene("ending_defeat", ({ state }) => {
  ensureBG(state);
  
  // Fond rouge sombre
  add([
    rect(width(), height()),
    pos(0, 0),
    color(30, 0, 0),
    opacity(0.9),
    fixed(),
    z(100)
  ]);
  
  // Titre
  add([
    text("DÉFAITE", { 
      size: 72,
      font: "monospace",
      weight: "bold"
    }),
    pos(width() / 2, 100),
    anchor("center"),
    color(255, 100, 100),
    fixed(),
    z(110)
  ]);
  
  add([
    text("Le texte a été vidé de sa substance", { 
      size: 24
    }),
    pos(width() / 2, 170),
    anchor("center"),
    color(220, 150, 150),
    fixed(),
    z(110)
  ]);
  
  // Message de défaite
  const defeatMessages = [
    "Trop d'exceptions, trop de compromis. L'accord ne vaut plus le papier sur lequel il est écrit.",
    "Les lobbies ont gagné. La planète a perdu.",
    "Capture complète : tu as été mangé par le système que tu voulais changer.",
    "Le texte existe toujours. Mais il ne dit plus rien."
  ];
  
  const msg = defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
  
  add([
    text(msg, { 
      size: 22,
      width: width() - 100,
      lineSpacing: 12
    }),
    pos(width() / 2, 240),
    anchor("center"),
    color(240, 200, 200),
    fixed(),
    z(110)
  ]);
  
  // Stats
  add([
    text(`Capture: ${state.mg2?.capture || 0}/5 (trop!) | Corruption: ${state.mg2?.corruption || 0}`, { 
      size: 18
    }),
    pos(width() / 2, 320),
    anchor("center"),
    color(240, 180, 180),
    fixed(),
    z(110)
  ]);
  
  // Bouton recommencer
  const restartBtn = add([
    rect(350, 60),
    pos(width() / 2, 400),
    anchor("center"),
    color(60, 20, 20),
    outline(2, rgb(200, 100, 100)),
    area(),
    "restart_btn",
    fixed(),
    z(110)
  ]);
  
  add([
    text("ESSAYER À NOUVEAU", { 
      size: 26,
      font: "monospace"
    }),
    pos(width() / 2, 400),
    anchor("center"),
    color(250, 200, 200),
    fixed(),
    z(111)
  ]);
  
  // Animation
  let btnScale = 1;
  restartBtn.onUpdate(() => {
    btnScale = 1 + Math.sin(time() * 2) * 0.02;
    restartBtn.scale = vec2(btnScale);
  });
  
  // Hover
  onHover("restart_btn", (btn) => {
    btn.color = rgb(80, 30, 30);
    btn.outline.color = rgb(255, 120, 120);
  });
  
  onHoverEnd("restart_btn", (btn) => {
    btn.color = rgb(60, 20, 20);
    btn.outline.color = rgb(200, 100, 100);
  });
  
  // Actions
  onClick("restart_btn", () => {
    beep("bad");
    go("start"); // Recommence complètement
  });
  
  onKeyPress("space", () => {
    go("start");
  });
  
  // Instruction
  add([
    text("ESPACE ou clic pour recommencer", { 
      size: 16
    }),
    pos(width() / 2, 480),
    anchor("center"),
    color(200, 150, 150),
    fixed(),
    z(110)
  ]);
});

















// -------------------- MG2A (Lobby) --------------------
scene("minigame_lobby", ({ state }) => {
  ensureBG(state); // ✅
  drawHUD(state, "Couloirs du pouvoir");

  // --- ton code MG2A inchangé ci-dessous ---
  // (j’ai uniquement ajouté ensureBG au début de la scène)
  // ⚠️ je garde ton MG2A tel quel pour ne pas casser le gameplay.

  add([
    text("WASD/Flèches = bouger | Shift = courir | Espace = dash | E = interagir", { size: 16 }),
    pos(24, 120),
    color(230, 230, 240),
    fixed(),
  ]);

  const scoreText = add([text("", { size: 18 }), pos(24, 160), fixed(), color(210, 210, 230)]);
  const prompt = add([text("", { size: 16 }), pos(width() / 2, 48), anchor("center"), fixed(), color(240, 240, 255)]);

  add([rect(width() - 48, 52), pos(24, height() - 80), fixed(), color(30, 34, 48), outline(2, rgb(70, 80, 110))]);
  const msgText = add([text("", { size: 18 }), pos(36, height() - 68), fixed(), color(220, 230, 250)]);
  let msgTimer = 0;
  function say(s, t = 2.2) {
    msgText.text = s;
    msgTimer = t;
  }

  if (!state.mg2Memory) state.mg2Memory = { knowsArchive: false, loopsHere: 0 };
  if (!state.mg2) state.mg2 = {};

  let proofs = 0;
  let capture = 0;
  let corruption = 0;
  let speedBuffT = 0;

  const loopFactor = clamp(state.loops ?? 0, 0, 6);
  const spawnInterval = Math.max(0.65, 0.95 - loopFactor * 0.05);
  const redBias = clamp(0.38 + loopFactor * 0.06, 0.38, 0.70);
  const yellowBias = clamp(0.20 + loopFactor * 0.03, 0.20, 0.38);

  const lobbyistCount = loopFactor >= 4 ? 2 : 1;
  const lobbyistSpeed = 120 + loopFactor * 14;

  const msgGood = [
    "Clause ajoutée. Personne ne l’a lue.",
    "Tu viens d’écrire une ligne qui dérange.",
    "Une mesure réelle… cachée dans une annexe.",
    "Ça ressemble à une contrainte. Quelle audace.",
    "Un mot dangereux: “obligatoire”.",
  ];
  const msgBad = [
    "Exception sectorielle validée. Temporaire, bien sûr.",
    "“On y reviendra plus tard.” (traduction: jamais)",
    "Le texte vient de perdre… son texte.",
    "Amendement: +1 trou dans l’accord.",
    "Le lobby appelle ça un “ajustement”.",
  ];
  const msgWash = [
    "Neutralité carbone annoncée (sans calendrier).",
    "Compensation magique: tu peux dormir tranquille.",
    "Un beau slogan. Une trajectoire inchangée.",
    "Greenwashing approuvé. Bravo l’image.",
    "C’est “durable” parce que c’est écrit en vert.",
  ];
  const msgHit = [
    "On te félicite pour ton “sens du compromis”.",
    "Tu viens de croiser un “conseiller” très convaincant.",
    "Collision avec la réalité (sponsorisé).",
    "Ils appellent ça une discussion “informelle”.",
  ];

  const WALL = 6;
  const OUT = 1;

  const PLAY_TOP = 190;
  const PLAY_BOTTOM_PAD = 92;
  const PLAY_LEFT = 24;
  const PLAY_RIGHT = width() - 24;
  const PLAY_BOTTOM = height() - PLAY_BOTTOM_PAD;

  const PLAY_W = PLAY_RIGHT - PLAY_LEFT;
  const PLAY_H = PLAY_BOTTOM - PLAY_TOP;

  add([
    rect(PLAY_W, PLAY_H),
    pos(PLAY_LEFT, PLAY_TOP),
    color(15, 17, 24),
    outline(2, rgb(55, 65, 90)),
    z(-20),
    anchor("topleft"),
  ]);

  const solids = [];
  function addObstacle(x, y, w, h, label = "") {
    const o = add([
      rect(w, h),
      pos(x, y),
      area(),
      body({ isStatic: true }),
      color(46, 50, 64),
      outline(OUT, rgb(80, 92, 125)),
      anchor("topleft"),
      "solid",
    ]);
    solids.push(o);

    if (label) {
      add([text(label, { size: 12 }), pos(x + 10, y - 16), color(170, 180, 200)]);
    }
    return o;
  }

  addObstacle(PLAY_LEFT, PLAY_TOP, PLAY_W, WALL);
  addObstacle(PLAY_LEFT, PLAY_BOTTOM - WALL, PLAY_W, WALL);
  addObstacle(PLAY_LEFT, PLAY_TOP, WALL, PLAY_H);
  addObstacle(PLAY_RIGHT - WALL, PLAY_TOP, WALL, PLAY_H);

  const archX = PLAY_LEFT + 34;
  const archY = PLAY_TOP + 34;
  const archW = 250;
  const archH = 170;

  addObstacle(archX, archY, archW, WALL, "ARCHIVES");
  addObstacle(archX, archY, WALL, archH);
  addObstacle(archX, archY + archH - WALL, archW - 110, WALL);

  const ARCH_ZONE = { x: archX + 18, y: archY + 26, w: 150, h: 52 };

  const plX = PLAY_LEFT + 360;
  const plY = PLAY_TOP + 28;
  const plW = 340;
  const plH = 230;

  addObstacle(plX, plY, plW, WALL, "PLÉNIÈRE");
  addObstacle(plX + plW - WALL, plY, WALL, plH);

  const doorY = plY + 105;
  const doorH = 70;
  addObstacle(plX, plY, WALL, doorY - plY);
  addObstacle(plX, doorY + doorH, WALL, (plY + plH) - (doorY + doorH));

  const gapW = 190;
  const leftSegW = Math.floor((plW - gapW) / 2);
  const rightSegW = plW - gapW - leftSegW;

  addObstacle(plX, plY + plH - WALL, leftSegW, WALL);
  addObstacle(plX + leftSegW + gapW, plY + plH - WALL, rightSegW, WALL);

  const tX = plX + 120;
  const tY = plY + 75;
  const TW = 90;
  const TH = 70;
  addObstacle(tX, tY, TW, TH, "table");

  addObstacle(PLAY_LEFT + 280, PLAY_TOP + 120, 110, 10, "buffet");
  addObstacle(PLAY_RIGHT - 320, PLAY_TOP + 120, 110, 10, "photocall");
  addObstacle(PLAY_RIGHT - 170, PLAY_BOTTOM - 85, 10, 55, "stand");

  const exitW = 90;
  const exitH = 54;
  const exitX = PLAY_RIGHT - WALL - exitW - 22;
  const exitY = PLAY_BOTTOM - WALL - exitH - 18;

  const exitZone = add([
    rect(exitW, exitH),
    pos(exitX, exitY),
    anchor("topleft"),
    area(),
    body({ isStatic: true }),
    color(40, 90, 60),
    outline(1, rgb(120, 220, 160)),
    "exitZone",
  ]);
  add([text("SORTIE", { size: 13 }), pos(exitX + 20, exitY + 18), color(190, 240, 210)]);

  let archiveTrigger = null;
  if (state.mg2Memory.knowsArchive) {
    archiveTrigger = add([rect(ARCH_ZONE.w, ARCH_ZONE.h), pos(ARCH_ZONE.x, ARCH_ZONE.y), area(), opacity(0), "archiveTrigger"]);
  }

  const PLAYER_SPAWN = vec2(PLAY_LEFT + 95, PLAY_TOP + 170);

  const PLAYER_SIZE = 12;
  const player = add([
    rect(PLAYER_SIZE, PLAYER_SIZE),
    pos(PLAYER_SPAWN),
    anchor("center"),
    area(),
    body(),
    color(180, 200, 255),
    "player",
  ]);

  function clampToPlayZone() {
    player.pos.x = clamp(player.pos.x, PLAY_LEFT + WALL + PLAYER_SIZE / 2, PLAY_RIGHT - WALL - PLAYER_SIZE / 2);
    player.pos.y = clamp(player.pos.y, PLAY_TOP + WALL + PLAYER_SIZE / 2, PLAY_BOTTOM - WALL - PLAYER_SIZE / 2);
  }

  function moveVec() {
    let v = vec2(0, 0);
    if (isKeyDown("left") || isKeyDown("a")) v.x -= 1;
    if (isKeyDown("right") || isKeyDown("d")) v.x += 1;
    if (isKeyDown("up") || isKeyDown("w")) v.y -= 1;
    if (isKeyDown("down") || isKeyDown("s")) v.y += 1;
    return v.len() > 0 ? v.unit() : v;
  }

  const WALK_SPEED = 360;
  const RUN_SPEED = 560;
  const DASH_SPEED = 980;
  const DASH_TIME = 0.09;
  const DASH_CD = 0.75;

  let isRunning = false;
  let dashTimeLeft = 0;
  let dashCdLeft = 0;
  let lastDir = vec2(1, 0);
  let dashDir = vec2(1, 0);

  onKeyDown("shift", () => (isRunning = true));
  onKeyRelease("shift", () => (isRunning = false));

  onKeyPress("space", () => {
    if (dashCdLeft > 0) return;
    if (lastDir.len() <= 0) return;
    dashDir = lastDir.unit();
    dashTimeLeft = DASH_TIME;
    dashCdLeft = DASH_CD;
  });

  const ITEM_SIZE = 8;

  function pickKind() {
    const r = Math.random();
    if (r < redBias) return "exception";
    if (r < redBias + yellowBias) return "greenwash";
    return "clause";
  }

  function colFor(kind) {
    if (kind === "clause") return rgb(80, 220, 140);
    if (kind === "exception") return rgb(220, 80, 80);
    return rgb(240, 210, 120);
  }

  function randomFreePos() {
    for (let tries = 0; tries < 18; tries++) {
      const x = rand(PLAY_LEFT + WALL + 40, PLAY_RIGHT - WALL - 40);
      const y = rand(PLAY_TOP + WALL + 40, PLAY_BOTTOM - WALL - 60);

      const probe = add([rect(ITEM_SIZE, ITEM_SIZE), pos(x, y), anchor("center"), area(), opacity(0)]);
      let bad = false;
      for (const s of solids) {
        if (probe.isColliding(s)) {
          bad = true;
          break;
        }
      }
      destroy(probe);
      if (!bad) return vec2(x, y);
    }
    return vec2(PLAY_LEFT + 120, PLAY_TOP + 240);
  }

  function spawnItem() {
    const kind = pickKind();
    const p = randomFreePos();
    const obj = add([rect(ITEM_SIZE, ITEM_SIZE), pos(p), anchor("center"), area(), body({ isStatic: true }), color(colFor(kind)), kind]);
    wait(6.5, () => obj.exists() && destroy(obj));
  }

  loop(spawnInterval, () => spawnItem());

  function collect(kind, obj) {
    destroy(obj);
    if (kind === "clause") {
      proofs += 1;
      say(pick(msgGood));
    } else if (kind === "exception") {
      capture += 1;
      say(pick(msgBad));
    } else if (kind === "greenwash") {
      corruption += 1;
      speedBuffT = Math.max(speedBuffT, 4.0);
      say(pick(msgWash));
    }
  }

  onCollide("player", "clause", (p, o) => collect("clause", o));
  onCollide("player", "exception", (p, o) => collect("exception", o));
  onCollide("player", "greenwash", (p, o) => collect("greenwash", o));

  const lobbyists = [];
  let hitIframes = 0;

  function spawnLobbyist(x, y) {
    const l = add([rect(12, 12), pos(x, y), anchor("center"), area(), body(), color(255, 130, 130), "lobbyist"]);
    lobbyists.push(l);
    return l;
  }

  const spots = [
    vec2(PLAY_RIGHT - 220, PLAY_TOP + 120),
    vec2(PLAY_RIGHT - 320, PLAY_BOTTOM - 160),
    vec2(PLAY_LEFT + PLAY_W / 2, PLAY_TOP + 120),
    vec2(PLAY_LEFT + PLAY_W / 2 + 140, PLAY_BOTTOM - 160),
  ];

  for (let i = 0; i < lobbyistCount; i++) {
    const s = spots[i % spots.length];
    spawnLobbyist(s.x, s.y);
  }

  function knockbackFrom(sourcePos, strength = 260) {
    const dir = player.pos.sub(sourcePos);
    const v = dir.len() > 0.01 ? dir.unit() : vec2(1, 0);
    player.pos = player.pos.add(v.scale(strength * 0.03));
    clampToPlayZone();
  }

  onCollide("player", "lobbyist", (p, l) => {
    if (hitIframes > 0) return;
    hitIframes = 0.35;
    capture += 1;
    say(pick(msgHit));
    knockbackFrom(l.pos, 280);
  });

  let ended = false;
  let archiveUsed = false;

  function storeRun() {
    state.mg2.proofs = proofs;
    state.mg2.capture = capture;
    state.mg2.corruption = corruption;
  }

  function outcomeLabel() {
    if (corruption === 0 && capture <= 1) return "clean";
    if (corruption >= 3 || capture >= 4) return "dirty";
    return "compromise";
  }

  function triggerLoop(reason, learnedText = "") {
  if (ended) return;
  ended = true;

  // Si capture >= 5, c'est une défaite définitive
  if (capture >= 5) {
    state.mg2 = { proofs, capture, corruption, outcome: "defeat" };
    go("ending_defeat", { state });
    return;
  }
  
  // Sinon, boucle normale
  state.loops = (state.loops ?? 0) + 1;
  state.mg2Memory.loopsHere += 1;

  storeRun();

  if (!state.mg2Memory.knowsArchive) {
    state.mg2Memory.knowsArchive = true;
    learnedText = learnedText || "Mémoire acquise : tu connais l’accès aux ARCHIVES.";
  }

  state.lastMessage =
    `NOUVELLE BOUCLE\n${reason}\n` +
    `Clauses: ${proofs}/3 | Capture: ${capture} | Corruption: ${corruption}\n` +
    (learnedText ? `${learnedText}\n` : "") +
    `Retour automatique à l’Antiquité. Boucles : ${state.loops}`;

  go("story", { nodeId: "antiquity", state });
}

  function showDirtyWinAndLoop() {
    add([rect(width(), height()), pos(0, 0), fixed(), color(10, 12, 18), opacity(0.92), z(9999)]);
    add([text("VICTOIRE SALE", { size: 54 }), pos(width() / 2, 160), anchor("center"), fixed(), color(255, 190, 140), z(10000)]);
    add([
      text(
        "Tu as gagné.\n\nMais tu t’en sortiras pas comme ça.\nRetour à la case départ.\n\n" +
          `Clauses: ${proofs}/3   Capture: ${capture}   Corruption: ${corruption}`,
        { size: 18, lineSpacing: 8 }
      ),
      pos(width() / 2, 290),
      anchor("center"),
      fixed(),
      color(220, 230, 250),
      z(10000),
    ]);

    wait(4.2, () => {
      triggerLoop("Victoire procédurale, défaite matérielle.\nL’accord est passé. Le problème aussi.", "Tu apprends le vrai plan du bâtiment (ARCHIVES).");
    });
  }

  function triggerWinToEnding() {
  if (ended) return;
  storeRun();
  
  // Vérifier les conditions
  const tooMuchCapture = capture >= 5;
  const tooMuchCorruption = corruption >= 4;
  const hasEnoughProofs = proofs >= 3;
  
  // 1. DÉFAITE : trop de capture
  if (tooMuchCapture) {
    ended = true;
    state.mg2 = { proofs, capture, corruption, outcome: "defeat" };
    go("ending_defeat", { state });
    return;
  }
  
  // 2. VICTOIRE mais trop sale -> boucle
  if (tooMuchCorruption) {
    showDirtyWinAndLoop();
    return;
  }
  
  // 3. VICTOIRE "cynique" : assez de clauses, pas trop sale
  if (hasEnoughProofs && !tooMuchCorruption) {
    ended = true;
    const out = outcomeLabel();
    state.mg2 = { proofs, capture, corruption, outcome: out };
    go("ending_cynical", { state });
    return;
  }
  
  // 4. Sinon (normalement pas atteint)
  ended = true;
  state.lastMessage = `MG2A — SCORE\nClauses: ${proofs}/3 | Capture: ${capture} | Corruption: ${corruption}`;
  go("start", { state });
}

  onKeyPress("e", () => {
    if (ended) return;

    if (archiveTrigger && state.mg2Memory.knowsArchive && !archiveUsed && player.isColliding(archiveTrigger)) {
      archiveUsed = true;
      proofs = Math.min(3, proofs + 1);
      say("ARCHIVES consultées : +1 clause (mémoire de boucle).");
      return;
    }

    if (proofs >= 3 && player.isColliding(exitZone)) {
      triggerWinToEnding();
    }
  });

  if (!state.mg2Memory.knowsArchive) say("Astuce cynique : parfois, il faut échouer pour apprendre l’accès…", 3.2);
  else say("Tu te souviens des ARCHIVES. Le bâtiment n’est plus le même.", 3.2);

  onUpdate(() => {
    if (ended) return;

    if (msgTimer > 0) {
      msgTimer -= dt();
      if (msgTimer <= 0) msgText.text = "";
    }
    if (speedBuffT > 0) speedBuffT -= dt();
    if (hitIframes > 0) hitIframes -= dt();

    const v = moveVec();
    if (v.len() > 0) lastDir = v;

    if (dashTimeLeft > 0) dashTimeLeft -= dt();
    if (dashCdLeft > 0) dashCdLeft -= dt();

    const buffMult = speedBuffT > 0 ? 1.25 : 1.0;
    const baseSpeed = (isRunning ? RUN_SPEED : WALK_SPEED) * buffMult;

    player.move(v.x * baseSpeed, v.y * baseSpeed);
    if (dashTimeLeft > 0) player.move(dashDir.x * DASH_SPEED, dashDir.y * DASH_SPEED);

    clampToPlayZone();

    for (const l of lobbyists) {
      if (!l.exists()) continue;
      const dir = player.pos.sub(l.pos);
      const d = dir.len();
      if (d > 1) {
        const spd = lobbyistSpeed * (d < 60 ? 0.85 : 1.0);
        l.move(dir.unit().x * spd, dir.unit().y * spd);
      }
    }

    scoreText.text =
      `Clauses: ${proofs}/3   Capture: ${capture}/5   Corruption: ${corruption}` +
      (speedBuffT > 0 ? `   Effet communication ${speedBuffT.toFixed(1)}s` : "") +
      `   (Boucles: ${state.loops ?? 0})`;

    if (proofs >= 3) {
      prompt.text = player.isColliding(exitZone) ? "E : SORTIR (signature express)" : "Objectif: va à la SORTIE";
    } else {
      prompt.text = `Objectif: récupère ${3 - proofs} clause(s) utile(s)`;
    }

    if (archiveTrigger && state.mg2Memory.knowsArchive && !archiveUsed && player.isColliding(archiveTrigger)) {
      prompt.text = "E : consulter ARCHIVES (+1 clause, une fois)";
    }

    if (capture >= 5) {
      triggerLoop("Le texte a été vidé de sa substance.");
    }
  });

  // Interaction E
  onKeyPress("e", () => {
    if (ended) return;

    if (archiveTrigger && state.mg2Memory.knowsArchive && !archiveUsed && player.isColliding(archiveTrigger)) {
      archiveUsed = true;
      proofs = Math.min(3, proofs + 1);
      say("ARCHIVES consultées : +1 clause (mémoire de boucle).");
      return;
    }

    if (proofs >= 3 && player.isColliding(exitZone)) {
      triggerWinToEnding();
    }
  });
});

// -------------------- MG_BC (Bullet Hell) --------------------
scene("minigame_bullethell", ({ state }) => {
  ensureBG(state);
  drawHUD(state, "Le présent sous pression");

  // Zone de jeu (HUD en haut)
  const PLAY_TOP = 190;
  const PLAY_BOTTOM_PAD = 90;
  const PLAY_LEFT = 24;
  const PLAY_RIGHT = width() - 24;
  const PLAY_BOTTOM = height() - PLAY_BOTTOM_PAD;

  const PLAY_W = PLAY_RIGHT - PLAY_LEFT;
  const PLAY_H = PLAY_BOTTOM - PLAY_TOP;

  add([
    rect(PLAY_W, PLAY_H),
    pos(PLAY_LEFT, PLAY_TOP),
    color(10, 12, 18),
    outline(2, rgb(55, 65, 90)),
    z(-20),
    anchor("topleft"),
  ]);

  const mode = state.presentType === "C" ? "C" : "B";
  const bonus = state.bhBonus;

  const base = {
    spawnEvery: 0.49,
    bulletSpeed: 220,
    bulletRadius: 3,
    playerSize: 12,
    focusMult: 0.55,

    dashSpeed: 900,
    dashTime: 0.07,
    dashCd: 0.65,

    graceStart: 0.0,
    shieldStart: 0,
    hitboxScale: 1.0,

    startIframes: 1.4,
    safeSpawnR: 110,
    softStart: 4.0,
    hpB: 2,

    scoreRate: 10,
    noHitBonusAfter: 3.5,
    noHitBonusRate: 2,
  };

  const paramsB = {
    ...base,
    spawnEvery: 0.42,
    bulletSpeed: 240,
    shieldStart: 0,
    graceStart: 0.0,
    hitboxScale: 1.0,
    hpB: 2,
  };

  const paramsC = {
    ...base,
    spawnEvery: 0.44,
    bulletSpeed: 230,
    shieldStart: 1,
    graceStart: 6.0,
    hitboxScale: 0.85,
  };

  let P = mode === "C" ? { ...paramsC } : { ...paramsB };

  if (mode === "C" && bonus === "C_GOOD") {
    P.shieldStart += 1;
    P.spawnEvery += 0.07;
    P.bulletSpeed -= 12;
    P.scoreRate += 2;
  }

  if (mode === "C" && bonus === "C_OK") {
    P.spawnEvery += 0.04;
    P.scoreRate += 1;
  }

  const SCORE_THRESHOLD = mode === "C" ? (bonus === "C_GOOD" ? 190 : 200) : 220;

  // CHANGEMENT ICI : plus besoin de started variable pour les règles
  let started = true; // Le jeu commence directement

  let shield = P.shieldStart;
  let hits = 0;
  let ended = false;

  let score = 0;
  let survived = 0;
  let comboNoHit = 0;

  const bhHud = add([text("", { size: 18 }), pos(24, 160), fixed(), color(210, 210, 230)]);
  const centerMsg = add([text("", { size: 22 }), pos(width() / 2, PLAY_TOP + 40), anchor("center"), color(230, 230, 240)]);

  function sayCenter(s, t = 1.2) {
    centerMsg.text = s;
    wait(t, () => centerMsg.exists() && (centerMsg.text = ""));
  }

  const spawn = vec2(PLAY_LEFT + PLAY_W / 2, PLAY_TOP + PLAY_H * 0.72);

  const player = add([
    rect(P.playerSize, P.playerSize),
    pos(spawn),
    anchor("center"),
    area({ scale: P.hitboxScale }),
    color(170, 200, 255),
    "player",
  ]);

  const playerIcon = add([text("▲", { size: 18 }), pos(spawn), anchor("center"), color(235, 240, 255), z(10)]);
  const hitDot = add([circle(2), pos(spawn), anchor("center"), color(255, 255, 255), z(11)]);

  player.onUpdate(() => {
    playerIcon.pos = player.pos.clone();
    hitDot.pos = player.pos.clone();
  });

  function clampToPlay() {
    player.pos.x = clamp(player.pos.x, PLAY_LEFT + 8, PLAY_RIGHT - 8);
    player.pos.y = clamp(player.pos.y, PLAY_TOP + 8, PLAY_BOTTOM - 8);
  }

  function moveVec() {
    let v = vec2(0, 0);
    if (isKeyDown("left") || isKeyDown("a")) v.x -= 1;
    if (isKeyDown("right") || isKeyDown("d")) v.x += 1;
    if (isKeyDown("up") || isKeyDown("w")) v.y -= 1;
    if (isKeyDown("down") || isKeyDown("s")) v.y += 1;
    return v.len() > 0 ? v.unit() : v;
  }

  let dashTimeLeft = 0;
  let dashCdLeft = 0;
  let lastDir = vec2(0, -1);
  let dashDir = vec2(0, -1);

  onKeyPress("space", () => {
    // CHANGEMENT ICI : plus de condition "!started"
    if (dashCdLeft > 0) return;
    if (lastDir.len() <= 0.001) return;
    dashDir = lastDir.unit();
    dashTimeLeft = P.dashTime;
    dashCdLeft = P.dashCd;
  });

  let iframes = P.startIframes;
  let hp = mode === "B" ? P.hpB : 1;

  function spawnBullet(p, vel, r = P.bulletRadius) {
    const b = add([circle(r), pos(p), anchor("center"), area(), color(255, 120, 120), "bullet", { vel }]);

    b.onUpdate(() => {
      if (ended) return; // CHANGEMENT : plus de condition "!started"
      b.pos = b.pos.add(b.vel.scale(dt()));
      if (b.pos.x < PLAY_LEFT - 40 || b.pos.x > PLAY_RIGHT + 40 || b.pos.y < PLAY_TOP - 40 || b.pos.y > PLAY_BOTTOM + 40) {
        destroy(b);
      }
    });

    return b;
  }

  function safeOrigin(xMin, xMax, yMin, yMax) {
    for (let i = 0; i < 20; i++) {
      const o = vec2(rand(xMin, xMax), rand(yMin, yMax));
      if (o.dist(player.pos) > P.safeSpawnR) return o;
    }
    return vec2(rand(xMin, xMax), rand(yMin, yMax));
  }

  function patternRadialBurst() {
    const origin = safeOrigin(PLAY_LEFT + 60, PLAY_RIGHT - 60, PLAY_TOP + 60, PLAY_TOP + PLAY_H * 0.45);
    const n = Math.floor(rand(10, 18));
    const spd = P.bulletSpeed * rand(0.85, 1.1);

    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      const v = vec2(Math.cos(a), Math.sin(a)).scale(spd);
      spawnBullet(origin, v);
    }
  }

  function patternSideSweep() {
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? PLAY_LEFT - 10 : PLAY_RIGHT + 10;
    const spd = P.bulletSpeed * 1.05;

    const lanes = 9;
    const hole = Math.floor(rand(0, lanes));
    for (let i = 0; i < lanes; i++) {
      if (i === hole) continue;
      const y = PLAY_TOP + 30 + (i * (PLAY_H - 60)) / (lanes - 1);
      const v = vec2(fromLeft ? 1 : -1, 0).scale(spd);
      spawnBullet(vec2(x, y), v, P.bulletRadius);
    }
  }

  function patternTargetedShots() {
    const origin = safeOrigin(PLAY_LEFT + 60, PLAY_RIGHT - 60, PLAY_TOP - 10, PLAY_TOP - 10);
    const spd = P.bulletSpeed * rand(1.05, 1.25);

    for (let i = 0; i < 3; i++) {
      wait(i * 0.08, () => {
        if (!player.exists() || ended) return; // CHANGEMENT : plus de condition "!started"
        const dir = player.pos.sub(origin);
        const v = (dir.len() > 0.01 ? dir.unit() : vec2(0, 1)).scale(spd);
        spawnBullet(origin, v);
      });
    }
  }

  const patterns = [patternRadialBurst, patternSideSweep, patternTargetedShots];

  let elapsed = 0;

  function spawnWave() {
    if (ended) return; // CHANGEMENT : plus de condition "!started"

    const inSoftStart = elapsed < P.softStart;
    const inGraceC = mode === "C" && elapsed < P.graceStart;

    if (inSoftStart || inGraceC) {
      if (Math.random() < 0.6) patternRadialBurst();
      else patternSideSweep();
      return;
    }

    pick(patterns)();
  }

  loop(P.spawnEvery, spawnWave);

  onCollide("player", "bullet", (p, b) => {
    if (ended) return; // CHANGEMENT : plus de condition "!started"
    if (iframes > 0) return;

    destroy(b);

    if (shield > 0) {
      shield -= 1;
      iframes = 0.7;
      sayCenter("Bouclier consommé.", 1.0);
      return;
    }

    hp -= 1;
    hits += 1;
    iframes = 0.75;
    comboNoHit = 0;

    sayCenter(hp > 0 ? "Impact. Tiens bon." : "Rupture.", 0.9);

    if (hp <= 0) endRun();
  });

  function endRun() {
    if (ended) return;
    ended = true;

    const finalScore = Math.floor(score);

    state.mgBC = { present: mode, score: finalScore, survived: survived, hits: hits, threshold: SCORE_THRESHOLD };

    if (hits > 0) applyDelta(state, { well: -0.02 * hits });

    const ok = finalScore >= SCORE_THRESHOLD;

    add([rect(width(), height()), pos(0, 0), fixed(), color(0, 0, 0), opacity(0.78), z(20000)]);
    add([
      text(ok ? "TU TIENS (POUR L'INSTANT)" : "TU CRAQUES", { size: 40 }),
      pos(width() / 2, 180),
      anchor("center"),
      fixed(),
      color(ok ? rgb(170, 230, 190) : rgb(255, 170, 170)),
      z(20001),
    ]);

    add([
      text(
        `Progression : ${finalScore} / ${SCORE_THRESHOLD}\n` +
`Temps tenu : ${survived.toFixed(1)}s   Impacts : ${hits}\n\n` +
(ok
  ? "Tu as tenu assez longtemps.\nESPACE : continuer"
  : "La pression a eu raison de toi.\nESPACE : retour à l'agriculture"),
        { size: 18, lineSpacing: 8 }
      ),
      pos(width() / 2, 265),
      anchor("center"),
      fixed(),
      color(230, 230, 245),
      z(20001),
    ]);

    onKeyPress("space", () => {
      if (!ended) return;

      if (ok) {
        state.lastMessage = `Tu as tenu sous la pression.\nLa trajectoire continue.`;
        go("future_router", { state });
      } else {
        state.loops = (state.loops ?? 0) + 1;
        state.lastMessage = `Tu n'as pas tenu assez longtemps.\nRetour à l'agriculture. Boucle ${state.loops}.`;
        go("story", { nodeId: "agriculture", state });
      }
    });
  }

  onUpdate(() => {
    if (ended) return; // CHANGEMENT : plus de condition "!started"

    const delta = dt();
    elapsed += delta;

    survived += delta;
    comboNoHit += delta;
    score += delta * P.scoreRate;
    if (comboNoHit >= P.noHitBonusAfter) score += delta * P.noHitBonusRate;

    if (score >= SCORE_THRESHOLD) {
  endRun();
  return;
}

    if (iframes > 0) {
      iframes -= delta;
      player.opacity = 0.35;
      playerIcon.opacity = 0.35;
      hitDot.opacity = 0.35;
    } else {
      player.opacity = 1.0;
      playerIcon.opacity = 1.0;
      hitDot.opacity = 1.0;
    }

    if (dashTimeLeft > 0) dashTimeLeft -= delta;
    if (dashCdLeft > 0) dashCdLeft -= delta;

    const v = moveVec();
    if (v.len() > 0) lastDir = v;

    const focusing = isKeyDown("shift");
    const baseSpeed = 280;
    const speed = focusing ? baseSpeed * P.focusMult : baseSpeed;

    player.move(v.x * speed, v.y * speed);

    if (dashTimeLeft > 0) {
      player.move(dashDir.x * speed * 3.2, dashDir.y * speed * 3.2);
    }

    clampToPlay();

    bhHud.text =
  `Progression : ${Math.floor(score)} / ${SCORE_THRESHOLD} | ` +
  `Résistance : ${hp} | Bouclier : ${shield} | Dash : ${dashCdLeft > 0 ? dashCdLeft.toFixed(1) + "s" : "OK"}`;
  });
});

















// -------------------- Future Router --------------------
scene("future_router", ({ state }) => {
  ensureBG(state);
  if (state.presentType === "C") return go("mg_triage_narration", { state }); // ← CHANGEMENT ICI
  go("ending", { state });
});












// -------------------- Future triage (Version avec 3 issues + Cannibalisation) --------------------
scene("future_triage", ({ state }) => {
  // Nettoyer l'écran
  destroyAll();
  
  const clamp01 = (n) => Math.max(0, Math.min(100, n));
  const pickLocal = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const co2 = state.co2 ?? 0.5;
  const bio = state.bio ?? 0.5;
  const well = state.well ?? 0.5;

  const decayMult = 1.0 + co2 * 0.9;
  const healMult = 0.75 + bio * 0.55;
  const riotMult = 1.0 + (1.0 - well) * 0.9;

  const baseCrisisEvery = 3.4;
  const crisisEvery = Math.max(2.2, baseCrisisEvery - co2 * 1.0);
  const crisisAggravateAfter = 7.5;
  const endWhenAliveLE = 1;

  // --- VARIABLE TEMPS ---
  let gameTime = 0;

  // --- FOND SIMPLE ---
  add([
    rect(width(), height()),
    pos(0, 0),
    color(15, 20, 30),
    z(-100)
  ]);

  // --- TITRE ---
  add([
    text("2147 - CENTRE DE TRIAGE", { 
      size: 24,
      font: "sans-serif",
      weight: "bold"
    }),
    pos(width() / 2, 30),
    anchor("center"),
    color(255, 180, 180)
  ]);

  add([
    text("Gère les abris en crise. Glisse la bonne ressource.", { 
      size: 16 
    }),
    pos(width() / 2, 65),
    anchor("center"),
    color(200, 200, 220)
  ]);

  // --- ABRIS ---
  const SHELTER_NAMES = ["DÔME NORD", "ENCLAVE 7", "BUNKER EST", "SOUS-SOL SUD", "ZONE PORT"];
  const SHELTER_POPS = [1200, 800, 600, 1500, 900];
  
  const positions = [
    vec2(150, 180),
    vec2(350, 180),
    vec2(550, 180),
    vec2(250, 320),
    vec2(450, 320)
  ];

  const SHELTER_COLORS = [
    rgb(80, 140, 220),
    rgb(100, 200, 120),
    rgb(220, 180, 80),
    rgb(180, 100, 220),
    rgb(220, 100, 100)
  ];

  const SHELTER_OUTLINE_COLORS = [
    rgb(120, 180, 255),
    rgb(140, 240, 160),
    rgb(255, 220, 120),
    rgb(220, 140, 255),
    rgb(255, 140, 140)
  ];

  const shelters = [];

  for (let i = 0; i < 5; i++) {
    const p = positions[i];
    
    const node = add([
      circle(40),
      pos(p),
      anchor("center"),
      area(),
      color(SHELTER_COLORS[i]),
      outline(3, SHELTER_OUTLINE_COLORS[i]),
      "shelter"
    ]);

    add([
      text(SHELTER_NAMES[i], { size: 14 }),
      pos(p.x, p.y - 55),
      anchor("center"),
      color(240, 240, 255)
    ]);

    add([
      text(`${SHELTER_POPS[i]}`, { size: 16 }),
      pos(p.x, p.y + 50),
      anchor("center"),
      color(230, 230, 250)
    ]);

    const bg = add([rect(80, 6), pos(p.x - 40, p.y + 60), color(40, 40, 50)]);
    const fill = add([rect(80, 6), pos(p.x - 40, p.y + 60), color(100, 220, 100)]);
    
    shelters.push({
      i,
      name: SHELTER_NAMES[i],
      pop: SHELTER_POPS[i],
      pos: p,
      node,
      bg,
      fill,
      hp: 100,
      dead: false,
      crisis: null,
      crisisT: 0,
      crisisUI: null,
    });
  }

  function setHP(s, newHP) {
    s.hp = clamp01(newHP);
    s.fill.width = 80 * (s.hp / 100);
    
    if (s.hp > 60) s.fill.color = rgb(100, 220, 100);
    else if (s.hp > 30) s.fill.color = rgb(240, 200, 80);
    else s.fill.color = rgb(255, 100, 100);
  }

  // --- CRISES ---
  const CRISES = [
    { key: "air", name: "AIR", icon: "💨", color: rgb(120, 200, 255), decay: 14 },
    { key: "power", name: "ÉNERGIE", icon: "⚡", color: rgb(255, 245, 140), decay: 17 },
    { key: "food", name: "NOURRITURE", icon: "🍞", color: rgb(255, 190, 120), decay: 15 },
    { key: "order", name: "ÉMEUTES", icon: "🔥", color: rgb(255, 120, 120), decay: 18 },
  ];

  function startCrisis(s) {
    if (s.dead || s.crisis) return;
    const c = pickLocal(CRISES);
    const decay = c.key === "order" ? c.decay * riotMult : c.decay;
    s.crisis = { ...c, decay };
    s.crisisT = 0;

    const iconText = add([
      text(c.icon, { size: 32 }),
      pos(s.pos.x, s.pos.y - 15),
      anchor("center"),
      color(c.color),
      z(10)
    ]);

    s.crisisUI = { iconText };
  }

  function clearCrisis(s) {
    if (!s.crisis) return;
    if (s.crisisUI?.iconText) destroy(s.crisisUI.iconText);
    s.crisis = null;
    s.crisisT = 0;
    s.crisisUI = null;
    s.node.scale = vec2(1.0);
  }

  // --- RESSOURCES ---
  const resources = { air: 3, power: 3, order: 3, food: 3 };
  const maxStock = { air: 5, power: 5, order: 5, food: 5 };

  const slotY = height() - 100;
  const slots = [
    { key: "air", label: "💨 AIR", x: 100, col: rgb(120, 200, 255) },
    { key: "power", label: "⚡ ÉNERGIE", x: 250, col: rgb(255, 245, 140) },
    { key: "order", label: "🔥 ORDRE", x: 400, col: rgb(255, 120, 120) },
    { key: "food", label: "🍞 NOURRITURE", x: 550, col: rgb(255, 190, 120) },
  ];

  let dragging = null;

  slots.forEach(slot => {
    const box = add([
      rect(120, 50),
      pos(slot.x - 60, slotY),
      area(),
      color(30, 35, 50),
      outline(2, rgb(70, 85, 120))
    ]);
    
    add([
      text(slot.label, { size: 16 }),
      pos(slot.x, slotY + 15),
      anchor("center"),
      color(245, 245, 255)
    ]);
    
    const countText = add([
      text(`x${resources[slot.key]}`, { size: 18 }),
      pos(slot.x, slotY - 15),
      anchor("center"),
      color(255, 255, 255)
    ]);
    
    box.onClick(() => {
      if (gameEnded || resources[slot.key] <= 0 || dragging) return;
      
      dragging = {
        key: slot.key,
        icon: add([
          circle(20),
          pos(mousePos()),
          anchor("center"),
          color(slot.col),
          outline(2, rgb(255, 255, 255)),
          z(999)
        ])
      };
    });
    
    box.onUpdate(() => {
      countText.text = `x${resources[slot.key]}`;
    });
  });

  add([
    text("Clique sur une ressource → glisse sur un abri en crise", { size: 14 }),
    pos(width() / 2, height() - 40),
    anchor("center"),
    color(180, 190, 210)
  ]);

  // --- SYSTÈME DE CANNIBALISATION ---
  let selectedShelter = null;
  let cannibalizeCooldown = 0;
  let canCannibalize = true;

  // 1. Sélection d'un abri
  onClick("shelter", (s) => {
    if (gameEnded) return;
    
    // Réinitialiser tous les outlines
    shelters.forEach(sh => {
      if (sh.node.exists()) {
        sh.node.outline.width = 3;
        sh.node.outline.color = SHELTER_OUTLINE_COLORS[sh.i] || rgb(255, 255, 255);
      }
    });
    
    // Trouver l'abri correspondant au node cliqué
    const shelterObj = shelters.find(sh => sh.node === s);
    if (shelterObj && !shelterObj.dead) {
      selectedShelter = shelterObj;
      selectedShelter.node.outline.width = 6;
      selectedShelter.node.outline.color = rgb(255, 80, 80);
      
      // Feedback visuel
      add([
        text(`Sélectionné: ${shelterObj.name}`, { size: 12 }),
        pos(shelterObj.pos.x, shelterObj.pos.y - 70),
        anchor("center"),
        color(255, 200, 200),
        lifespan(1.5)
      ]);
    } else {
      selectedShelter = null;
    }
  });

  // 2. Création du bouton CANNIBALISER
  const btnX = width() - 120;
  const btnY = height() - 100;

  const cannibalizeBtn = add([
    rect(160, 50),
    pos(btnX, btnY),
    area(),
    color(70, 35, 35),
    outline(3, rgb(120, 60, 60)),
    "btn_cannibalize",
    z(100)
  ]);

  add([
    text("⚔️ CANNIBALISER", { 
      size: 14, 
      weight: "bold",
      font: "monospace"
    }),
    pos(btnX + 80, btnY + 15),
    anchor("center"),
    color(240, 200, 200),
    z(101)
  ]);

  add([
    text("(sacrifie un abri)", { size: 10 }),
    pos(btnX + 80, btnY + 30),
    anchor("center"),
    color(220, 180, 180),
    z(101)
  ]);

  const cooldownText = add([
    text("PRÊT", { size: 12 }),
    pos(btnX + 80, btnY + 45),
    anchor("center"),
    color(180, 220, 180),
    z(101)
  ]);

  // 3. Gestion du clic sur le bouton
  onClick("btn_cannibalize", () => {
    if (gameEnded) return;
    
    if (!canCannibalize) {
      add([
        text(`Attends ${Math.ceil(cannibalizeCooldown)}s`, { size: 14 }),
        pos(mousePos()),
        anchor("center"),
        color(255, 150, 150),
        lifespan(1.0),
        z(200)
      ]);
      return;
    }
    
    if (!selectedShelter) {
      add([
        text("Sélectionne un abri d'abord !", { size: 14 }),
        pos(mousePos()),
        anchor("center"),
        color(255, 200, 200),
        lifespan(1.0),
        z(200)
      ]);
      return;
    }
    
    if (selectedShelter.dead) {
      add([
        text("Cet abri est déjà mort !", { size: 14 }),
        pos(mousePos()),
        anchor("center"),
        color(255, 150, 150),
        lifespan(1.0),
        z(200)
      ]);
      selectedShelter = null;
      return;
    }
    
    // --- EXÉCUTION DE LA CANNIBALISATION ---
    const s = selectedShelter;
    
    // A. Récupérer des ressources
    const types = ["air", "power", "order", "food"];
    const gains = { air: 0, power: 0, order: 0, food: 0 };
    
    // Donner 3 ressources aléatoires
    for (let i = 0; i < 3; i++) {
      const type = pickLocal(types);
      gains[type]++;
    }
    
    // Appliquer les gains
    Object.keys(gains).forEach(k => {
      if (gains[k] > 0) {
        resources[k] = Math.min(maxStock[k], resources[k] + gains[k]);
      }
    });
    
    // B. Détruire l'abri
    s.dead = true;
    sheltersAlive--;
    
    // Effet visuel de destruction
    addKaboom(s.pos, {
      scale: 1.8,
      color: rgb(180, 60, 60),
      duration: 1.8
    });
    
    // Changement d'apparence
    s.node.color = rgb(50, 30, 30);
    s.node.outline.color = rgb(90, 40, 40);
    s.node.outline.width = 2;
    
    // Détruire la crise si présente
    clearCrisis(s);
    
    // C. Message de gains
    let gainStr = "";
    Object.keys(gains).forEach(k => {
      if (gains[k] > 0) {
        const icons = { air: "💨", power: "⚡", order: "🔥", food: "🍞" };
        gainStr += `+${gains[k]}${icons[k]} `;
      }
    });
    
    add([
      text(gainStr, { size: 18 }),
      pos(s.pos.x, s.pos.y - 50),
      anchor("center"),
      color(240, 200, 200),
      lifespan(2.0),
      z(50)
    ]);
    
    // D. Pénalité pour tous les autres abris
    shelters.forEach(sh => {
      if (!sh.dead && sh !== s) {
        const prevHP = sh.hp;
        setHP(sh, sh.hp - 15);
        
        // Effet visuel de traumatisme
        if (sh.hp < prevHP) {
          add([
            text("-15%", { size: 14 }),
            pos(sh.pos.x, sh.pos.y - 40),
            anchor("center"),
            color(255, 120, 120),
            lifespan(1.5),
            z(50)
          ]);
        }
      }
    });
    
    // E. Message narratif
    add([
      text(`"${s.name}" RÉAFFECTÉ`, { 
        size: 20,
        weight: "bold" 
      }),
      pos(width() / 2, height() / 2 - 50),
      anchor("center"),
      color(220, 120, 120),
      lifespan(2.5),
      z(200)
    ]);
    
    add([
      text(`${s.pop} personnes sacrifiées`, { size: 14 }),
      pos(width() / 2, height() / 2 - 20),
      anchor("center"),
      color(200, 150, 150),
      lifespan(2.5),
      z(200)
    ]);
    
    // F. Cooldown
    canCannibalize = false;
    cannibalizeCooldown = 45;
    
    // G. Désélectionner
    selectedShelter = null;
    
    // H. Vérifier fin de jeu
    if (sheltersAlive <= endWhenAliveLE) {
      wait(2.0, () => {
        if (!gameEnded) endGame();
      });
    }
  });

  // --- INFOS ---
  const infoText = add([
    text("", { size: 14 }),
    pos(width() - 20, 120),
    anchor("topright"),
    color(220, 230, 250)
  ]);

  function updateInfo() {
    const alive = shelters.filter(s => !s.dead).length;
    const crises = shelters.filter(s => s.crisis && !s.dead).length;
    infoText.text = 
      `Temps: ${Math.floor(gameTime)}s\n` +
      `Abris: ${alive}/5\n` +
      `Crises: ${crises}\n` +
      `Fréq: ${crisisEvery.toFixed(1)}s`;
  }

  // --- JEU PRINCIPAL ---
  let sheltersAlive = 5;
  let gameEnded = false;

  loop(crisisEvery, () => {
    if (gameEnded) return;
    const available = shelters.filter(s => !s.dead && !s.crisis);
    if (available.length > 0) startCrisis(pickLocal(available));
  });

  onUpdate(() => {
    if (gameEnded) return;
    
    gameTime += dt();
    if (gameTime >= 60) {
  endGame();
  return;
}

    updateInfo();

    // Mettre à jour le drag
    if (dragging?.icon) dragging.icon.pos = mousePos();

    // Gestion du cooldown du bouton cannibaliser
    if (cannibalizeCooldown > 0) {
      cannibalizeCooldown -= dt();
      cooldownText.text = `${Math.ceil(cannibalizeCooldown)}s`;
      cooldownText.color = rgb(255, 150, 150);
      cannibalizeBtn.color = rgb(50, 25, 25);
    } else if (!canCannibalize) {
      canCannibalize = true;
      cooldownText.text = "PRÊT";
      cooldownText.color = rgb(180, 255, 180);
      cannibalizeBtn.color = rgb(70, 35, 35);
    }

    // Effet visuel pour l'abri sélectionné
    if (selectedShelter && !selectedShelter.dead) {
      const pulse = 1 + 0.03 * Math.sin(gameTime * 10);
      selectedShelter.node.scale = vec2(pulse);
    }

    // Mettre à jour les abris
    shelters.forEach(s => {
      if (s.dead) return;

      setHP(s, s.hp - 0.8 * decayMult * dt());

      if (s.crisis) {
        s.crisisT += dt();
        setHP(s, s.hp - s.crisis.decay * decayMult * dt());
        
        const pulse = 1 + 0.05 * Math.sin(gameTime * 8);
        s.node.scale = vec2(pulse);
        
        if (s.crisisT > crisisAggravateAfter) {
          setHP(s, s.hp - 5.0 * dt());
        }
      }

      if (s.hp <= 0 && !s.dead) {
        s.dead = true;
        sheltersAlive--;
        s.node.color = rgb(50, 50, 60);
        clearCrisis(s);
        
        addKaboom(s.pos);
        
        if (sheltersAlive <= endWhenAliveLE) {
          endGame();
        }
      }
    });
  });

  let dropTimer = 0;
  onUpdate(() => {
    if (gameEnded) return;
    dropTimer += dt();
    if (dropTimer >= 8.0) {
      dropTimer = 0;
      const keys = ["air", "power", "order", "food"];
      const k = pickLocal(keys);
      resources[k] = Math.min(maxStock[k], resources[k] + 1);
    }
  });

  onMouseRelease(() => {
    if (!dragging) return;
    
    const kind = dragging.key;
    const m = mousePos();
    const target = shelters.find(s => !s.dead && m.dist(s.pos) <= 45);
    
    if (target && resources[kind] > 0) {
      resources[kind]--;
      
      if (target.crisis && target.crisis.key === kind) {
        const heal = 30 * healMult;
        setHP(target, target.hp + heal);
        clearCrisis(target);
        addKaboom(target.pos);
        add([
          text("✓", { size: 24 }),
          pos(target.pos.x, target.pos.y + 80),
          anchor("center"),
          color(100, 255, 100),
          lifespan(1.0)
        ]);
      } else {
        setHP(target, target.hp - 8);
        add([
          text("✗", { size: 24 }),
          pos(target.pos.x, target.pos.y + 80),
          anchor("center"),
          color(255, 100, 100),
          lifespan(1.0)
        ]);
      }
    }
    
    destroy(dragging.icon);
    dragging = null;
  });

// --- FONCTION DE FIN AVEC 3 ISSUES ---
function endGame() {
  gameEnded = true;
  
  const survivors = shelters.filter(s => !s.dead).length;
  const deadCount = shelters.filter(s => s.dead).length;
  const totalDead = shelters.filter(s => s.dead).reduce((sum, s) => sum + s.pop, 0);
  
  // DÉTERMINER L'ISSUE SELON LE TEMPS
  let issue = "";
  let message = "";
  let victory = false;
  
  // 1. VICTOIRE : tenu au moins 60 secondes
  if (gameTime >= 60) {
    victory = true;
    issue = "TEMPS GAGNÉ";
    message = 
      "Bravo. Tu as tenu suffisamment longtemps\n" +
      "pour que les secours arrivent.\n\n" +
      "Le système est rechargé.\n" +
      "L'air est filtré.\n" +
      "Les stocks sont remplis.\n\n" +
      "Mais combien de temps cela va-t-il tenir ?";
    
  // 2. ÉCHEC : moins de 60 secondes (existant)
} else if (deadCount >= 4 || (gameTime < 60 && deadCount >= 2)) {
  issue = "ÉCHEC TOTAL";
  message = 
    "Tu n'as même pas réussi à gérer l'apocalypse.\n\n" +
    "Trop de morts, trop vite. L'effondrement n'est pas une crise\n" +
    "à gérer, c'est un monde à subir.\n\n" +
    "Peut-être devrais-tu revoir tes priorités.";
  
  // Bouton Recommencer spécifique
  wait(0.5, () => {
    const btn = add([
      rect(200, 40),
      pos(width() / 2, height() - 100),
      anchor("center"),
      area(),
      color(70, 30, 30),
      outline(2, rgb(200, 80, 80)),
      z(1002),
      "retry_btn"
    ]);
    
    add([
      text("RECOMMENCER (+1 boucle)", { size: 14 }),
      pos(width() / 2, height() - 100),
      anchor("center"),
      color(240, 180, 180),
      z(1003)
    ]);
    
    onClick("retry_btn", () => {
      state.loops = (state.loops ?? 0) + 1;
      state.lastMessage = `ÉCHEC au triage - retour au présent C (boucle #${state.loops})`;
      go("minigame_bullethell", { state });
    });
  });
  
  // 3. SURVIE AMÈRE (parcours normal, mais < 60s)
  } else {
    issue = "SURVIE AMÈRE";
    message = 
      "Le système tient… à quelques abris près.\n\n" +
      "Tu as choisi qui vivrait. Ils vivront dans l'enfer\n" +
      "que tu leur as laissé.\n\n" +
      "La transition est 'réussie'. Voilà son visage.";
  }
  
  // ÉCRAN DE FIN
  add([rect(width(), height()), pos(0, 0), color(0, 0, 0), opacity(0.85), z(1000)]);
  
  // Titre selon l'issue
  add([
    text(issue, { 
      size: 42,
      font: "sans-serif",
      weight: "bold"
    }),
    pos(width() / 2, 140),
    anchor("center"),
    color(victory ? rgb(100, 220, 140) : (issue === "ÉCHEC TOTAL" ? rgb(255, 120, 120) : rgb(255, 200, 150))),
    z(1001)
  ]);
  
  // Statistiques
  add([
    text(
      `Temps tenu : ${Math.floor(gameTime)} secondes\n` +
      `Abris survivants : ${survivors}/5\n` +
      `Vies perdues : ${totalDead} personnes\n` +
      (victory ? `Temps requis : 60 secondes` : `Objectif : tenir 60 secondes`),
      { size: 18 }
    ),
    pos(width() / 2, 220),
    anchor("center"),
    color(220, 230, 240),
    z(1001)
  ]);
  
  // Message principal
  add([
    text(message, { 
      size: 16,
      width: 700,
      lineSpacing: 8
    }),
    pos(width() / 2, 320),
    anchor("center"),
    color(200, 210, 230),
    z(1001)
  ]);
  
  // Instructions selon l'issue
const instruction = victory 
  ? "ESPACE : accepter cette victoire temporaire"
  : issue === "ÉCHEC TOTAL" 
  ? "CLIC sur le bouton pour recommencer"  // ← Changé ici
  : "ESPACE : accepter et continuer";
  
  add([
    text(instruction, { size: 14 }),
    pos(width() / 2, height() - 80),
    anchor("center"),
    color(180, 190, 210),
    z(1001)
  ]);
  
  // ACTION FINALE
onKeyPress("space", () => {
  if (victory) {
    // VICTOIRE : fin spéciale
    state.lastMessage = `VICTOIRE au triage - ${Math.floor(gameTime)}s, ${survivors} abris, ${totalDead} morts`;
    go("ending", { state });
  } else if (issue === "SURVIE AMÈRE") {
    // SURVIE AMÈRE seulement (pas d'échec avec ESPACE)
    state.lastMessage = `Futur C - ${survivors} abris, ${totalDead} morts (${Math.floor(gameTime)}s)`;
    go("ending", { state });
  }
  // Pour l'échec total, on ne fait rien avec ESPACE - seulement le bouton
});
}
  
  // Permettre d'abandonner avec ÉCHAP
  onKeyPress("escape", () => {
    if (!gameEnded) {
      // Abandon = échec total
      const survivors = shelters.filter(s => !s.dead).length;
      const totalDead = shelters.filter(s => s.dead).reduce((sum, s) => sum + s.pop, 0);
      
      state.lastMessage = `ABANDON du triage - ${survivors} abris survivants`;
      state.failedFuture = true;
      go("minigame_bullethell", { state });
    }
  });
});














// -------------------- Scène de fin par inaction (version épurée) --------------------
scene("inaction_end", ({ state }) => {
  ensureBG(state);
  
  // Fond sombre pour lisibilité
  add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(0.85),
    fixed(),
    z(100)
  ]);
  
  // --- TITRE PRINCIPAL ---
  add([
    text("INACTION", { 
      size: 56, 
      font: "monospace",
      weight: "bold"
    }),
    pos(width() / 2, 100),
    anchor("center"),
    color(200, 200, 200),
    fixed(),
    z(110)
  ]);
  
  // --- MESSAGE PHARE ---
  add([
    text("Ne pas faire de choix,", { 
      size: 24 
    }),
    pos(width() / 2, 160),
    anchor("center"),
    color(220, 220, 220),
    fixed(),
    z(110)
  ]);
  
  add([
    text("ne pas agir...", { 
      size: 24 
    }),
    pos(width() / 2, 190),
    anchor("center"),
    color(220, 220, 220),
    fixed(),
    z(110)
  ]);
  
  add([
    text("C'est aussi un choix.", { 
      size: 32,
      font: "monospace",
      weight: "bold"
    }),
    pos(width() / 2, 230),
    anchor("center"),
    color(240, 200, 100),
    fixed(),
    z(110)
  ]);
  
  // --- SÉPARATEUR ---
  add([
    rect(500, 1),
    pos(width() / 2, 270),
    anchor("center"),
    color(80, 90, 120),
    fixed(),
    z(110)
  ]);
  
  // --- STATISTIQUES SIMPLES ---
  add([
    text("BILAN DE L'INACTION", { 
      size: 18,
      font: "monospace"
    }),
    pos(width() / 2, 310),
    anchor("center"),
    color(180, 190, 220),
    fixed(),
    z(110)
  ]);
  
  // Cadre simple pour les stats
  add([
    rect(300, 60),
    pos(width() / 2, 350),
    anchor("center"),
    color(30, 35, 50),
    outline(1, rgb(70, 85, 130)),
    fixed(),
    z(105)
  ]);
  
  // Chiffres
  add([
    text("0", { 
      size: 28,
      font: "monospace"
    }),
    pos(width() / 2 - 70, 350),
    anchor("center"),
    color(100, 220, 140),
    fixed(),
    z(110)
  ]);
  
  add([
    text("blocs verts", { 
      size: 14 
    }),
    pos(width() / 2 - 70, 380),
    anchor("center"),
    color(150, 200, 170),
    fixed(),
    z(110)
  ]);
  
  add([
    text("0", { 
      size: 28,
      font: "monospace"
    }),
    pos(width() / 2 + 70, 350),
    anchor("center"),
    color(220, 100, 100),
    fixed(),
    z(110)
  ]);
  
  add([
    text("blocs rouges", { 
      size: 14 
    }),
    pos(width() / 2 + 70, 380),
    anchor("center"),
    color(200, 150, 150),
    fixed(),
    z(110)
  ]);
  
  // --- INTERPRÉTATION ---
  add([
    text("En restant immobile,", { 
      size: 18 
    }),
    pos(width() / 2, 430),
    anchor("center"),
    color(180, 190, 210),
    fixed(),
    z(110)
  ]);
  
  add([
    text("le système a suivi sa trajectoire par défaut.", { 
      size: 18 
    }),
    pos(width() / 2, 455),
    anchor("center"),
    color(180, 190, 210),
    fixed(),
    z(110)
  ]);
  
  // --- BOUTON PRINCIPAL ---
  const restartBtn = add([
    rect(280, 50),
    pos(width() / 2, 520),
    anchor("center"),
    color(40, 45, 70),
    outline(2, rgb(90, 100, 150)),
    area(),
    "restart_btn",
    fixed(),
    z(110)
  ]);
  
  const btnText = add([
    text("RECOMMENCER", { 
      size: 22,
      font: "monospace",
      letterSpacing: 1
    }),
    pos(width() / 2, 520),
    anchor("center"),
    color(230, 230, 250),
    fixed(),
    z(111)
  ]);
  
  // --- ANIMATION DU BOUTON ---
  let btnScale = 1;
  restartBtn.onUpdate(() => {
    btnScale = 1 + Math.sin(time() * 2) * 0.02;
    restartBtn.scale = vec2(btnScale);
    btnText.scale = vec2(btnScale);
  });
  
  // Effet de survol
  onHover("restart_btn", (btn) => {
    btn.color = rgb(50, 55, 85);
    btn.outline.color = rgb(120, 130, 180);
  });
  
  onHoverEnd("restart_btn", (btn) => {
    btn.color = rgb(40, 45, 70);
    btn.outline.color = rgb(90, 100, 150);
  });
  
  // --- ACTIONS ---
  onClick("restart_btn", () => {
    beep("bad");
    state.loops = (state.loops || 0) + 1;
    state.lastMessage = "Inaction totale. Le système continue sans toi.\nBoucle #" + state.loops + " - retour à la préhistoire.";
    go("story", { nodeId: "prehistory", state });
  });
  
  onKeyPress("space", () => {
    state.loops = (state.loops || 0) + 1;
    state.lastMessage = "Inaction totale. Le système continue sans toi.\nBoucle #" + state.loops + " - retour à la préhistoire.";
    go("story", { nodeId: "prehistory", state });
  });
  
  // --- INSTRUCTION MINIMALE ---
  add([
    text("ESPACE ou clic pour continuer", { 
      size: 14 
    }),
    pos(width() / 2, 570),
    anchor("center"),
    color(140, 150, 180),
    fixed(),
    z(110)
  ]);
});









// -------------------- Ending Scene --------------------
scene("ending", ({ state }) => {
  ensureBG(state);
  
  // Fond sombre pour lisibilité
  add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(0.85),
    fixed(),
    z(100)
  ]);
  
  add([
    text("FIN DU JEU", { 
      size: 56, 
      font: "monospace",
      weight: "bold"
    }),
    pos(width() / 2, 100),
    anchor("center"),
    color(240, 240, 150),
    fixed(),
    z(110)
  ]);
  
  const co2 = Math.round((state.co2 ?? 0.25) * 100);
  const bio = Math.round((state.bio ?? 0.8) * 100);
  const well = Math.round((state.well ?? 0.4) * 100);
  const loops = state.loops ?? 0;
  
  add([
    text(`CO₂: ${co2}%   Biodiv: ${bio}%   Bien-être: ${well}%   Boucles: ${loops}`, { 
      size: 20 
    }),
    pos(width() / 2, 170),
    anchor("center"),
    color(200, 200, 220),
    fixed(),
    z(110)
  ]);
  
  // Message selon l'issue
  let verdict = "";
  const mg2Outcome = state.mg2?.outcome;
  
  if (mg2Outcome === "clean") {
    verdict = "Tu as réussi à garder l'accord propre. Mais à quel prix social ?";
  } else if (mg2Outcome === "dirty") {
    verdict = "L'accord est passé, mais il est vidé de sens. Une victoire à la Pyrrhus.";
  } else {
    verdict = "Le monde continue. Pas forcément mieux, mais il continue.";
  }
  
  add([
    text(verdict, { 
      size: 22,
      width: width() - 100,
      lineSpacing: 10
    }),
    pos(width() / 2, 240),
    anchor("center"),
    color(220, 220, 240),
    fixed(),
    z(110)
  ]);
  
  // Bouton pour recommencer
  const restartBtn = add([
    rect(300, 50),
    pos(width() / 2, 380),
    anchor("center"),
    color(40, 45, 70),
    outline(2, rgb(90, 100, 150)),
    area(),
    "restart_btn",
    fixed(),
    z(110)
  ]);
  
  add([
    text("REJOUER", { 
      size: 28,
      font: "monospace"
    }),
    pos(width() / 2, 380),
    anchor("center"),
    color(230, 230, 250),
    fixed(),
    z(111)
  ]);
  
  // Interactions
  // Interactions
onClick("restart_btn", () => {
  go("start");
});

onKeyPress("space", () => {
  go("start");
});
  
  // Instruction
  add([
    text("ESPACE ou clic pour rejouer", { 
      size: 16 
    }),
    pos(width() / 2, 450),
    anchor("center"),
    color(160, 170, 200),
    fixed(),
    z(110)
  ]);
});











// -------------------- Start --------------------
scene("start", () => {
  const state = {
    co2: 0.25,
    bio: 0.80,
    well: 0.40,
    loops: 0,
    presentType: null,
    lastMessage: "",
    mg2Memory: null,
    mg2: null,
    bhBonus: null,
    bg: null,
  };

  // ✅ crée le bg pour la scène start
  ensureBG(state);

  go("title", { state });
});

go("start");

// --- SFX sans fichiers (bips) ---
function beep(type = "good") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "square";
    o.frequency.value = type === "good" ? 880 : 220;
    g.gain.value = 0.06;

    o.connect(g);
    g.connect(ctx.destination);

    o.start();
    o.stop(ctx.currentTime + 0.08);

    setTimeout(() => ctx.close(), 120);
  } catch (e) {}
}

