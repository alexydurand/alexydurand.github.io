/** Tout le texte du site, tiré du CV d'Alexy (novembre 2026). */

export const person = {
  firstName: 'Alexy',
  lastName: 'Durand',
  role: 'Étudiant en 3e année de BUT Informatique',
  email: 'alexy.drnd25@gmail.com',
  github: 'https://github.com/alexydurand',
  githubLabel: 'github.com/alexydurand',
  linkedin: 'https://www.linkedin.com/in/alexy-durand',
  linkedinLabel: 'linkedin.com/in/alexy-durand',
  cv: 'cv/CV-Alexy-Durand.pdf',
};

export const hero = {
  sentence:
    'Ce qui me plaît dans l’informatique, c’est d’apprendre en continu : chaque projet me fait découvrir un nouvel outil ou une nouvelle façon de faire.',
  action: 'Télécharger mon CV',
  secondary: 'Me contacter',
};

export const nav = [
  { href: '#projets', label: 'Projets' },
  { href: '#parcours', label: 'Parcours' },
  { href: '#stage', label: 'Stage' },
  { href: '#loisirs', label: 'Loisirs' },
  { href: '#contact', label: 'Contact' },
];

/* ---------- Compétences ---------- */

// logo = file name in src/assets/logos (without .svg)
export type Skill = { name: string; logo: string; learning?: boolean };

export const skills = {
  heading: 'Ce que je sais faire',
  // The moving strips: data first, then the rest
  stripData: ['SQL', 'Oracle', 'Power BI', 'SharePoint', 'Neo4j'],
  stripDev: [
    'Java',
    'Python',
    'Godot',
    'Power Apps',
    'Power Automate',
    'Git',
    'PHP',
    'JavaScript',
    'React',
    'Vue',
    'Node.js',
    'Express',
    'HTML',
    'CSS',
  ],
  groups: [
    {
      title: 'Données',
      lead: true,
      items: [
        { name: 'Oracle SQL', logo: 'sqldeveloper' },
        { name: 'Power BI', logo: 'powerbi' },
        { name: 'SharePoint', logo: 'sharepoint' },
        { name: 'Neo4j', logo: 'neo4j', learning: true },
      ],
      note: 'Conception de bases relationnelles, rapports et tableaux de bord.',
    },
    {
      title: 'Web',
      items: [
        { name: 'HTML', logo: 'html5' },
        { name: 'CSS', logo: 'css3' },
        { name: 'JavaScript', logo: 'javascript' },
        { name: 'PHP', logo: 'php' },
        { name: 'React', logo: 'react' },
        { name: 'Vue', logo: 'vue' },
        { name: 'Node.js', logo: 'nodejs' },
        { name: 'Express', logo: 'express' },
      ],
      note: 'Sites responsive, API REST, front et back.',
    },
    {
      title: 'Développement',
      items: [
        { name: 'Java', logo: 'java' },
        { name: 'Python', logo: 'python' },
        { name: 'Godot', logo: 'godot' },
        { name: 'Power Apps', logo: 'powerapps' },
        { name: 'Power Automate', logo: 'powerautomate' },
        { name: 'Git', logo: 'git' },
      ],
      note: 'Programmation objet, jeu 3D sous Godot, applications métier low-code, versionnage avec Git.',
    },
  ] satisfies { title: string; lead?: boolean; items: Skill[]; note: string }[],
  vibe: {
    title: 'Vibe coding',
    tool: { name: 'Claude Code', logo: 'claude' },
    // Each point: the practice, then what it means
    items: [
      ['Prompting', 'décrire précisément le besoin, avec le contexte et des références visuelles'],
      [
        'Skills et plugins',
        'outiller l’agent pour le design, l’accessibilité et la qualité du code',
      ],
      ['Review et correction', 'relire chaque version et faire corriger jusqu’au résultat voulu'],
    ],
  },
  soft: ['Apprentissage rapide', 'Travail en équipe', 'Curiosité pour les nouvelles technologies'],
  languages: [{ name: 'Anglais', level: 'B2' }],
};

/* ---------- Projets ---------- */

export type Project = {
  id: 'killkeny' | 'bomberman' | 'tournoi' | 'bdd' | 'portfolio';
  title: string;
  context: string;
  // Shown as a badge next to the context
  status?: string;
  stack: string[];
  summary: string;
  did: string[];
};

