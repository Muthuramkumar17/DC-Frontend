export const zIndex = {
  mobileStepper: 1000,

  fab: 1050,

  speedDial: 1050,

  appBar: 1100,

  navbar: 1100,

  drawer: 1200,

  modal: 1300,

  snackbar: 1400,

  tooltip: 1500,

  dropdownActive: 1600,

  modalOverlay: 1700,

  footer: 1,

  scrollToTop: 9999,
};

export const zIndexLocal = {
  farBack: -10,
  back: -9,

  base: 0,

  content: 1,

  overlay: 2,

  overlayHigh: 4,

  stepHighlight: 50,

  carouselBase: 10,
};

export default { ...zIndex, local: zIndexLocal };
