/**
 * serviceAreaPrintHelper.js
 * -----------------------------------------------------------------------
 * Generates standalone HTML for Service Area Sheet printing and invokes print.
 * -----------------------------------------------------------------------
 */

import { fmtDateHuman, fmtTime12 } from "@/utils/scheduling";
import { printHtml } from "@/utils/printDocument";
import { escapeHtml } from "@/utils/htmlEscape.js";
import jollyLogo from "@/assets/logo/Jollylight.png";



export function generateServiceAreaHtml({
  date,
  bookings = [],
  customerById = {},
}) {
  const dateFormatted = fmtDateHuman(date);

  const rows =
    bookings.length === 0
      ? `<tr><td colspan="3" style="padding: 16px; text-align: center; color: #666; border: 1px solid #CBD5E1;">No scheduled bookings for this date.</td></tr>`
      : bookings
          .flatMap((booking, index) => {
            const customer =
              booking.customer || customerById[booking.customerId] || {};
            const startMinutes = timeToMinutes(booking.startTime);
            const endMinutes = startMinutes + Number(booking.duration || 0);
            const timeStr = booking.startTime
              ? `${fmtTime12(booking.startTime)} - ${fmtTime12(minutesToTime(endMinutes))}`
              : "—";
            const customerName = customer.name || "—";
            const contactNo =
              customer.phone || customer.phoneNumber || customer.mobile || "—";
            const apartment =
              customer.apartmentName ||
              customer.apartmentNumber ||
              customer.apartment ||
              "—";
            const doorNo = customer.doorNo || customer.doorNumber || "—";
            const area = customer.area || "—";

            const rows = [
              `
          <tr style="break-inside: avoid;">
            <td style="padding: 12px 14px; border: 1px solid #CBD5E1; vertical-align: top; font-size: 16px; font-weight: 700; width: 16%;">
              ${timeStr}
            </td>
            <td style="padding: 12px 14px; border: 1px solid #CBD5E1; vertical-align: top; width: 59%;">
              <div style="font-size: 14px; margin-bottom: 3px;">Customer name: <strong>${escapeHtml(customerName)}</strong></div>
<div style="font-size: 14px; margin-bottom: 4px;">Contact no: <strong>${escapeHtml(contactNo)}</strong></div>
<div style="font-size: 15px; margin-top: 4px;">Apartment name: <strong>${escapeHtml(apartment)}</strong></div>
<div style="font-size: 15px;">Door no: <strong>${escapeHtml(doorNo)}</strong></div>
<div style="font-size: 15px;">Area: <strong>${escapeHtml(area)}</strong></div>
            </td>
            <td style="padding: 12px 14px; border: 1px solid #CBD5E1; vertical-align: top; width: 25%; min-height: 70px;">
              <div style="height: 60px;"></div>
            </td>
          </tr>
        `,
            ];

            const nextBooking = bookings[index + 1];
            if (nextBooking) {
              const bufferMinutes = Number(
                booking.bufferMinutes ??
                  booking.timeSlotReference?.bufferTime ??
                  booking.booking?.timeSlotReference?.bufferTime ??
                  0,
              );

              if (bufferMinutes > 0) {
                rows.push(`
              <tr style="break-inside: avoid;">
                    
                    <td style="padding: 8px 14px; border: 1px solid #CBD5E1; vertical-align: top; font-size: 14px; color: #64748B;"></td>
                    <td style="padding: 8px 14px; border: 1px solid #CBD5E1; vertical-align: middle; text-align: center; font-size: 16px; color: #64748B;">
                      <strong>(BREAK ${bufferMinutes} mins)</strong>
                </td>
                <td style="border: 1px solid #CBD5E1;"></td>
              </tr>
            `);
              }
            }

            return rows;
          })
          .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Service Area Sheet - ${escapeHtml(dateFormatted)}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 10mm 12mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: Arial, sans-serif;
          color: #1F2933;
          background: #fff;
          margin: 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.4;
        }
        .container {
          width: 100%;
          margin: 0 auto;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .header img {
          width: 170px;
          height: auto;
          display: block;
        }
        .title-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 14px;
          border-bottom: 2px solid #1a6b5c;
          padding-bottom: 6px;
        }
        .title-text {
          font-size: 20px;
          font-weight: 700;
          color: #1a6b5c;
        }
        .date-text {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }
        table.service-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        table.service-table th {
          background-color: #F8FAFC;
          font-weight: 700;
          text-align: left;
          font-size: 14px;
          border: 1px solid #CBD5E1;
          padding: 10px 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${jollyLogo}" alt="Jolly Home Needs" />
        </div>
        <div class="title-row">
          <div class="title-text">Cleaning Services</div>
          <div class="date-text">${escapeHtml(dateFormatted)}</div>
        </div>
        <table class="service-table">
          <thead>
            <tr>
              <th style="width: 16%;">Time</th>
              <th style="width: 59%;">Customer details</th>
              <th style="width: 25%;">Customer signature</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
}

function timeToMinutes(value) {
  if (!value) return 0;
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

function minutesToTime(value) {
  return `${String(Math.floor(value / 60) % 24).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export async function printServiceAreaDocument(params) {
  const html = generateServiceAreaHtml(params);
  await printHtml(html, { orientation: "landscape", pageMargin: "10mm 12mm" });
}
