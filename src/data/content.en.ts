/** The whole site in English: same shape as content.fr.ts, which content.ts checks. */
import * as fr from './content.fr';
import type { BilanProof, Hobby, Mission, Project, Skill } from './content.fr';

export const person = { ...fr.person, role: 'Third-year Computer Science student' };

export const hero = {
  sentence:
    'What I love about computing is that I never stop learning: every project shows me a new tool or a new way of doing things.',
  action: 'Download my CV',
  secondary: 'Contact me',
};

export const nav = [
  { href: '#outils', label: 'Tools' },
  { href: '#projets', label: 'Projects' },
  { href: '#bilan', label: 'Skills' },
  { href: '#stage', label: 'Internship' },
  { href: '#loisirs', label: 'Hobbies' },
  { href: '#contact', label: 'Contact' },
];

/* ---------- Tools ---------- */

const [data, web, dev] = fr.skills.groups;

export const skills = {
  ...fr.skills,
  heading: 'My tools',
  groups: [
    { ...data, title: 'Data', note: 'Relational database design, reports and dashboards.' },
    { ...web, title: 'Web', note: 'Responsive websites, REST APIs, front end and back end.' },
    {
      ...dev,
      title: 'Development',
      note: 'Object-oriented programming, a 3D game in Godot, low-code business apps, version control with Git.',
    },
  ] satisfies { title: string; lead?: boolean; items: Skill[]; note: string }[],
  vibe: {
    ...fr.skills.vibe,
    items: [
      ['Prompting', 'describing the need precisely, with context and visual references'],
      ['Skills and plugins', 'equipping the agent for design, accessibility and code quality'],
      ['Review and fixes', 'reviewing every version and having it fixed until it is right'],
    ],
  },
  soft: ['Fast learner', 'Teamwork', 'Curious about new technologies'],
  languages: [{ name: 'English', level: 'B2' }],
};

/* ---------- Projects ---------- */

export const butLinks = {
  open: 'See which skills of my degree this project builds',
  back: 'Back to the project',
  title: 'Skills from my degree',
  intro:
    'My degree, a Bachelor of Technology in Computer Science (BUT), trains me in six skills: build, optimize, administer, manage, lead and collaborate. Here are the ones this project made me work on.',
};

