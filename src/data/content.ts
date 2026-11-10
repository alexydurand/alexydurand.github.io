/**
 * The text of the site, in the language chosen with the header button (kept in the browser).
 * Write the text in content.fr.ts and content.en.ts. The exports below are live bindings: setLang()
 * swaps them, then App renders again with the new text, without reloading the page.
 */
import * as fr from './content.fr';
import * as en from './content.en';

export type { BilanProof, BilanStep, Hobby, Mission, Project, Skill } from './content.fr';

type Lang = 'fr' | 'en';

export let lang: Lang = (() => {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
})();

// Typed as the French text: the English one must have exactly the same shape
const pick = (l: Lang): typeof fr => (l === 'en' ? en : fr);

export let {
  person,
  hero,
  nav,
  skills,
  butLinks,
  projects,
  bilan,
  stage,
  loisirs,
  voyages,
  contact,
  credits,
  legal,
  ui,
} = pick(lang);

/** Switches the whole site to `next`; App listens to the "lang-change" event to render again. */
export function setLang(next: Lang) {
  lang = next;
  ({
    person,
    hero,
    nav,
    skills,
    butLinks,
    projects,
    bilan,
    stage,
    loisirs,
    voyages,
    contact,
    credits,
    legal,
    ui,
  } = pick(next));
  document.documentElement.lang = next;
  try {
    localStorage.setItem('lang', next);
  } catch {
    // Storage blocked: this language for this visit only
  }
  window.dispatchEvent(new Event('lang-change'));
}
