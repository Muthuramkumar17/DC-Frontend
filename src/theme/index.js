import { createTheme } from "@mui/material/styles";
import palette from "./palette";
import typography from "./typography";
import components from "./components";
import breakpoints from "./break-points";
import shape from "./shape";
import zIndex from "./zindex";
import Icons from "./icons";
import spacing from "./spacing-tokens";

/**
 * Builds the complete MUI theme by combining all token definitions from the theme folder.
 * Any change to palette.js, typography.js, shape.js, components.js, etc. will instantly reflect across the entire app.
 */
export const buildTheme = (mode = "light") => {
  const basePalette = palette(mode);

  // 1. Initial theme setup with palette, breakpoints, shape, and zIndex
  let theme = createTheme({
    palette: basePalette,
    breakpoints: breakpoints,
    shape: {
      borderRadius: shape?.borderRadius ?? 10,
      radius: shape?.radius ?? {},
    },
    zIndex: zIndex,
  });

  // 2. Resolve typography & component overrides that depend on theme tokens
  const typographyOverrides = typography(theme);
  const componentOverrides =
    typeof components === "function" ? components(theme) : components;

  theme = createTheme(theme, {
    typography: typographyOverrides,
    components: {
      ...componentOverrides,
      MuiButton: {
        ...componentOverrides?.MuiButton,
        styleOverrides: {
          ...componentOverrides?.MuiButton?.styleOverrides,
          root: {
            ...componentOverrides?.MuiButton?.styleOverrides?.root,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: theme.shape.borderRadius || 8,
          },
          containedPrimary: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText || "#ffffff",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          },
          outlinedPrimary: {
            borderColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.light,
              borderColor: theme.palette.primary.dark,
            },
          },
        },
        defaultProps: { disableElevation: true },
      },
      MuiCard: {
        ...componentOverrides?.MuiCard,
        styleOverrides: {
          ...componentOverrides?.MuiCard?.styleOverrides,
          root: {
            ...componentOverrides?.MuiCard?.styleOverrides?.root,
            borderRadius: 12,
            border: `1px solid ${theme.palette.divider}`,
          },
        },
      },
      MuiPaper: {
        ...componentOverrides?.MuiPaper,
        styleOverrides: {
          ...componentOverrides?.MuiPaper?.styleOverrides,
          root: {
            ...componentOverrides?.MuiPaper?.styleOverrides?.root,
            backgroundImage: "none",
          },
          outlined: {
            borderColor: theme.palette.divider,
          },
        },
      },
      MuiOutlinedInput: {
        ...componentOverrides?.MuiOutlinedInput,
        styleOverrides: {
          ...componentOverrides?.MuiOutlinedInput?.styleOverrides,
          root: {
            borderRadius: 8,
            "& fieldset": {
              borderColor: theme.palette.divider,
            },
            "&:hover fieldset": {
              borderColor: theme.palette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
              borderWidth: 1.5,
            },
          },
        },
      },
      MuiTableCell: {
        ...componentOverrides?.MuiTableCell,
        styleOverrides: {
          ...componentOverrides?.MuiTableCell?.styleOverrides,
          root: {
            borderColor: theme.palette.divider,
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode === "dark" ? "#1E1E1E" : "#F3F7F6",
            color: theme.palette.text.secondary,
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          },
        },
      },
      MuiDataGrid: {
        ...componentOverrides?.MuiDataGrid,
        styleOverrides: {
          ...componentOverrides?.MuiDataGrid?.styleOverrides,
          root: {
            border: "none",
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              borderColor: theme.palette.divider,
              paddingLeft: "16px",
              paddingRight: "16px",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: mode === "dark" ? "#1E1E1E" : "#F3F7F6",
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              paddingLeft: "16px",
              paddingRight: "16px",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "#F3F7F6",
            },
          },
        },
      },
      MuiChip: {
        ...componentOverrides?.MuiChip,
        styleOverrides: {
          ...componentOverrides?.MuiChip?.styleOverrides,
          root: {
            fontWeight: 600,
            borderRadius: 6,
          },
        },
      },
      MuiCssBaseline: {
        ...componentOverrides?.MuiCssBaseline,
        styleOverrides: {
          body: {
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          },
          ...componentOverrides?.MuiCssBaseline?.styleOverrides,
        },
      },
    },
  });

  // Attach token modules directly to theme instance for programmatic access
  theme.Icons = Icons;
  theme.spacingTokens = spacing;

  return theme;
};

// Default instantiated theme for direct consumption
const theme = buildTheme("light");

export {
  Icons,
  spacing,
  palette,
  typography,
  components,
  breakpoints,
  shape,
  zIndex,
};

export default theme;