export const projects: Project[] = [
  {
    id: 'killkeny',
    title: 'Kill Keny: website and app',
    context: '3rd-year team project · IUT de Blagnac · team of 5',
    status: 'In progress',
    stack: ['Vue', 'Pinia', 'Node.js', 'Express', 'MariaDB', 'WordPress', 'Git'],
    summary:
      'For Kill Keny, a real cover band, we are building a WordPress showcase site and an installable web app (PWA) that will bring together their calendar, setlists, contracts and equipment. I work mainly on the app: Vue front end, Express back end.',
    did: [
      'Done: scoping with the client, specifications and mock-ups, using Scrum.',
      'Done: secure sign-up and login (bcrypt, JWT in an httpOnly cookie), responsive navigation, dark mode.',
      'Done: bands, where each member can only access their own band’s data. Next: calendar, setlists, PDF contracts.',
    ],
    competences: [
      {
        skill: 'Build',
        how: 'I develop the Vue front end and the Express back end of an installable app that works on phones as well as computers.',
      },
      {
        skill: 'Manage',
        how: 'I protect users’ data: passwords are hashed with bcrypt, and each member can only access their own band’s data.',
      },
      {
        skill: 'Lead',
        how: 'With the client, we scoped the need, wrote the specifications and the mock-ups, then moved forward in Scrum.',
      },
      {
        skill: 'Collaborate',
        how: 'There are five of us: I work mainly on the app and we share the code with Git.',
      },
    ],
  },
  {
    id: 'bomberman',
    title: 'Bomberman 3D in Godot',
    context: '3rd-year lab project · IUT de Blagnac · team of 4',
    stack: ['Godot', 'GDScript', 'Git'],
    summary:
      'In five sessions, we rebuilt the idea of Bomberman in 3D: bombs that explode in a cross, destructible walls, autonomous enemies and power-ups. Each of us owned an area, split into user stories. Mine: the game loop, from the player’s lives to the end of the game.',
    did: [
      'Lives: an explosion or an enemy takes a life, and the player respawns at their starting point.',
      'End of the game: a global GameManager counts lives and enemies, then declares defeat or victory.',
      'Interface: three hearts updated through signals, and an end screen that pauses the game and lets you restart.',
      'The level’s scenery: the grass and the flowers.',
    ],
    competences: [
      {
        skill: 'Build',
        how: 'I coded the game loop: the player’s lives, respawning, the end of the game and the interface.',
      },
      {
        skill: 'Optimize',
        how: 'I used the patterns of game development in Godot: a global GameManager and signals that update the interface.',
      },
      {
        skill: 'Collaborate',
        how: 'With four of us, each owned an area, split into user stories, and we shared the code with Git.',
      },
    ],
  },
  {
    id: 'tournoi',
    title: 'Esports tournament manager',
    context: 'University project · IUT de Blagnac',
    stack: ['Java'],
    summary: 'A Java application with a graphical interface to manage esports tournaments.',
    did: [
      'Requirements analysis before coding.',
      'Application design.',
      'Development of a working graphical interface in Java.',
    ],
    competences: [
      {
        skill: 'Build',
        how: 'I designed and then developed in Java an application with a working graphical interface.',
      },
      {
        skill: 'Lead',
        how: 'I analysed the requirements before writing a single line of code.',
      },
    ],
  },
  {
    id: 'bdd',
    title: 'Relational database',
    context: 'University project · IUT de Blagnac',
    stack: ['Oracle SQL Developer', 'SQL'],
    summary: 'A database designed from a specification, then queried in SQL.',
    did: [
      'Reading the specification and modelling the data.',
      'Creating the tables and constraints in Oracle SQL Developer.',
      'Queries to update and search the database.',
    ],
    competences: [
      {
        skill: 'Manage',
        how: 'I modelled the data, created the tables and constraints in Oracle, then wrote the queries to update and search the database.',
      },
      {
        skill: 'Lead',
        how: 'I turned the needs described in the specification into data to store.',
      },
    ],
  },
  {
    id: 'portfolio',
    title: 'This portfolio, vibe coded',
    context: 'Personal project · 2026',
    stack: ['Claude Code', 'React', 'TypeScript', 'Tailwind CSS', 'Three.js', 'GSAP'],
    summary: 'The site you are browsing: I built it with Claude Code.',
    did: [
      'Detailed prompts: content, order of the sections, the effects I wanted, design references to follow.',
      'Claude skills and plugins: taste-skill, impeccable, ui-ux-pro-max, ponytail and Emil Kowalski’s skills.',
      'Code review and fixes: for every version, I review everything and list precisely what to improve, until this result.',
    ],
    competences: [
      {
        skill: 'Build',
        how: 'A complete site in React and TypeScript, built with Claude Code: I check that it stays usable with the keyboard and without animation.',
      },
      {
        skill: 'Optimize',
        how: 'The flight over Hong Kong and the 3D scene only load as you get close and only render while on screen, to spare phones.',
      },
      {
        skill: 'Administer',
        how: 'I publish the site on GitHub Pages: a GitHub Actions workflow puts it online every time I push to the main branch.',
      },
      {
        skill: 'Lead',
        how: 'For every version, I review everything and list the fixes to make, until the result is right.',
      },
    ],
  },
];

/* ---------- Skills review ---------- */

const STAGE: BilanProof = { label: 'See the internship at Orange', href: '#stage' };
const KILLKENY: BilanProof = { label: 'See Kill Keny', project: 'killkeny' };
const BOMBERMAN: BilanProof = { label: 'See Bomberman', project: 'bomberman' };
const TOURNOI: BilanProof = { label: 'See the esports tournament', project: 'tournoi' };
const BDD: BilanProof = { label: 'See the database', project: 'bdd' };
const PORTFOLIO: BilanProof = { label: 'See this portfolio', project: 'portfolio' };

