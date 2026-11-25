const GLYPHS = import.meta.glob<string>('../assets/keys/*.svg', { eager: true, import: 'default' });
const LOGOS = import.meta.glob<string>('../assets/logos/*.svg', { eager: true, import: 'default' });
// Tool logo (Devicon name) → its one-colour Simple Icons glyph, where one exists; else the Devicon
// logo's silhouette (the mask only keeps its shape); else none, and the key carries the tool's name
const SIMPLE: Record<string, string> = {
  sqldeveloper: 'oracle',
  vue: 'vuedotjs',
  nodejs: 'nodedotjs',
  godot: 'godotengine',
};

/** The logo drawn on a tool's key (Keycap), if it has one. */
export const keyGlyph = (logo?: string): string | undefined =>
  logo &&
  (GLYPHS[`../assets/keys/${SIMPLE[logo] ?? logo}.svg`] ?? LOGOS[`../assets/logos/${logo}.svg`]);

// Light keys get a dark glyph
export const LIGHT_KEYS = new Set([
  'powerbi',
  'javascript',
  'react',
  'pinia',
  'supabase',
  'tailwindcss',
  'gsap',
]);
