import GlobalStyles from '@mui/material/GlobalStyles';

export default function GlobalPrintStyle() {
  return (
    <GlobalStyles
      styles={{
        '#invoice-print-area, #service-area-print-area': { display: 'none' },
        '@media print': {
          '@page': { size: 'A4 landscape', margin: '8mm' },
          '@page invoice-page': { size: 'A4 landscape', margin: '8mm' },
          '@page service-area-page': { size: 'A4 landscape', margin: '12mm' },
          'body *': { visibility: 'hidden' },
          '#invoice-print-area, #invoice-print-area *, #service-area-print-area, #service-area-print-area *': {
            visibility: 'visible',
          },
          '#invoice-print-area': {
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 'calc(100vh - 16mm)',
            padding: '0',
            boxSizing: 'border-box',
            overflow: 'hidden',
            page: 'invoice-page',
          },
          '#invoice-print-area .invoice-half-a4': {
            width: '133.33% !important',
            maxWidth: 'none',
            height: '133.33% !important',
            transform: 'scale(0.75)',
            transformOrigin: 'top left',
            margin: '0 !important',
            overflow: 'hidden !important',
            boxSizing: 'border-box',
          },
          '#service-area-print-area': {
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            padding: '12mm',
            boxSizing: 'border-box',
            page: 'service-area-page',
          },
        },
      }}
    />
  );
}
