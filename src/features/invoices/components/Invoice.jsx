import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  fmtDateHuman,
  fmtMoney,
  fmtTime12,
  formatCustomerAddress,
} from "@/utils/scheduling.js";
import jollyLogo from "@/assets/logo/Jollylight.png";

const BRAND = {
  black: "#111111",
  greenDark: "#0F5C57",
};

const COMPANY = {
  name: "MEENAKOUSALYA PRIVATE LIMITED",
  addressLines: [
    "Ground Floor, Bearing No.514, K. R. Garden 8th Block, Koramangala",
    "Gadag Betageri, Bengaluru",
  ],
  gstin: "29AASCM1112C1ZP",
  state: "Karnataka",
  stateCode: "29",
};

const CLEANING_SAC = "99853300"; // SAC code for cleaning services — confirm with your accountant
const CGST_RATE = 9;
const SGST_RATE = 9;

// Helpers

function formatInvoiceFrequency(frequency) {
  return (
    {
      weekly: "Once a week",
      biweekly: "Once every 2 weeks",
      monthly: "Once a month",
      once: "One-time service",
    }[frequency] || frequency || "Not recorded"
  );
}

function formatInvoiceSubscription(weeks, subscriptionType) {
  if (subscriptionType) return subscriptionType;
  const monthsByWeeks = { 8: 2, 12: 3, 24: 6, 48: 12 };
  const months = monthsByWeeks[weeks];
  return months ? `${months} months` : weeks ? `${weeks} weeks` : "Not applicable";
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

export default function Invoice({
  invoice,
  customer,
  booking,
  bookings = [],
}) {
  const invoiceBookings = bookings.length ? bookings : booking ? [booking] : [];
  const sortedBookings = [...invoiceBookings].sort((a, b) =>
    String(a.date || "").localeCompare(String(b.date || "")),
  );
  const primaryBooking = booking || sortedBookings[0];
  const visitCount = Number(
    primaryBooking?.totalVisits ??
      primaryBooking?.numServices ??
      primaryBooking?.visits ??
      primaryBooking?.weeks ??
      invoice?.totalVisits ??
      invoice?.booking?.totalVisits ??
      1
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
  const subscriptionLabel = formatInvoiceSubscription(primaryBooking?.weeks, subscriptionName);

  const serviceDescription =
    primaryBooking
      ? `Bathroom Cleaning Service (${bathroomLabel}, ${frequencyLabel}, ${subscriptionLabel})`
      : "Bathroom Cleaning Service";

  const payment = invoice.servicePaymentReference || {};
  const totalAmount = Number(invoice.amount) || 0;
  const taxableValue = Number(payment.baseAmount ?? totalAmount) || 0;
  const cgstAmount = Number(payment.cgstAmount ?? taxableValue * (CGST_RATE / 100));
  const sgstAmount = Number(payment.sgstAmount ?? taxableValue * (SGST_RATE / 100));
  const discountAmount = Number(payment.discountAmount || 0);
  const totalBeforeDiscount = Number(payment.totalBeforeDiscount ?? taxableValue + cgstAmount + sgstAmount);
  const roundOff = totalAmount - (totalBeforeDiscount - discountAmount);
  const totalTaxAmount = cgstAmount + sgstAmount;
  const rate = visitCount > 0 ? taxableValue / visitCount : 0;

  return (
    <Box
      className="invoice-half-a4"
      sx={{
        position: "relative",
        fontFamily: "'Inter',sans-serif",
        color: BRAND.black,
        fontSize: 10,
        lineHeight: 1.3,
        width: "250mm",
        height: "176.5mm",
        boxSizing: "border-box",
        mx: "auto",
        p: "6mm 8mm",
        border: "1px solid #000",
        overflow: "hidden",
        "@media print": {
          width: "100%",
          maxWidth: "none",
          height: "100%",
          border: "1px solid #000",
          boxShadow: "none",
          margin: "0 !important",
          overflow: "hidden",
        },
      }}
    >
      {/* Top row: invoice date */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Box>
          <Typography sx={{ fontSize: 10 }}>
            Invoice
          </Typography>
          <Typography sx={{ fontSize: 10 }}>Ref No.</Typography>
        </Box>
        <Typography sx={{ fontSize: 10 }}>
          Dated <b>{fmtDateHuman(invoice.createdDate)}</b>
        </Typography>
      </Box>

      {/* Company header */}
      <Box sx={{ textAlign: "center", mb: 0.5 }}>
        <Box
          component="img"
          src={jollyLogo}
          alt="Jolly Home Needs"
          sx={{
            display: "block",
            width: "38mm",
            height: "auto",
            mx: "auto",
            mb: 0.4,
          }}
        />
        <Typography sx={{ fontWeight: 700, fontSize: 12 }}>
          {COMPANY.name}
        </Typography>
        {COMPANY.addressLines.map((line, i) => (
          <Typography key={i} sx={{ fontSize: 9.5 }}>
            {line}
          </Typography>
        ))}
        <Typography sx={{ fontSize: 9.5, textDecoration: "underline" }}>
          GSTIN/UIN: {COMPANY.gstin}
        </Typography>
        <Typography sx={{ fontSize: 9.5, textDecoration: "underline" }}>
          State Name : {COMPANY.state}, Code : {COMPANY.stateCode}
        </Typography>
      </Box>

      <Typography
        sx={{ textAlign: "center", fontWeight: 700, fontSize: 12.5, mb: 0.75 }}
      >
        Tax Invoice
      </Typography>

      {/* Party details */}
      <Box sx={{ textAlign: "center", mb: 0.75 }}>
        <Typography sx={{ fontSize: 10 }}>
          Party : <b>{customer?.name || "—"}</b>
        </Typography>
        <Typography sx={{ fontSize: 9.5, textDecoration: "underline" }}>
          {formatCustomerAddress(customer)}
        </Typography>
        {customer?.gstin && (
          <Typography sx={{ fontSize: 9.5 }}>
            State Name : {COMPANY.state}, Code : {COMPANY.stateCode}
          </Typography>
        )}
        <Typography sx={{ fontSize: 10, mt: 0.25 }}>
          Contact : {customer?.phone || "—"}
        </Typography>
      </Box>

      {/* Line items table */}
      <Box
        component="table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 9.5,
          mt: 0.75,
          "& td, & th": {
            border: "1px solid #000",
            padding: "2px 4px",
          },
        }}
      >
        <thead>
          <tr>
            <th style={{ width: 26 }}>Sl No.</th>
            <th style={{ textAlign: "left" }}>Description of Services</th>
            <th>HSN/SAC</th>
            <th>No of visits</th>
            <th>Rate</th>
            <th>per</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: "center" }}>1</td>
            <td style={{ fontWeight: 600 }}>{serviceDescription}</td>
            <td style={{ textAlign: "center" }}>{CLEANING_SAC}</td>
            <td style={{ textAlign: "center" }}>
              {visitCount} visit{visitCount === 1 ? "" : "s"}
            </td>
            <td style={{ textAlign: "center" }}>{fmtMoney(rate)}</td>
            <td style={{ textAlign: "center" }}>visit</td>
            <td style={{ textAlign: "right" }}>{fmtMoney(taxableValue)}</td>
          </tr>

          {discountAmount > 0 && (
            <tr>
              <td colSpan={4} style={{ border: "none" }}></td>
              <td colSpan={2} style={{ border: "none", fontStyle: "italic" }}>
                DISCOUNT
              </td>
              <td style={{ border: "none", textAlign: "right" }}>
                -{fmtMoney(discountAmount)}
              </td>
            </tr>
          )}

          <tr>
            <td colSpan={4} style={{ border: "none" }}></td>
            <td colSpan={2} style={{ border: "none", fontStyle: "italic" }}>
              CGST {CGST_RATE}%
            </td>
            <td style={{ border: "none", textAlign: "right" }}>
              {fmtMoney(cgstAmount)}
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={{ border: "none" }}></td>
            <td colSpan={2} style={{ border: "none", fontStyle: "italic" }}>
              SGST {SGST_RATE}%
            </td>
            <td style={{ border: "none", textAlign: "right" }}>
              {fmtMoney(sgstAmount)}
            </td>
          </tr>
          <tr>
            <td colSpan={4} style={{ border: "none" }}></td>
            <td colSpan={2} style={{ border: "none", fontStyle: "italic" }}>
              ROUND OFF
            </td>
            <td style={{ border: "none", textAlign: "right" }}>
              {fmtMoney(roundOff)}
            </td>
          </tr>

          <tr>
            <td
              colSpan={4}
              style={{
                borderLeft: "1px solid #000",
                borderTop: "1px solid #000",
              }}
            ></td>
            <td
              colSpan={2}
              style={{
                fontWeight: 700,
                textAlign: "center",
                borderTop: "1px solid #000",
              }}
            >
              Total
            </td>
            <td
              style={{
                fontWeight: 700,
                textAlign: "right",
                color: BRAND.greenDark,
                borderTop: "1px solid #000",
              }}
            >
              ₹{fmtMoney(totalAmount)}
            </td>
          </tr>
        </tbody>
      </Box>

      {/* Amount in words */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
        <Typography sx={{ fontSize: 9.5 }}>
          Amount Chargeable (in words)
        </Typography>
        <Typography sx={{ fontSize: 9.5, fontStyle: "italic" }}>
          E. & O.E
        </Typography>
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 10.5, mb: 0.75 }}>
        {amountInWords(totalAmount)}
      </Typography>

      {/* HSN/SAC */}
      <Box
        component="table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 9,
          mb: 0.75,
          "& td, & th": {
            border: "1px solid #000",
            padding: "2px 4px",
            textAlign: "center",
          },
        }}
      >
        <thead>
          <tr>
            <th rowSpan={2}>HSN/SAC</th>
            <th rowSpan={2}>Taxable Value</th>
            <th colSpan={2}>CGST</th>
            <th colSpan={2}>SGST/UTGST</th>
            <th rowSpan={2}>Total Tax Amount</th>
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
            <td>{CLEANING_SAC}</td>
            <td>{fmtMoney(taxableValue)}</td>
            <td>{CGST_RATE}%</td>
            <td>{fmtMoney(cgstAmount)}</td>
            <td>{SGST_RATE}%</td>
            <td>{fmtMoney(sgstAmount)}</td>
            <td>{fmtMoney(totalTaxAmount)}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700 }}>Total</td>
            <td style={{ fontWeight: 700 }}>{fmtMoney(taxableValue)}</td>
            <td></td>
            <td style={{ fontWeight: 700 }}>{fmtMoney(cgstAmount)}</td>
            <td></td>
            <td style={{ fontWeight: 700 }}>{fmtMoney(sgstAmount)}</td>
            <td style={{ fontWeight: 700 }}>{fmtMoney(totalTaxAmount)}</td>
          </tr>
        </tbody>
      </Box>

      <Typography sx={{ fontSize: 9.5, mb: 0.75 }}>
        Tax Amount (in words) : <b>{taxAmountInWords(totalTaxAmount)}</b>
      </Typography>

      {/* Declaration */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ maxWidth: "55%" }}>
          <Typography sx={{ fontSize: 9.5, textDecoration: "underline" }}>
            Declaration
          </Typography>
          <Typography sx={{ fontSize: 8.5 }}>
            We declare that this invoice shows the actual price of the services
            described and that all particulars are true and correct.
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: 9.5 }}>for {COMPANY.name}</Typography>
          <Box sx={{ height: 22 }} />
          <Typography sx={{ fontSize: 9.5 }}>Authorised Signatory</Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          textAlign: "center",
          fontSize: 8.5,
          textDecoration: "underline",
          mt: 0.75,
        }}
      >
        This is a Computer Generated Invoice
      </Typography>
    </Box>
  );
}
