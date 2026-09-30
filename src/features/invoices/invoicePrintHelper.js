/**
 * invoicePrintHelper.js
 * -----------------------------------------------------------------------
 * Generates standalone HTML for Tax Invoice printing and invokes print.
 * -----------------------------------------------------------------------
 */

import {
  fmtDateHuman,
  fmtMoney,
  formatCustomerAddress,
} from "@/utils/scheduling";
import { printHtml } from "@/utils/printDocument";
import { escapeHtml } from "@/utils/htmlEscape.js";
import jollyLogo from "@/assets/logo/Jollylight.png";

const COMPANY = {
  name: "MEENAKOUSALYA PRIVATE LIMITED",
  addressLines: [
    "Ground Floor, Bearing No.514, K. R, Garden 8th Block, Koramangala",
    "Gadag Betageri, Bengaluru",
  ],
  gstin: "29AASCM1112C1ZP",
  state: "Karnataka",
  stateCode: "29",
};

const CLEANING_SAC = "99853300";
const CGST_RATE = 9;
const SGST_RATE = 9;

function formatInvoiceFrequency(frequency) {
  return (
    {
      weekly: "Once a week",
      biweekly: "Once every 2 weeks",
      monthly: "Once a month",
      once: "One-time service",
    }[frequency] ||
    frequency ||
    "Not recorded"
  );
}

function formatInvoiceSubscription(weeks, subscriptionType) {
  if (subscriptionType) return subscriptionType;
  const monthsByWeeks = { 8: 2, 12: 3, 24: 6, 48: 12 };
  const months = monthsByWeeks[weeks];
  return months
    ? `${months} months`
    : weeks
      ? `${weeks} weeks`
      : "Not applicable";
}

function numberToWords(num) {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function two(n) {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
  }
  function three(n) {
    if (n >= 100) {
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + two(n % 100) : "")
      );
    }
    return two(n);
  }

  if (num === 0) return "Zero";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  let parts = [];
  if (crore) parts.push(three(crore) + " Crore");
  if (lakh) parts.push(three(lakh) + " Lakh");
  if (thousand) parts.push(three(thousand) + " Thousand");
  if (hundred) parts.push(three(hundred));

  return parts.join(" ");
}

function amountInWords(amount) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let words = `INR ${numberToWords(rupees)} `;
  words += rupees === 1 ? "Rupee" : "Rupees";
  if (paise) {
    words += ` and ${numberToWords(paise)} Paise`;
  }
  return words + " Only";
}

function taxAmountInWords(amount) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  return `INR ${numberToWords(rupees)} and ${paise}`.trim();
}