export const projects: Project[] = [
  {
    id: 'killkeny',
    title: 'Kill Keny : site et application',
    context: 'SAE de 3e année · IUT de Blagnac · équipe de 5',
    status: 'En cours',
    stack: ['Vue', 'Pinia', 'Node.js', 'Express', 'MariaDB', 'WordPress', 'Git'],
    summary:
      'Pour Kill Keny, un vrai groupe de reprises, nous réalisons un site vitrine WordPress et une application web installable (PWA) qui centralisera agenda, setlists, contrats et matériel. Je travaille surtout sur l’application : front en Vue, back en Express.',
    did: [
      'Fait : cadrage avec la cliente, cahier des charges et maquettes, en méthode Scrum.',
      'Fait : inscription et connexion sécurisées (bcrypt, JWT en cookie httpOnly), navigation responsive, mode sombre.',
      'En cours : les groupes, où chaque membre n’accède qu’aux données de son groupe. À venir : agenda, setlists, contrats PDF.',
    ],
  },
  {
    id: 'bomberman',
    title: 'Bomberman 3D sous Godot',
    context: 'TP de 3e année · IUT de Blagnac · équipe de 4',
    stack: ['Godot', 'GDScript', 'Git'],
    summary:
      'En cinq séances, nous avons refait le principe de Bomberman en 3D : bombes qui explosent en croix, murs destructibles, ennemis autonomes et bonus. Chacun avait son domaine, réparti en user stories. Le mien : la boucle de jeu, des vies du joueur à la fin de partie.',
    did: [
      'Les vies : une explosion ou un ennemi retire une vie, et le joueur réapparaît à son point de départ.',
      'La fin de partie : un GameManager global compte les vies et les ennemis, puis déclare la défaite ou la victoire.',
      'L’interface : trois cœurs mis à jour par signal, et un écran de fin qui met le jeu en pause et permet de relancer.',
      'Le décor du niveau : l’herbe et les fleurs.',
    ],
  },
  {
    id: 'tournoi',
    title: 'Gestion de tournois e-sport',
    context: 'Projet universitaire · IUT de Blagnac',
    stack: ['Java'],
    summary: 'Une application en Java pour gérer des tournois e-sport, avec une interface graphique.',
    did: [
      'Analyse des besoins avant de coder.',
      'Conception de l’application.',
      'Développement en Java d’une interface graphique fonctionnelle.',
    ],
  },
  {
    id: 'bdd',
    title: 'Base de données relationnelle',
    context: 'Projet universitaire · IUT de Blagnac',
    stack: ['Oracle SQL Developer', 'SQL'],
    summary: 'Une base de données conçue à partir d’un cahier des charges, puis interrogée en SQL.',
    did: [
      'Lecture du cahier des charges et modélisation des données.',
      'Création des tables et des contraintes sous Oracle SQL Developer.',
      'Requêtes pour mettre à jour et interroger la base.',
    ],
  },
  {
    id: 'portfolio',
    title: 'Ce portfolio, en vibe coding',
    context: 'Projet personnel · 2026',
    stack: ['Claude Code', 'React', 'TypeScript', 'Tailwind CSS', 'Three.js', 'GSAP'],
    summary:
      'Le site que vous parcourez : je l’ai construit avec Claude Code.',
    did: [
      'Des prompts détaillés : contenu, ordre des sections, effets voulus, références de design à suivre.',
      'Des skills et des plugins Claude : taste-skill, impeccable, ui-ux-pro-max, ponytail et les skills d’Emil Kowalski.',
      'Review et corrections de code : à chaque version, je relis tout et je liste précisément les améliorations à faire, jusqu’à ce résultat.',
    ],
  },
];

/* ---------- Parcours ---------- */

export type Milestone = {
  from: number;
  to: number;
  years: string;
  title: string;
  place: string;
  text?: string;
  current?: boolean;
};

export const parcours = {
  heading: 'Mon parcours',
  start: 2018,
  end: 2027,
  milestones: [
    {
      from: 2018,
      to: 2021,
      years: '2018–2021',
      title: 'Collège Léonard de Vinci',
      place: 'Tournefeuille',
    },
    {
      from: 2021,
      to: 2023,
      years: '2021–2023',
      title: 'Lycée Rive Gauche',
      place: 'Toulouse',
      text: 'Spécialités mathématiques et histoire-géographie, géopolitique et sciences politiques.',
    },
    {
      from: 2024,
      to: 2027,
      years: '2024–2027',
      title: 'BUT Informatique',
      place: 'IUT de Blagnac',
      text: 'En cours, 3e année : programmation, bases de données, développement web.',
      current: true,
    },
  ] satisfies Milestone[],
};

