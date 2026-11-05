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
    'Étudiant en 3e année de BUT Informatique à l’IUT de Blagnac. Je cherche mon stage de 3e année, orienté analyse de données.',
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
  stripData: ['SQL', 'Oracle', 'Power BI', 'Power Apps', 'Power Automate', 'SharePoint', 'Neo4j'],
  stripDev: [
    'Java',
    'Python',
    'C',
    'PHP',
    'JavaScript',
    'React',
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
        { name: 'Power Apps', logo: 'powerapps' },
        { name: 'Power Automate', logo: 'powerautomate' },
        { name: 'SharePoint', logo: 'sharepoint' },
        { name: 'Neo4j', logo: 'neo4j', learning: true },
      ],
      note: 'Conception de bases relationnelles, rapports et tableaux de bord, applications métier connectées.',
    },
    {
      title: 'Web',
      items: [
        { name: 'HTML', logo: 'html5' },
        { name: 'CSS', logo: 'css3' },
        { name: 'JavaScript', logo: 'javascript' },
        { name: 'PHP', logo: 'php' },
        { name: 'React', logo: 'react' },
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
        { name: 'C', logo: 'c' },
      ],
      note: 'Programmation objet, applications avec interface graphique.',
    },
  ] satisfies { title: string; lead?: boolean; items: Skill[]; note: string }[],
  vibe: {
    title: 'Vibe coding',
    tool: { name: 'Claude Code', logo: 'claude' },
    note: 'Je sais développer avec un agent IA : je décris précisément mes besoins, je lui donne les bons outils, je relis et je fais corriger jusqu’au résultat voulu. C’est comme ça que j’ai construit ce portfolio.',
    items: [
      'Des prompts précis, avec le contexte et des références visuelles',
      'Des skills et des plugins pour cadrer le design et le code',
      'Une relecture à chaque version, puis des corrections ciblées',
    ],
  },
  soft: ['Apprentissage rapide', 'Travail en équipe', 'Curiosité pour les nouvelles technologies'],
  languages: [{ name: 'Anglais', level: 'B2' }],
};

/* ---------- Projets ---------- */

export type Project = {
  id: 'tournoi' | 'bdd' | 'portfolio';
  title: string;
  context: string;
  stack: string[];
  summary: string;
  did: string[];
};

export const projects: Project[] = [
  {
    id: 'tournoi',
    title: 'Gestion de tournois e-sport',
    context: 'Projet universitaire · IUT de Blagnac',
    stack: ['Java'],
    summary:
      'Une application de bureau pour organiser des tournois e-sport : équipes, matchs et résultats.',
    did: [
      'Analyse des besoins avant de coder.',
      'Conception de l’application et de son modèle.',
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
      'Le site que vous parcourez : je l’ai construit avec Claude Code. Mon travail a été de bien décrire ce que je voulais, de bien outiller l’agent et de juger chaque version.',
    did: [
      'Des prompts détaillés : contenu, ordre des sections, effets voulus, références de design à suivre.',
      'Des skills et des plugins Claude pour élever le niveau : taste-skill, impeccable, ui-ux-pro-max, ponytail, les skills d’Emil Kowalski.',
      'Trois séries de corrections : à chaque version, je relis tout et je liste précisément ce qui ne va pas, jusqu’à ce résultat.',
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
  text: string;
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
      text: 'Le collège, à Tournefeuille.',
    },
    {
      from: 2021,
      to: 2023,
      years: '2021–2023',
      title: 'Lycée Rive Gauche',
      place: 'Toulouse',
      text: 'Spécialités mathématiques et HGGSP. Bac obtenu avec mention assez bien.',
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
  role: 'Développeur Full-Stack & Power Platform',
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
      detail: 'Un rapport complet pour analyser et visualiser l’inventaire du parc serveurs.',
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

export type Hobby = { id: 'jeux' | 'musique' | 'echecs' | 'voyages'; title: string; text: string };

export const loisirs = {
  heading: 'Loisirs',
  hobbies: [
    {
      id: 'jeux',
      title: 'Jeux vidéo',
      text: 'Depuis tout petit, les jeux vidéo ont pris une grande part dans ma vie : jeux de stratégie, jeux d’équipe.',
    },
    {
      id: 'musique',
      title: 'Musique',
      text: 'J’en écoute tous les jours : elle m’aide à me concentrer quand je code et à décrocher après une journée chargée.',
    },
    { id: 'echecs', title: 'Échecs', text: 'Anticiper, calculer, choisir le bon coup.' },
    { id: 'voyages', title: 'Voyages', text: 'Découvrir de nouveaux endroits, d’autres cultures et d’autres façons de vivre.' },
  ] satisfies Hobby[],
};

/* ---------- Voyages ---------- */

export const voyages = {
  final: 'Hong Kong',
};

export const contact = { greeting: 'Écrivez-moi', place: 'Toulouse · Blagnac' };

export const credits = [
  {
    what: 'Pic du Midi d’Ossau (photo de l’accueil, découpée en calques)',
    who: 'Tournasol7',
    licence: 'CC BY 4.0',
    url: 'https://commons.wikimedia.org/wiki/File:Pic_du_Midi_d%27Ossau_(7).jpg',
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
  cities:
    'Photos de Lisbonne, Montréal, Toronto et Shenzhen : photos d’illustration, droits réservés à leurs auteurs. Si vous êtes l’auteur de l’une d’elles et souhaitez être crédité ou la voir retirée, écrivez-moi.',
  hongKong: 'Hong Kong : image de synthèse, capture de la scène 3D du site.',
  logos:
    'Logos : Devicon (licence MIT) ; Power BI, Power Apps, Power Automate et SharePoint via Wikimedia Commons (domaine public). Ce sont des marques de leurs propriétaires, utilisées seulement pour désigner les outils.',
  font: 'Police : Hanken Grotesk (SIL Open Font License), hébergée avec le site.',
  privacy:
    'Ce site ne dépose aucun cookie, n’utilise aucun outil de mesure d’audience et ne contient aucun formulaire : je ne collecte aucune donnée personnelle. Comme tout hébergeur, GitHub peut enregistrer des données techniques de connexion, dont l’adresse IP, pour la sécurité du service.',
  privacyUrl:
    'https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement',
  links:
    'Les liens vers d’autres sites (GitHub, LinkedIn, OpenStreetMap, Wikimedia Commons) sont donnés pour information : leur contenu ne dépend pas de moi.',
};
