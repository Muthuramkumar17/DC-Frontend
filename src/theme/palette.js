const palette = (mode = "light") => ({
  mode,

  primary: {
    main: "#0F5C57",
    light: "#E6F4F1",
    dark: "#0A4440",
    contrastText: "#FFFFFF",
  },

  brand: {
    black: "#111111",
    greenDark: "#0F5C57",
  },

  secondary: {
    main: "#1F8A55",
    light: "#E8F5EE",
    dark: "#145C38",
    contrastText: "#FFFFFF",
  },

  success: {
    main: "#1F8A55",
    light: "#E8F5EE",
    dark: "#145C38",
    contrastText: "#FFFFFF",
  },

  warning: {
    main: "#D98E04",
    light: "#FCF3E3",
    dark: "#A96C02",
    contrastText: "#FFFFFF",
  },

  error: {
    main: "#D32F2F",
    light: "#FDECEA",
    dark: "#9A0007",
    contrastText: "#FFFFFF",
  },

  info: {
    main: "#0288D1",
    light: "#E1F5FE",
    dark: "#01579B",
    contrastText: "#FFFFFF",
  },

  background: {
    default: mode === "dark" ? "#121212" : "#F8FAF9",
    paper: mode === "dark" ? "#1E1E1E" : "#ffffff",
  },

  text: {
    primary: mode === "dark" ? "#FFFFFF" : "#112220",
    secondary: mode === "dark" ? "#B8C5D6" : "#4B5563",
  },

  divider: mode === "dark" ? "#2D3748" : "#E2E8E6",
});

export default palette;
