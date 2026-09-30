import { apiFetch } from "@/services/http/client.js";
import { isMongoId } from "@/utils/idGenerator.js";

function getTotalVisits(booking) {
  const storedVisits = Number(
    booking?.totalVisits ??
      booking?.numServices ??
      (Array.isArray(booking?.visits) ? booking.visits.length : booking?.visits),
  );
  if (Number.isFinite(storedVisits) && storedVisits > 0) return storedVisits;

  const durationMonths = Number(
    booking?.subscriptionTypeReference?.timeGap ??
      booking?.subscriptionType?.timeGap,
  );
  const intervalDays = Number(
    booking?.serviceFrequencyReference?.intervalDays ??
      booking?.serviceFrequency?.intervalDays,
  );

  if (durationMonths > 0 && intervalDays > 0) {
    return Math.max(1, durationMonths * Math.max(1, Math.round(30 / intervalDays)));
  }

  return 1;
}

export function normalizeInvoiceRecord(invoice) {
  const customerObj =
    typeof invoice.customerReference === "object"
      ? invoice.customerReference
      : null;

  const bookingObj =
    typeof invoice.bookingReference === "object"
      ? invoice.bookingReference
      : null;

  return {
    ...invoice,
    id: invoice._id,
    invoiceNumber: invoice.invoiceNumber || invoice._id,
    amount: invoice.amount || 0,
    createdDate: invoice.createdAt,

    customer: customerObj
      ? {
          ...customerObj,
          id: customerObj._id,
          customerNumber: customerObj.customerId || customerObj._id,
          name: customerObj.name,
          phone: customerObj.phoneNumber,
        }
      : null,

    booking: bookingObj
      ? {
          ...bookingObj,
          id: bookingObj._id,
          bookingNumber: bookingObj.bookingId || bookingObj._id,
          totalVisits: getTotalVisits(bookingObj),
          bathroomCount:
            bookingObj.bathroomCount ??
            bookingObj.bathroomCountReference?.bathroomCount ??
            bookingObj.bathroomCountId?.bathroomCount,
          frequencyName:
            bookingObj.serviceFrequencyReference?.frequencyName ||
            bookingObj.serviceFrequency?.frequencyName ||
            bookingObj.frequencyName ||
            bookingObj.frequency ||
            "—",
          planName:
            bookingObj.subscriptionTypeReference?.subscriptionName ||
            bookingObj.subscriptionType?.subscriptionName ||
            bookingObj.planName ||
            bookingObj.subscriptionType ||
            "—",
        }
      : null,
  };
}

export async function listInvoices({ search = "" } = {}) {
  const invoices = await apiFetch("/invoices");

  if (!Array.isArray(invoices)) return [];

  let rows = invoices.map(normalizeInvoiceRecord);

  if (search.trim()) {
    const q = search.trim().toLowerCase();

    rows = rows.filter(
      (i) => (i.customer?.name || "").toLowerCase().includes(q),
    );
  }

  return rows.sort(
    (a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0),
  );
}

export async function getInvoice(param) {
  if (isMongoId(param)) {
    try {
      const invoice = await apiFetch(`/invoices/${param}`);
      return normalizeInvoiceRecord(invoice);
    } catch (err) {}
  }

  const invoices = await listInvoices();
  const match = invoices.find(
    (i) => i.invoiceNumber === param || i.id === param,
  );

  if (match) return match;

  try {
    const invoiceByBooking = await apiFetch(`/invoices/booking/${param}`);
    return normalizeInvoiceRecord(invoiceByBooking);
  } catch (err) {}

  return null;
}

export async function recordInvoiceDownload(invoiceNumber) {
  return true;
}

export { getInvoice as getInvoiceByNumber };
