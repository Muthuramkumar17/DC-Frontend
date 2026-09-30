const responsiveFont = (theme, xs, sm, md) => ({
  fontSize: xs,
  [theme.breakpoints.up("sm")]: {
    fontSize: sm,
  },
  [theme.breakpoints.up("md")]: {
    fontSize: md,
  },
});

const typography = (theme) => ({
  fontFamily: "DM Sans, sans-serif",

  h1: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 700,
    ...responsiveFont(theme, "2.25rem", "2.5rem", "3rem"),
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },

  h2: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 400,
    ...responsiveFont(theme, "1.25rem", "1.375rem", "1.5rem"),
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  },

  h3: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 400,
    ...responsiveFont(theme, "1.125rem", "1.25rem", "1.375rem"),
    lineHeight: 1.3,
  },

  h4: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 600,
    ...responsiveFont(theme, "1rem", "1.125rem", "1.25rem"),
    lineHeight: 1.35,
  },

  h5: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 600,
    ...responsiveFont(theme, "0.9375rem", "1rem", "1.125rem"),
    lineHeight: 1.4,
  },

  h6: {
    fontFamily: "Sora, sans-serif",
    fontWeight: 400,
    ...responsiveFont(theme, "0.875rem", "0.9375rem", "1rem"),
    lineHeight: 1.4,
  },

  body1: {
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 400,
    ...responsiveFont(theme, "1rem", "1rem", "1.0625rem"),
    lineHeight: 1.75,
  },

  body2: {
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 500,
    ...responsiveFont(theme, "0.9375rem", "0.9375rem", "1rem"),
    lineHeight: 1.7,
  },

  body3: {
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 400,
    ...responsiveFont(theme, "0.875rem", "0.875rem", "0.9375rem"),
    lineHeight: 1.6,
  },

  caption: {
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 700,
    fontSize: "0.85rem",
    lineHeight: 1.5,
  },

  button: {
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 600,
    textTransform: "none",
    fontSize: "0.9375rem", // 15px
  },

  points: {
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 400,
    ...responsiveFont(theme, "1rem", "1rem", "1.0625rem"),
    lineHeight: 1.75,
    color: theme.palette.primary.main,
  },
});

export default typography;