/* ---------- Stage ---------- */

export type Mission = { title: string; detail: string; tools: string[]; url?: string };

export const stage = {
  heading: ['Mon stage', 'chez', 'Orange'],
  // Non-breaking hyphen: the line never breaks inside "Full-Stack"
  role: 'Développeur Full‑Stack & Power Platform',
  place: 'Orange, Balma',
  year: '2026',
  intro:
    'Mon stage de 2e année s’est déroulé chez Orange, à Balma. J’y ai construit des outils internes avec la Power Platform de Microsoft et développé deux sites web.',
  missions: [
    {
      title: 'Deux applications Power Apps',
      detail: 'Connectées à SharePoint, avec des flux automatisés grâce à Power Automate.',
      tools: ['Power Apps', 'SharePoint', 'Power Automate'],
    },
    {
      title: 'Un rapport Power BI',
      detail: 'Un rapport complet pour analyser et visualiser l’inventaire du parc de serveurs.',
      tools: ['Power BI'],
    },
    {
      title: 'Un site de sensibilisation cyber',
      detail:
        'Développé en HTML, CSS et JavaScript pour être diffusé sur les canaux internes d’Orange.',
      tools: ['HTML', 'CSS', 'JavaScript'],
      url: 'https://sitewebcyber.z43.web.core.windows.net/pages/index.html',
    },
    {
      title: 'Un site portfolio full-stack',
      detail: 'Front en React, back en Node.js et Express, avec une API REST.',
      tools: ['React', 'Node.js', 'Express', 'API REST'],
    },
  ] satisfies Mission[],
  takeaway:
    'Ce stage m’a donné envie d’aller plus loin dans la donnée : c’est l’orientation que je cherche pour mon stage de 3e année.',
};

/* ---------- Loisirs ---------- */

// games: logos in src/assets/logos (Wikimedia Commons, see legal.logos)
export type Hobby = {
  id: 'jeux' | 'musique' | 'f1' | 'echecs' | 'voyages';
  title: string;
  // Neither text nor records: the row does not open (Voyages, whose pictures follow right below)
  text?: string;
  games?: { name: string; logo: string }[];
  // cover = file name in src/assets/music
  records?: { album: string; artist: string; cover: string }[];
  // Logo shown with the text (src/assets/logos)
  logo?: { name: string; file: string };
  // Shown under the picture on the right (F1 circuit)
  caption?: string;
};

export const loisirs = {
  heading: 'Loisirs',
  hobbies: [
    {
      id: 'jeux',
      title: 'Esports',
      text: 'Je regarde surtout les grands événements de quatre jeux : League of Legends, Counter-Strike 2, Valorant et Rocket League. Ce que j’aime : le niveau des meilleures équipes et l’ambiance des salles pleines.',
      games: [
        { name: 'League of Legends', logo: 'lol' },
        { name: 'Counter-Strike 2', logo: 'cs2' },
        { name: 'Valorant', logo: 'valorant' },
        { name: 'Rocket League', logo: 'rocketleague' },
      ],
    },
    {
      id: 'musique',
      title: 'Musique',
      records: [
        { album: 'Currents', artist: 'Tame Impala', cover: 'currents' },
        { album: 'Social Cues', artist: 'Cage the Elephant', cover: 'social-cues' },
        { album: '444 Nuits', artist: 'Népal', cover: 'nepal' },
      ],
    },
    {
      id: 'f1',
      title: 'Formule 1',
      logo: { name: 'Formula 1', file: 'f1' },
      text: 'Je suis chaque Grand Prix, des qualifications à l’arrivée : le départ, les stratégies d’arrêt aux stands, les données de télémétrie, les duels jusqu’au dernier tour.',
      caption: 'Circuit de Monza, Italie',
    },
    {
      id: 'echecs',
      title: 'Échecs',
      text: 'Anticiper, calculer, choisir le bon coup. Ici, la « partie de l’Opéra » de Paul Morphy (1858).',
    },
    { id: 'voyages', title: 'Voyages' },
  ] satisfies Hobby[],
};

/* ---------- Voyages ---------- */

export const voyages = {
  final: 'Hong Kong',
};