export function generateInvoiceHtml({
  invoice,
  customer,
  booking,
  bookings = [],
}) {
  const invoiceBookings = bookings.length ? bookings : booking ? [booking] : [];
  const primaryBooking = booking || invoiceBookings[0] || {};
  const visitCount =
    Number(
      primaryBooking?.totalVisits ??
        primaryBooking?.numServices ??
        primaryBooking?.visits ??
        primaryBooking?.weeks ??
        invoice?.totalVisits ??
        invoice?.booking?.totalVisits ??
        1,
    ) || 1;
  const bathroomCount = primaryBooking?.bathroomCount;
  const bathroomLabel = bathroomCount
    ? `${bathroomCount} bathroom${bathroomCount === 1 ? "" : "s"}`
    : "bathroom service";
  const frequencyName =
    primaryBooking?.frequencyName ||
    primaryBooking?.serviceFrequencyReference?.frequencyName ||
    primaryBooking?.serviceFrequency?.frequencyName ||
    primaryBooking?.frequency ||
    primaryBooking?.frequencyCode ||
    "Not recorded";
  const subscriptionName =
    primaryBooking?.planName ||
    primaryBooking?.subscriptionTypeReference?.subscriptionName ||
    primaryBooking?.subscriptionType?.subscriptionName ||
    primaryBooking?.subscriptionType ||
    primaryBooking?.subscriptionName ||
    "Not applicable";
  const frequencyLabel = formatInvoiceFrequency(frequencyName);
  const subscriptionLabel = formatInvoiceSubscription(
    primaryBooking?.weeks,
    subscriptionName,
  );

  const serviceDescription = primaryBooking
    ? `Bathroom Cleaning Service (${bathroomLabel}, ${frequencyLabel}, ${subscriptionLabel})`
    : "Bathroom Cleaning Service";

  const payment = invoice.servicePaymentReference || {};
  const totalAmount = Number(invoice.totalAmount || invoice.amount) || 0;
  const taxableValue = Number(payment.baseAmount ?? totalAmount) || 0;
  const cgstAmount = Number(
    payment.cgstAmount ?? taxableValue * (CGST_RATE / 100),
  );
  const sgstAmount = Number(
    payment.sgstAmount ?? taxableValue * (SGST_RATE / 100),
  );
  const discountAmount = Number(payment.discountAmount || 0);
  const totalBeforeDiscount = Number(
    payment.totalBeforeDiscount ?? taxableValue + cgstAmount + sgstAmount,
  );
  const roundOff = totalAmount - (totalBeforeDiscount - discountAmount);
  const totalTaxAmount = cgstAmount + sgstAmount;
  const rate = visitCount > 0 ? taxableValue / visitCount : 0;

  const invoiceId = invoice.invoiceNumber || invoice.id || "—";
  const invoiceDate =
    invoice.invoiceDate ||
    invoice.createdDate ||
    invoice.createdAt ||
    new Date();
  const partyName = customer?.name || "—";
  const partyAddress =
    formatCustomerAddress(customer) || customer?.address || "—";
  const partyPhone =
    customer?.phone || customer?.phoneNumber || customer?.mobile || "—";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
     <title>Tax Invoice - ${escapeHtml(invoiceId)}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 6mm 8mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: 'Inter', Arial, sans-serif;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 0;
          font-size: 10px;
          line-height: 1.3;
        }
        .invoice-box {
          width: 100%;
          border: 1px solid #000;
          padding: 6mm 8mm;
          margin: 0 auto;
        }
        .top-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .company-header {
          text-align: center;
          margin-bottom: 6px;
        }
        .company-header img {
          width: 38mm;
          height: auto;
          display: block;
          margin: 0 auto 4px auto;
        }
        .company-title {
          font-weight: 700;
          font-size: 12px;
        }
        .company-sub {
          font-size: 9.5px;
        }
        .company-underline {
          font-size: 9.5px;
          text-decoration: underline;
        }
        .doc-title {
          text-align: center;
          font-weight: 700;
          font-size: 12.5px;
          margin: 6px 0;
        }
        .party-box {
          text-align: center;
          margin-bottom: 8px;
        }
        table.items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9.5px;
          margin-top: 6px;
        }
        table.items-table th, table.items-table td {
          border: 1px solid #000;
          padding: 3px 5px;
        }
        table.hsn-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
          margin-bottom: 6px;
          text-align: center;
        }
        table.hsn-table th, table.hsn-table td {
          border: 1px solid #000;
          padding: 2px 4px;
        }
        .footer-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="top-row">
          <div>
            <div>Invoice No. <b>${escapeHtml(invoiceId)}</b></div>
            <div>Ref No.</div>
          </div>
          <div>Dated <b>${fmtDateHuman(invoiceDate)}</b></div>
        </div>

        <div class="company-header">
          <img src="${jollyLogo}" alt="Jolly Home Needs" />
          <div class="company-title">${COMPANY.name}</div>
          ${COMPANY.addressLines.map((l) => `<div class="company-sub">${l}</div>`).join("")}
          <div class="company-underline">GSTIN/UIN: ${COMPANY.gstin}</div>
          <div class="company-underline">State Name : ${COMPANY.state}, Code : ${COMPANY.stateCode}</div>
        </div>

        <div class="doc-title">Tax Invoice</div>

        <div class="party-box">
          <div>Party : <b>${escapeHtml(partyName)}</b></div>
          <div style="text-decoration: underline; font-size: 9.5px;">${escapeHtml(partyAddress)}</div>
          ${customer?.gstin ? `<div style="font-size: 9.5px;">State Name : ${COMPANY.state}, Code : ${COMPANY.stateCode}</div>` : ""}
          <div style="font-size: 10px; margin-top: 2px;">Contact : ${escapeHtml(partyPhone)}</div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 32px; text-align: center;">Sl No.</th>
              <th style="text-align: left;">Description of Services</th>
              <th style="text-align: center;">HSN/SAC</th>
              <th style="text-align: center;">No of visits</th>
              <th style="text-align: center;">Rate</th>
              <th style="text-align: center;">per</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center;">1</td>
              <td style="font-weight: 600;">${escapeHtml(serviceDescription)}</td>
              <td style="text-align: center;">${CLEANING_SAC}</td>
              <td style="text-align: center;">${visitCount} visit${visitCount === 1 ? "" : "s"}</td>
              <td style="text-align: center;">${fmtMoney(rate)}</td>
              <td style="text-align: center;">visit</td>
              <td style="text-align: right;">${fmtMoney(taxableValue)}</td>
            </tr>
            ${
              discountAmount > 0
                ? `
            <tr>
              <td colspan="4" style="border: none;"></td>
              <td colspan="2" style="border: none; font-style: italic;">DISCOUNT</td>
              <td style="border: none; text-align: right;">-${fmtMoney(discountAmount)}</td>
            </tr>`
                : ""
            }
            <tr>
              <td colspan="4" style="border: none;"></td>
              <td colspan="2" style="border: none; font-style: italic;">CGST ${CGST_RATE}%</td>
              <td style="border: none; text-align: right;">${fmtMoney(cgstAmount)}</td>
            </tr>
            <tr>
              <td colspan="4" style="border: none;"></td>
              <td colspan="2" style="border: none; font-style: italic;">SGST ${SGST_RATE}%</td>
              <td style="border: none; text-align: right;">${fmtMoney(sgstAmount)}</td>
            </tr>
            <tr>
              <td colspan="4" style="border: none;"></td>
              <td colspan="2" style="border: none; font-style: italic;">ROUND OFF</td>
              <td style="border: none; text-align: right;">${fmtMoney(roundOff)}</td>
            </tr>
            <tr>
              <td colspan="4" style="border-left: 1px solid #000; border-top: 1px solid #000;"></td>
              <td colspan="2" style="font-weight: 700; text-align: center; border-top: 1px solid #000;">Total</td>
              <td style="font-weight: 700; text-align: right; color: #1a6b5c; border-top: 1px solid #000;">₹${fmtMoney(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
          <span style="font-size: 9.5px;">Amount Chargeable (in words)</span>
          <span style="font-size: 9.5px; font-style: italic;">E. & O.E</span>
        </div>
        <div style="font-weight: 700; font-size: 10.5px; margin-bottom: 6px;">${amountInWords(totalAmount)}</div>

        <table class="hsn-table">
          <thead>
            <tr>
              <th rowspan="2">HSN/SAC</th>
              <th rowspan="2">Taxable Value</th>
              <th colspan="2">CGST</th>
              <th colspan="2">SGST/UTGST</th>
              <th rowspan="2">Total Tax Amount</th>
            </tr>
            <tr>
              <th>Rate</th>
              <th>Amount</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${CLEANING_SAC}</td>
              <td>${fmtMoney(taxableValue)}</td>
              <td>${CGST_RATE}%</td>
              <td>${fmtMoney(cgstAmount)}</td>
              <td>${SGST_RATE}%</td>
              <td>${fmtMoney(sgstAmount)}</td>
              <td>${fmtMoney(totalTaxAmount)}</td>
            </tr>
            <tr>
              <td style="font-weight: 700;">Total</td>
              <td style="font-weight: 700;">${fmtMoney(taxableValue)}</td>
              <td></td>
              <td style="font-weight: 700;">${fmtMoney(cgstAmount)}</td>
              <td></td>
              <td style="font-weight: 700;">${fmtMoney(sgstAmount)}</td>
              <td style="font-weight: 700;">${fmtMoney(totalTaxAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-size: 9.5px; margin-bottom: 6px;">
          Tax Amount (in words) : <b>${taxAmountInWords(totalTaxAmount)}</b>
        </div>

        <div class="footer-row">
          <div style="max-width: 55%;">
            <div style="font-size: 9.5px; text-decoration: underline;">Declaration</div>
            <div style="font-size: 8.5px;">
              We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 9.5px;">for ${COMPANY.name}</div>
            <div style="height: 22px;"></div>
            <div style="font-size: 9.5px;">Authorised Signatory</div>
          </div>
        </div>

        <div style="text-align: center; font-size: 8.5px; text-decoration: underline; margin-top: 6px;">
          This is a Computer Generated Invoice
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function printInvoiceDocument(params) {
  const html = generateInvoiceHtml(params);
  await printHtml(html, { orientation: "landscape", pageMargin: "6mm 8mm" });
}
