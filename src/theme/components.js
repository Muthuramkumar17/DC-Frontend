// theme/components.js

const components = {
  MuiTypography: {
    defaultProps: {
      variantMapping: {
        body3: "p",
        points: "p",
      },
    },
  },

  MuiCssBaseline: {
    styleOverrides: `
      @import url('@fontsource/sora/400.css');
      @import url('@fontsource/sora/600.css');
      @import url('@fontsource/sora/700.css');
      @import url('@fontsource/dm-sans/400.css');
      @import url('@fontsource/dm-sans/600.css');

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
      }
    `,
  },

  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
};

export default components;