export const contact = { greeting: 'Écrivez-moi', place: 'Toulouse · Blagnac' };

export const credits = [
  {
    what: 'La tour Eiffel à l’heure bleue (photo de Paris, Voyages)',
    who: 'Nick-D',
    licence: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Eiffel_Tower_during_the_evening_blue_hour_April_2019.jpg',
  },
  {
    what: 'Le château Saint-Georges et les toits de Lisbonne (photo recadrée, Voyages)',
    who: 'Dale Cruse',
    licence: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Castelo_de_S%C3%A3o_Jorge_and_25_de_Abril_Bridge_Over_Lisbon_Rooftops_(54739478432).jpg',
  },
  {
    what: 'Le centre de Montréal vu du mont Royal (photo de Voyages)',
    who: 'Andre Carrotflower',
    licence: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:20160903_-_02_-_Montreal_(Mount_Royal_Park).jpg',
  },
  {
    what: 'Toronto la nuit (photo recadrée, Voyages)',
    who: 'Andrew Gosine',
    licence: 'CC0',
    url: 'https://commons.wikimedia.org/wiki/File:Night_skyline_of_Toronto,_Canada_374759.jpg',
  },
  {
    what: 'Le centre de Shenzhen la nuit (photo de Voyages)',
    who: 'Sparktour',
    licence: 'CC BY-SA 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Civic_Center,_Shenzhen_Lianhuashan_Park_(2018.9)_Night_(cropped).jpg',
  },
  {
    what: 'Les tours de Hong Kong de nuit (vidéo de la section Voyages, découpée en images)',
    who: 'Henry sur Pexels',
    licence: 'licence Pexels',
    url: 'https://www.pexels.com/video/aerial-footage-of-buildings-at-night-5396825/',
  },
  {
    what: 'La baie de Hong Kong de nuit (vidéo de la section Voyages, découpée en images)',
    who: 'Henry sur Pexels',
    licence: 'licence Pexels',
    url: 'https://www.pexels.com/video/drone-footage-of-a-city-at-night-5396818/',
  },
];

/* ---------- Mentions légales (page mentions-legales.html) ---------- */

export const legal = {
  title: 'Mentions légales',
  updated: 'Dernière mise à jour : novembre 2026',
  host: {
    name: 'GitHub Pages, un service de GitHub, Inc.',
    address: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis',
    url: 'https://support.github.com/contact',
    urlLabel: 'support.github.com/contact',
  },
  ip: 'Les textes, la mise en page et le code de ce site appartiennent à Alexy Durand, sauf les éléments crédités ci-dessous. Ils ne peuvent pas être reproduits sans son accord.',
  extra: [
    'Pochettes des albums Currents (Tame Impala), Social Cues (Cage the Elephant) et 444 Nuits (Népal) : droits réservés à leurs auteurs.',
    'Logo Formula 1 via Wikimedia Commons (domaine public), marque de Formula One Licensing B.V.',
    'Logo Orange via Wikimedia Commons (domaine public), marque d’Orange SA.',
    'Tracé du circuit de Monza d’après la carte de Will Pittenger, Wikimedia Commons (CC BY-SA 3.0), redessiné.',
    'Pièces d’échecs par Cburnett, Wikimedia Commons (CC BY-SA 3.0).',
  ],
  logos:
    'Logos : Devicon (licence MIT) ; Power BI, Power Apps, Power Automate, SharePoint, Counter-Strike 2, League of Legends et Valorant via Wikimedia Commons (domaine public) ; Rocket League par Psyonix via Wikimedia Commons (CC BY-SA 4.0). Ce sont des marques de leurs propriétaires, utilisées seulement pour désigner les outils et les jeux.',
  font: 'Police : Hanken Grotesk (SIL Open Font License), hébergée avec le site.',
  privacy:
    'Ce site ne dépose aucun cookie, n’utilise aucun outil de mesure d’audience et ne contient aucun formulaire : je ne collecte aucune donnée personnelle. Comme tout hébergeur, GitHub peut enregistrer des données techniques de connexion, dont l’adresse IP, pour la sécurité du service.',
  privacyLinks: [
    {
      label: 'Déclaration de confidentialité de GitHub',
      url: 'https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement',
    },
  ],
  links:
    'Les liens vers d’autres sites (GitHub, LinkedIn, OpenStreetMap, Wikimedia Commons) sont donnés pour information : leur contenu ne dépend pas de moi.',
};