export const bilan = {
  heading: ['My', 'skills'],
  skills: [
    {
      name: 'Build',
      promise: 'Turning a need into an application that works.',
      steps: [
        {
          when: '1st year',
          text: 'A Java application to manage esports tournaments, from requirements analysis to the graphical interface.',
          proofs: [TOURNOI],
        },
        {
          when: '2nd year',
          text: 'At Orange, I move on to the internal tools of a real company: two Power Apps applications and two websites, one of them full-stack.',
          proofs: [STAGE],
        },
        {
          when: 'Today',
          text: 'An installable app for a real band, from the Vue front end to the Express back end, and the game loop of a 3D Bomberman.',
          proofs: [KILLKENY, BOMBERMAN],
        },
      ],
    },
    {
      name: 'Optimize',
      promise: 'Looking for what fits best, not just what works.',
      steps: [
        {
          when: '1st year',
          text: 'Comparing several algorithmic approaches to the same problem, rather than keeping the first one that works.',
        },
        {
          when: 'Today',
          text: 'A GameManager and signals to organise Bomberman. And on this portfolio, heavy scenes only load as you get close and only render while on screen.',
          proofs: [BOMBERMAN, PORTFOLIO],
        },
      ],
    },
    {
      name: 'Administer',
      promise: 'Putting a service online and keeping it secure.',
      steps: [
        { when: '1st year', text: 'Installing and configuring my development machine.' },
        {
          when: 'Today',
          text: 'On Kill Keny, hashed passwords, httpOnly cookies and prepared statements. And this portfolio goes online by itself on GitHub Pages with every update.',
          proofs: [KILLKENY, PORTFOLIO],
        },
      ],
    },
    {
      name: 'Manage',
      promise: 'Organising data so that it helps make decisions.',
      steps: [
        {
          when: '1st year',
          text: 'A relational database designed from a specification, then queried in SQL with Oracle.',
          proofs: [BDD],
        },
        {
          when: '2nd year',
          text: 'At Orange, a Power BI report to analyse the server inventory, and applications connected to SharePoint.',
          proofs: [STAGE],
        },
        {
          when: 'Today',
          text: 'Kill Keny’s data in MariaDB, where each member can only access their own band’s data. I am also learning Neo4j.',
          proofs: [KILLKENY],
        },
      ],
    },
    {
      name: 'Lead',
      promise: 'Understanding what the client wants, then staying on course.',
      steps: [
        {
          when: '1st year',
          text: 'Gathering and writing down requirements, and analysing them before writing a single line of code.',
          proofs: [TOURNOI],
        },
        {
          when: 'Today',
          text: 'For Kill Keny: two meetings with the client, a specification, mock-ups, then Scrum follow-up over five sprints.',
          proofs: [KILLKENY],
        },
      ],
    },
    {
      name: 'Collaborate',
      promise: 'Finding my place in a team and moving forward with it.',
      steps: [
        {
          when: '2nd year',
          text: 'At Orange, I discover working in a company, with a website shared on the group’s internal channels.',
          proofs: [STAGE],
        },
        {
          when: 'Today',
          text: 'Five of us on Kill Keny, with a Scrum Master and a Product Owner: every feature goes through a branch and a pull request. Four of us on Bomberman, each with our own area.',
          proofs: [KILLKENY, BOMBERMAN],
        },
      ],
    },
  ],
};

/* ---------- Internship ---------- */

