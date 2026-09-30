/**
 * printDocument.js
 * -----------------------------------------------------------------------
 * Reusable utility to print HTML documents cleanly via an isolated iframe.
 * Avoids any CSS/DOM collisions with the parent React single-page app
 * and ensures 100% reliable print preview across all browsers.
 * -----------------------------------------------------------------------
 */

export function printHtml(htmlContent, { orientation = 'portrait', pageMargin = '10mm 12mm' } = {}) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Allow fonts and images in the iframe to fully paint before invoking print
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print failed:', err);
      } finally {
        resolve();
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 350);
  });
}
