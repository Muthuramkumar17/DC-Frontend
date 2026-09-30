// theme/shape.js

// ─────────────────────────────────────────────────────────────
// NOTE ON UNITS: in MUI's sx prop, `borderRadius: N` multiplies against
// theme.shape.borderRadius (the base unit below). So `borderRadius: 3`
// in your current code renders as 3 × 10px = 30px once this base value
// is wired into the theme. That's the same math App.jsx's buildTheme()
// already uses (shape: { borderRadius: 10 }) — this file just makes the
// multiplier explicit instead of hidden inside App.jsx.
// ─────────────────────────────────────────────────────────────

export const shape = {
  borderRadius: 10, // CHANGE FROM: App.jsx buildTheme() -> shape: { borderRadius: 10 }
                     // CHANGE TO: theme/index.js imports this file's `shape` export directly

  radius: {
    // Small tag/chip corners
    // CHANGE FROM: borderRadius: 1 (10 occurrences) or borderRadius: 1.5 (5 occurrences)
    // CHANGE TO:   borderRadius: shape.radius.tag  /  shape.radius.tagLarge
    tag: 1,
    tagLarge: 1.5,

    // Standard card corners
    // CHANGE FROM: borderRadius: 2 (17 occurrences, most common in section/testimonial cards)
    // CHANGE TO:   borderRadius: shape.radius.card
    card: 2,

    // Larger card / hero-panel corners
    // CHANGE FROM: borderRadius: 3 (24 occurrences — the single most common value in the codebase)
    // CHANGE TO:   borderRadius: shape.radius.cardLarge
    cardLarge: 3,

    // Biggest rounded panels
    // CHANGE FROM: borderRadius: 4 (4 occurrences)
    // CHANGE TO:   borderRadius: shape.radius.heroPanel
    heroPanel: 4,

    // Pill-shaped buttons/badges
    // CHANGE FROM: borderRadius: 99 (10 occurrences)
    // CHANGE TO:   borderRadius: shape.radius.pill
    pill: 99,

    // Fully-round avatar/badge shapes
    // CHANGE FROM: borderRadius: 999 (10 occurrences)
    // CHANGE TO:   borderRadius: shape.radius.pillFull
    pillFull: 999,
  },
};

export default shape;