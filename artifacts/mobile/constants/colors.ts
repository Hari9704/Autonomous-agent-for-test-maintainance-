/**
 * Semantic design tokens for the Agentic QA Architecture showcase.
 *
 * Theme: deep charcoal background with a bold orange + green duotone —
 * orange carries "action / heat / cost-savings drama", green carries
 * "success / efficiency / go-live" across the whole app.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#eef2ee',
    tint: '#ff8a3d',

    // Core surfaces
    background: '#0a0e0c',
    foreground: '#eef2ee',

    // Cards / elevated surfaces
    card: '#121712',
    cardForeground: '#eef2ee',

    // Primary action color (buttons, links, active states) — orange
    primary: '#ff8a3d',
    primaryForeground: '#160a02',

    // Secondary / less-emphasis interactive surfaces — green
    secondary: '#1c2b1f',
    secondaryForeground: '#7CE29B',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#171c17',
    mutedForeground: '#8a9690',

    // Accent highlights (badges, selected items, focus rings) — green
    accent: '#22c55e',
    accentForeground: '#04140a',

    // Destructive actions (delete, error states)
    destructive: '#f87171',
    destructiveForeground: '#1a0505',

    // Borders and input outlines
    border: '#232b23',
    input: '#232b23',
  },

  // Border radius (in px)
  radius: 14,
};

export default colors;

// Extra palette used throughout the architecture showcase — an
// orange/green retheme of the original neon accent set, kept as named
// exports so section components can vary accent color per topic while
// staying inside the same family.
export const accents = {
  orange: '#ff8a3d',
  amber: '#f5b942',
  green: '#22c55e',
  mint: '#4ade80',
  teal: '#2dd4bf',
  rust: '#ff5f3d',
  lime: '#a3e635',
  red: '#f87171',
};
