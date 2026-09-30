/**
 * SubscriptionReceiptPrint.jsx
 * -----------------------------------------------------------------------
 * Printable single-page customer receipt for subscriptions with:
 * - MKPL branding in the top left & company logo on the top right
 * - Customer details & Subscription details
 * - Payment details
 * - 2-column split Service Visit Schedule table
 * - Optimized compact layout ensuring 100% single-page A4 printing
 * -----------------------------------------------------------------------
 */

import { useEffect, useState, useRef } from 'react';
import Button from '@mui/material/Button';
import { PrintIcon } from '@/theme/icons';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';
import { formatDate, formatMoney } from '@/utils/format';
import { escapeHtml } from '@/utils/htmlEscape.js';
import jollyLogo from '@/assets/logo/Jollylight.png';
import { useSubscriptionReceiptData } from '../hooks/useSubscriptions.js';

/**
 * Builds the standalone printable HTML for the single-page customer receipt.
 */
function generateReceiptHtml({
  subscription,
  customerData,
  paymentData,
  invoiceData,
  frequenciesList = [],
  subscriptionTypesList = [],
}) {
  const { customer, address, periods, currentPeriod } = subscription;
  const resolvedCustomer = customerData || customer || {};
  const period = currentPeriod || periods?.[0];
  const booking = period?.booking || {};
  const visits = period?.visits || [];

  // 1. Subscription & Plan resolution
  const totalVisits = subscription.totalVisits || period?.totalServices || visits.length || 0;

  const rawFreqId = String(period?.frequencyId || booking?.frequencyCode || booking?.frequencyId || '');
  const matchedFreq = frequenciesList.find(
    (f) => String(f._id) === rawFreqId || String(f.serviceFrequencyId) === rawFreqId || String(f.id) === rawFreqId
  );
  const frequencyName = matchedFreq?.frequencyName || matchedFreq?.name || period?.frequencyName || booking?.frequencyName || 'Weekly';

  const rawTypeId = String(period?.planId || booking?.planId || subscription.subscriptionTypeId || '');
  const matchedType = subscriptionTypesList.find(
    (t) => String(t._id) === rawTypeId || String(t.subscriptionTypeId) === rawTypeId || String(t.id) === rawTypeId
  );
  const subscriptionTypeName = matchedType?.subscriptionName || matchedType?.name || period?.planName || booking?.planName || 'Standard Subscription';

  const startDate = period?.startDate || booking?.scheduledDate || subscription.createdAt;

  // Resolve End Date
  const sortedVisits = [...visits].sort(
    (a, b) =>
      new Date(a.date || a.scheduledDate) -
      new Date(b.date || b.scheduledDate),
  );
  const lastVisit = sortedVisits[sortedVisits.length - 1];
  let endDate =
    lastVisit?.date ||
    lastVisit?.scheduledDate ||
    period?.endDate ||
    subscription.periodEndDate ||
    subscription.endDate;
  if (!endDate && startDate && totalVisits > 0) {
    endDate = dayjs(startDate).add((totalVisits - 1) * 7, 'day').format('YYYY-MM-DD');
  }

  // 2. Customer fields
  const customerName = resolvedCustomer.name || '—';
  const phoneNumber = resolvedCustomer.phoneNumber || resolvedCustomer.mobile || '—';
  const doorNo = resolvedCustomer.doorNo || address?.doorNo || '—';
  const block = resolvedCustomer.block || address?.block || '—';
  const apartment = resolvedCustomer.apartmentName || resolvedCustomer.apartment || address?.apartmentName || address?.apartment || '—';
  const streetAddress = resolvedCustomer.address || address?.addressLine || '—';
  const cityPincode = [resolvedCustomer.city || address?.city, resolvedCustomer.pincode || address?.pincode].filter(Boolean).join(' - ');
  const fullAddress = cityPincode && streetAddress !== '—' ? `${streetAddress}, ${cityPincode}` : streetAddress;

  // 3. Payment details — try every known field from DB responses
  const totalAmount =
    invoiceData?.amount ??            // invoice.amount (set from payment.totalAmount at creation)
    invoiceData?.totalAmount ??       // in case schema adds this later
    paymentData?.totalAmount ??       // servicePayment.totalAmount  ← primary source
    paymentData?.baseAmount ??        // servicePayment.baseAmount as fallback
    paymentData?.amount ??            // generic amount field
    paymentData?.paymentAmount ??     // edge-case alias
    booking?.totalAmount ??           // booking-level total
    booking?.amount ??
    subscription?.totalAmount ??
    subscription?.amount ??
    period?.booking?.totalAmount ??
    period?.booking?.amount ??
    0;
  const paymentStatus = paymentData?.status || invoiceData?.status || 'Paid';
  const paidDate = paymentData?.createdAt || paymentData?.paymentDate || invoiceData?.invoiceDate || subscription.createdAt;

  // 4. Split Service Visits into 2 parallel columns
  const mid = Math.ceil(visits.length / 2);
  const leftVisits = visits.slice(0, mid);
  const rightVisits = visits.slice(mid);

  const renderVisitsSubTable = (subList, startIndex) => {
    if (subList.length === 0) {
      return `<tr><td colspan="2" style="padding: 6px; text-align: center; color: #888; border: 1px solid #cce3dc;">—</td></tr>`;
    }
    return subList.map((v, idx) => {
      const globalIndex = startIndex + idx + 1;
      const dateStr = formatDate(v.date || v.scheduledDate);
      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fcfb';
      return `
        <tr style="background-color: ${rowBg};">
          <td style="padding: 5px 8px; border: 1px solid #cce3dc; text-align: center; font-size: 11px; width: 45px; color: #555;">${globalIndex}</td>
          <td style="padding: 5px 10px; border: 1px solid #cce3dc; font-size: 11px; font-weight: 600; color: #111;">${escapeHtml(dateStr)}</td>
        </tr>
      `;
    }).join('');
  };

  const leftTableRows = renderVisitsSubTable(leftVisits, 0);
  const rightTableRows = renderVisitsSubTable(rightVisits, mid);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Customer Receipt - ${escapeHtml(subscription.subscriptionNumber)}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 8mm 10mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #222;
          background: #fff;
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.35;
        }
        .container {
          max-width: 720px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2.5px solid #1a6b5c;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .header-left {
          display: flex;
          flex-direction: column;
        }
        .mkpl-brand {
          font-size: 20px;
          font-weight: 900;
          color: #1a6b5c;
          letter-spacing: 0.5px;
          line-height: 1.2;
          margin: 0;
          text-transform: uppercase;
        }
        .brand-address {
          font-size: 10px;
          font-weight: 500;
          color: #444;
          margin-top: 2px;
          line-height: 1.35;
        }
        .brand-subtitle {
          font-size: 12px;
          font-weight: 700;
          color: #1a6b5c;
          margin-top: 4px;
        }
        .sub-meta {
          font-size: 10px;
          color: #555;
          margin-top: 2px;
        }
        .sub-meta strong {
          color: #111;
        }
        .logo-box img {
          max-height: 100px;
          width: auto;
          display: block;
          object-fit: contain;
        }
        .section-header {
          background-color: #1a6b5c;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          padding: 4px 8px;
          margin-top: 6px;
          margin-bottom: 4px;
          border-radius: 3px;
        }
        .two-column-grid {
          display: flex;
          gap: 12px;
        }
        .grid-col {
          flex: 1;
        }
        table.info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2px;
        }
        table.info-table td {
          padding: 3px 6px;
          font-size: 10.5px;
          vertical-align: top;
          border-bottom: 1px solid #f0f0f0;
        }
        table.info-table td.label {
          width: 42%;
          color: #666;
          font-weight: 500;
        }
        table.info-table td.value {
          width: 58%;
          color: #111;
          font-weight: 600;
        }
        .payment-strip {
          display: flex;
          justify-content: space-between;
          background: #f4faf8;
          border: 1px solid #cce3dc;
          border-radius: 4px;
          padding: 6px 12px;
          margin-top: 4px;
          margin-bottom: 4px;
        }
        .payment-item {
          display: flex;
          flex-direction: column;
        }
        .payment-item-label {
          font-size: 9.5px;
          color: #666;
          font-weight: 600;
          text-transform: uppercase;
        }
        .payment-item-value {
          font-size: 12px;
          font-weight: 700;
          color: #111;
          margin-top: 1px;
        }
        .visits-container {
          display: flex;
          gap: 12px;
          margin-top: 2px;
        }
        .visits-col {
          flex: 1;
        }
        table.visits-table {
          width: 100%;
          border-collapse: collapse;
        }
        table.visits-table th {
          background-color: #eaf4f1;
          color: #1a6b5c;
          font-weight: 700;
          font-size: 10px;
          padding: 5px 8px;
          border: 1px solid #cce3dc;
        }
        .footer {
          margin-top: 10px;
          border-top: 1px dashed #ccc;
          padding-top: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- ── Top Header: Company Name on Left, Logo on Right ──────────────── -->
        <div class="header">
          <div class="header-left">
            <div class="mkpl-brand">MEENAKOUSALYA PRIVATE LIMITED</div>
            <div class="brand-address">
              Ground Floor, Bearing No.514, K. R, Garden 8th Block Koramangala, Bengaluru.<br />
              
            </div>
            <div class="brand-subtitle">Bathroom Cleaning Subscription — Customer Receipt</div>
            <div class="sub-meta">
              Subscription No: <strong>${escapeHtml(subscription.subscriptionNumber)}</strong> &nbsp;|&nbsp;
              Receipt Date: <strong>${formatDate(new Date())}</strong>
            </div>
          </div>
          <div class="logo-box">
            <img src="${jollyLogo}" alt="Jolly Home Needs" />
          </div>
        </div>

        <!-- ── Customer & Subscription Details Side by Side ─────────── -->
        <div class="two-column-grid">
          <!-- 1. Customer Details -->
          <div class="grid-col">
            <div class="section-header">Customer Details</div>
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="label">Customer Name:</td>
                  <td class="value">${escapeHtml(customerName)}</td>
                </tr>
                <tr>
                  <td class="label">Phone Number:</td>
                  <td class="value">${escapeHtml(phoneNumber)}</td>
                </tr>
                <tr>
                  <td class="label">Door No:</td>
                  <td class="value">${escapeHtml(doorNo)}</td>
                </tr>
                <tr>
                  <td class="label">Block:</td>
                  <td class="value">${escapeHtml(block)}</td>
                </tr>
                <tr>
                  <td class="label">Apartment:</td>
                  <td class="value">${escapeHtml(apartment)}</td>
                </tr>
                <tr>
                  <td class="label">Address:</td>
                  <td class="value">${escapeHtml(fullAddress)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 2. Subscription Details -->
          <div class="grid-col">
            <div class="section-header">Subscription Details</div>
            <table class="info-table">
              <tbody>
                <tr>
                  <td class="label">Total Visits:</td>
                  <td class="value">${totalVisits} Visits</td>
                </tr>
                <tr>
                  <td class="label">Service Frequency:</td>
                  <td class="value">${escapeHtml(frequencyName)}</td>
                </tr>
                <tr>
                  <td class="label">Subscription Type:</td>
                  <td class="value">${escapeHtml(subscriptionTypeName)}</td>
                </tr>
                <tr>
                  <td class="label">Start Date:</td>
                  <td class="value">${escapeHtml(formatDate(startDate))}</td>
                </tr>
                <tr>
                  <td class="label">End Date:</td>
                  <td class="value">${escapeHtml(formatDate(endDate))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── 3. Payment Details (Compact Banner) ─────────────────── -->
        <div class="section-header">Payment Details</div>
        <div class="payment-strip">
          <div class="payment-item">
            <span class="payment-item-label">Total Amount</span>
            <span class="payment-item-value" style="color: #1a6b5c;">${formatMoney(totalAmount)}</span>
          </div>
          <div class="payment-item">
            <span class="payment-item-label">Payment Status</span>
            <span class="payment-item-value">
              <span style="display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; background-color: #dcf5ec; color: #1a6b5c;">
                ${escapeHtml(paymentStatus)}
              </span>
            </span>
          </div>
          <div class="payment-item">
            <span class="payment-item-label">Paid Date</span>
            <span class="payment-item-value">${formatDate(paidDate)}</span>
          </div>
        </div>

        <!-- ── 4. Service Visit Schedule (Divided into 2 Columns) ────── -->
        <div class="section-header">Service Visit Schedule</div>
        <div class="visits-container">
          <!-- Left Table (Visits 1 to N/2) -->
          <div class="visits-col">
            <table class="visits-table">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">S.No</th>
                  <th style="text-align: left;">Scheduled Date</th>
                </tr>
              </thead>
              <tbody>
                ${leftTableRows}
              </tbody>
            </table>
          </div>

          <!-- Right Table (Visits N/2+1 to N) -->
          <div class="visits-col">
            <table class="visits-table">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">S.No</th>
                  <th style="text-align: left;">Scheduled Date</th>
                </tr>
              </thead>
              <tbody>
                ${rightTableRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Footer ──────────────────────────────────────────────── -->
        <div class="footer">
          <div>This is a computer-generated receipt. No signature required.</div>
          <div>Printed on: ${new Date().toLocaleString('en-IN')}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Main print component with button.
 */
export default function SubscriptionReceiptPrint({ subscription }) {
  const [printing, setPrinting] = useState(false);
  const { data: receiptData } = useSubscriptionReceiptData(subscription);

  const customerData = receiptData?.customerData || null;
  const paymentData = receiptData?.paymentData || null;
  const invoiceData = receiptData?.invoiceData || null;
  const frequenciesList = receiptData?.frequenciesList || [];
  const subscriptionTypesList = receiptData?.subscriptionTypesList || [];

  /**
   * Triggers printing via an invisible iframe.
   */
  const handlePrint = () => {
    if (!subscription) return;
    setPrinting(true);

    try {
      const html = generateReceiptHtml({
        subscription,
        customerData,
        paymentData,
        invoiceData,
        frequenciesList,
        subscriptionTypesList,
      });

      // Create an isolated invisible iframe
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
      doc.write(html);
      doc.close();

      // Ensure images and styles render before printing
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setPrinting(false);

        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }, 400);
    } catch (err) {
      console.error('Failed to print receipt:', err);
      setPrinting(false);
    }
  };

  if (!subscription) return null;

  return (
    <Button
      variant="outlined"
      startIcon={printing ? <CircularProgress size={15} color="inherit" /> : <PrintIcon />}
      onClick={handlePrint}
      disabled={printing}
      size="small"
      sx={{
        mt: 2,
        width: '100%',
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        borderColor: '#1a6b5c',
        color: '#1a6b5c',
        '&:hover': { bgcolor: '#f0faf7', borderColor: '#1a6b5c' },
      }}
    >
      {printing ? 'Preparing Receipt…' : 'Print Customer Receipt'}
    </Button>
  );
}