export const stage = {
  ...fr.stage,
  heading: ['My internship', 'at', 'Orange'],
  // Non-breaking hyphen: the line never breaks inside "Full-Stack"
  role: 'Full‑Stack & Power Platform Developer',
  intro:
    'I did my 2nd-year internship at Orange, in Balma. I built internal tools with Microsoft’s Power Platform and developed two websites.',
  missions: [
    {
      title: 'Two Power Apps applications',
      detail: 'Connected to SharePoint, with automated flows built in Power Automate.',
      tools: ['Power Apps', 'SharePoint', 'Power Automate'],
    },
    {
      title: 'A Power BI report',
      detail: 'A complete report to analyse and visualise the server inventory.',
      tools: ['Power BI'],
    },
    {
      title: 'A cybersecurity awareness website',
      detail: 'Built in HTML, CSS and JavaScript to be shared on Orange’s internal channels.',
      tools: ['HTML', 'CSS', 'JavaScript'],
      url: 'https://sitewebcyber.z43.web.core.windows.net/pages/index.html',
    },
    {
      title: 'A full-stack portfolio website',
      detail: 'React front end, Node.js and Express back end, with a REST API.',
      tools: ['React', 'Node.js', 'Express', 'REST API'],
    },
  ] satisfies Mission[],
  takeaway:
    'This internship made me want to go further with data: that is the direction I am looking for in my 3rd-year internship.',
};

/* ---------- Hobbies ---------- */

const [jeux, musique, f1] = fr.loisirs.hobbies;

export const loisirs: { heading: string; hobbies: Hobby[] } = {
  heading: 'My hobbies',
  hobbies: [
    {
      ...jeux,
      text: 'I mainly watch the big events of four games, for the level of the best teams and the atmosphere of packed arenas.',
    },
    { ...musique, title: 'Music' },
    {
      ...f1,
      title: 'Formula 1',
      text: 'I follow every Grand Prix, from qualifying to the finish: the start, pit stop strategies, telemetry data, battles right to the last lap.',
      caption: 'Monza circuit, Italy',
    },
    {
      id: 'echecs',
      title: 'Chess',
      text: 'Anticipate, calculate, choose the right move. Here, Paul Morphy’s “Opera Game” (1858).',
    },
    { id: 'voyages', title: 'Travel' },
  ] satisfies Hobby[],
};

export const voyages = fr.voyages;

export const contact = { ...fr.contact, greeting: 'Write to me' };

// The legal notice page stays in French (French law), with its credits
export const { credits, legal } = fr;

/* ---------- Interface ---------- */

export const ui: typeof fr.ui = {
  skip: 'Skip to content',
  mainNav: 'Main navigation',
  menu: 'Menu',
  close: 'Close',
  downloadCv: 'Download my CV',
  otherLang: { label: 'Lire ce site en français', lang: 'fr' },
  backToTop: 'Back to the top of the page',
  intro: 'Introduction',
  portrait: 'Portrait of Alexy Durand',
  hills: 'Dark hills under a beige sky',
  projects: 'My projects',
  github: 'My GitHub',
  seeProject: 'See the details:',
  project: 'Project',
  prevProject: 'Previous project',
  nextProject: 'Next project',
  closeProject: 'Close the project details',
  learning: 'currently learning',
  with: 'with',
  soft: 'Soft skills',
  languages: 'Languages',
  toProjects: 'I put these skills into practice in my projects',
  orangeLogo: 'Orange logo',
  missions: 'My assignments',
  seeSite: 'See the website',
  writeTo: 'Write to',
  email: 'Email',
  map: 'Map',
  travel: 'Travel photos',
  cities: {
    hk: ['Hong Kong', 'The towers of central Hong Kong at night, seen from the sky'],
    lisbonne: ['Lisbon', 'São Jorge Castle above the rooftops of Lisbon'],
    paris: ['Paris', 'The Eiffel Tower lit up above the Seine, at blue hour'],
    montreal: ['Montreal', 'The downtown towers of Montreal seen from Mount Royal'],
    'toronto-nuit': ['Toronto', 'Toronto at night, reflected in Lake Ontario'],
    shenzhen: ['Shenzhen', 'Central Shenzhen lit up at night'],
  },
  footer: {
    label: 'Footer',
    site: 'The site',
    find: 'Find me',
    info: 'Info',
    legal: 'Legal notice and credits (in French)',
    top: 'Back to top',
    write: 'Write to me',
  },
};
