import dayjs from "dayjs";
import { apiFetch } from "@/services/http/client.js";
import { ApiError } from "@/services/http/errors.js";
import { isMongoId } from "@/utils/idGenerator.js";
import { resolveCustomerId } from "@/features/customers/api/customers.api.js";
import { normalizeInvoiceRecord } from "@/features/invoices/api/invoices.api.js";
import { toMinutes, buildTimeSlots, formatTime } from "../utils/timeSlots.js";
import { normalizeBookingRecord } from "../mappers/booking.mapper.js";

export async function resolveBookingId(param) {
  if (!param) return null;
  if (isMongoId(param)) return param;

  const bookings = await apiFetch("/bookings");
  const match = Array.isArray(bookings)
    ? bookings.find((b) => b.bookingId === param || b._id === param)
    : null;

  return match ? match.bookingReference || match._id : param;
}

export async function getBookingMasters() {
  const [
    bathroomCounts,
    frequencies,
    subscriptionTypes,
    pricing,
    timeSlots,
    paymentAccounts,
    paymentMethods,
    paymentMasters,
  ] = await Promise.all([
    apiFetch("/bathroom-counts"),
    apiFetch("/service-frequencies"),
    apiFetch("/subscription-types"),
    apiFetch("/pricing"),
    apiFetch("/time-slots"),
    apiFetch("/payment-accounts"),
    apiFetch("/payment-methods"),
    apiFetch("/payment-masters?isActive=true"),
  ]);

  const activeSlots = (timeSlots || []).filter((ts) => ts.isActive !== false);

  const startMins = activeSlots
    .map((ts) => toMinutes(ts.startTime))
    .filter((m) => m != null);

  const endMins = activeSlots
    .map((ts) => toMinutes(ts.endTime))
    .filter((m) => m != null);

  const dayStartMin = startMins.length ? Math.min(...startMins) : 8 * 60;
  const dayEndMin = endMins.length ? Math.max(...endMins) : 19 * 60 + 30;

  const priceByBathroom = (pricing || []).reduce((prices, item) => {
    const bathroomCount = item.bathroomCountReference?.bathroomCount;

    if (item.isActive !== false && bathroomCount && item.price != null) {
      prices[bathroomCount] = item.price;
    }

    return prices;
  }, {});

  const durationByBathroom = (pricing || []).reduce((durations, item) => {
    const bathroomCount =
      item.bathroomCountReference?.bathroomCount ??
      item.bathroomCountId?.bathroomCount;

    const durationMinutes =
      item.serviceDurationReference?.durationMinutes ??
      item.serviceDurationId?.durationMinutes;

    if (
      item.isActive !== false &&
      bathroomCount != null &&
      durationMinutes != null &&
      Number(durationMinutes) > 0
    ) {
      durations[Number(bathroomCount)] = Number(durationMinutes);
    }

    return durations;
  }, {});

  const resolvedDurationByBathroom = {
    ...durationByBathroom,
  };

  return {
    dayStartMin,
    dayEndMin,

    rawPricing: pricing || [],
    rawBathroomCounts: bathroomCounts || [],
    rawFrequencies: frequencies || [],
    rawSubscriptionTypes: subscriptionTypes || [],
    rawTimeSlots: timeSlots || [],
    rawPaymentAccounts: paymentAccounts || [],
    rawPaymentMethods: paymentMethods || [],
    paymentMaster: (paymentMasters || [])[0] || null,

    bathrooms: (bathroomCounts || [])
      .filter((item) => item.isActive !== false)
      .sort((a, b) => a.bathroomCount - b.bathroomCount)
      .map((item) => ({
        id: item._id,
        value: item.bathroomCount,
        label: String(item.bathroomCount),
      })),

    frequencies: (frequencies || [])
      .filter((item) => item.isActive !== false)
      .map((item) => ({
        id: item._id,
        name: item.frequencyName,
        intervalDays: item.intervalDays,
        visitsPerMonth: Math.max(1, Math.round(30 / (item.intervalDays || 30))),
      })),

    plans: (subscriptionTypes || [])
      .filter((item) => item.isActive !== false)
      .map((item) => ({
        id: item._id,
        name: item.subscriptionName,
        timeGap: item.timeGap,
        termMonths: Math.max(1, Math.round(item.timeGap || 1)),
        pricePerServiceByBathroom: priceByBathroom,
      })),

    durationByBathroom: resolvedDurationByBathroom,

    slots: [],

    slotsByBathroom: Object.fromEntries(
      Object.entries(resolvedDurationByBathroom).map(
        ([bathroomCount, durationMinutes]) => [
          bathroomCount,
          buildTimeSlots(timeSlots, durationMinutes),
        ],
      ),
    ),

    paymentAccounts: (paymentAccounts || [])
      .filter((item) => item.isActive !== false)
      .map((item) => ({
        id: item._id,
        name: item.accountName,
      })),

    paymentMethods: (paymentMethods || [])
      .filter((item) => item.isActive !== false)
      .map((item) => ({
        id: item._id,
        name: item.paymentMethodName,
      })),
  };
}

export async function getBookingAvailability({
  date,
  bathrooms,
  bathroomCountId,
  pricingId,
  serviceDurationId,
}) {
  if (!date) return { slots: [] };
  const params = new URLSearchParams();
  params.append("date", date);
  if (bathrooms) params.append("bathrooms", String(bathrooms));
  if (bathroomCountId)
    params.append("bathroomCountId", String(bathroomCountId));
  if (pricingId) params.append("pricingId", String(pricingId));
  if (serviceDurationId)
    params.append("serviceDurationId", String(serviceDurationId));

  try {
    const res = await apiFetch(`/bookings/availability?${params.toString()}`);
    return res || { slots: [] };
  } catch (err) {
    console.error("Failed to fetch booking availability:", err);
    return { slots: [] };
  }
}

export async function previewBookingQuote(payload) {
  const result = await apiFetch("/bookings/preview", {
    method: "POST",
    body: payload,
  });

  return {
    numServices: Number(result.totalVisits || 0),
    pricePerService: Number(result.pricePerVisit || 0),

    serviceCharges: Number(result.baseAmount || 0),
    taxableAmount: Number(result.baseAmount || 0),

    authorizedDiscount: Number(result.discountAmount || 0),

    taxes: [
      {
        id: "CGST",
        label: "CGST",
        rate: Number(result.cgstRate || 0) / 100,
        amount: Number(result.cgstAmount || 0),
      },
      {
        id: "SGST",
        label: "SGST",
        rate: Number(result.sgstRate || 0) / 100,
        amount: Number(result.sgstAmount || 0),
      },
    ],

    taxTotal:
      Number(result.cgstAmount || 0) +
      Number(result.sgstAmount || 0),

    total: Number(result.totalAmount || 0),

    effectiveDate: dayjs().format("YYYY-MM-DD"),
  };
}

export async function listBookings({ search = "", status = "All" } = {}) {
  const bookings = await apiFetch("/bookings");

  if (!Array.isArray(bookings)) return [];

  let rows = bookings.map(normalizeBookingRecord);

  if (status !== "All") {
    rows = rows.filter((b) => b.status === status);
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();

    rows = rows.filter(
      (b) =>
        (b.customer?.name || "").toLowerCase().includes(q) ||
        (b.customer?.mobile || "").toLowerCase().includes(q),
    );
  }

  return rows.sort(
    (a, b) => new Date(b.createdOn || 0) - new Date(a.createdOn || 0),
  );
}

export async function getBooking(param) {
  const id = await resolveBookingId(param);

  let res;

  try {
    res = await apiFetch(`/bookings/${id}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }

  const rawBooking = res.booking || res;
  const normalized = normalizeBookingRecord(rawBooking);
  const bookingMongoId = String(rawBooking._id || "");
  const bookingNumber = String(rawBooking.bookingId || "");

  const [payments, subscriptions, visits, invoice] = await Promise.all([
    apiFetch("/service-payments").catch(() => []),
    apiFetch("/subscriptions").catch(() => []),
    apiFetch("/visits").catch(() => []),
    bookingMongoId
      ? apiFetch(`/invoices/booking/${bookingMongoId}`).catch(() => null)
      : Promise.resolve(null),
  ]);

  const idMatch = (v) => {
    if (!v) return false;

    const str = String(
      typeof v === "object" ? v._id || v.id || v.bookingId || "" : v,
    );

    return str === bookingMongoId || str === bookingNumber || str === param;
  };

  const matchedPayment = (Array.isArray(payments) ? payments : []).find(
    (p) =>
      idMatch(p.booking) ||
      idMatch(p.bookingId) ||
      idMatch(p.customer) ||
      idMatch(p.customerId),
  );

  const matchedSub = (Array.isArray(subscriptions) ? subscriptions : []).find(
    (s) =>
      idMatch(s.booking) ||
      idMatch(s.bookingId) ||
      (s.periods &&
        s.periods.some(
          (p) => idMatch(p.booking?.bookingId) || idMatch(p.booking?._id),
        )),
  );

  const matchedVisits = (Array.isArray(visits) ? visits : []).filter(
    (v) => idMatch(v.booking) || idMatch(v.bookingId),
  );

  return {
    ...normalized,

    ...(matchedPayment
      ? {
          serviceCharges: Number(matchedPayment.baseAmount ?? normalized.serviceCharges ?? 0),
          taxableAmount: Number(matchedPayment.baseAmount ?? normalized.taxableAmount ?? 0),
          discount: Number(matchedPayment.discountAmount || 0),
          taxes: [
            { id: "CGST", label: "CGST", rate: Number(matchedPayment.cgstRate || 0) / 100, amount: Number(matchedPayment.cgstAmount || 0) },
            { id: "SGST", label: "SGST", rate: Number(matchedPayment.sgstRate || 0) / 100, amount: Number(matchedPayment.sgstAmount || 0) },
          ],
          total: Number(matchedPayment.totalAmount ?? normalized.total ?? 0),
        }
      : {}),

    invoice: invoice ? normalizeInvoiceRecord(invoice) : null,

    payment: matchedPayment
      ? {
          ...matchedPayment,
          id: matchedPayment._id,
          paymentNumber:
            matchedPayment.paymentNumber ||
            matchedPayment.receiptNumber ||
            matchedPayment._id,
        }
      : null,

    subscription: matchedSub
      ? {
          ...matchedSub,
          id: matchedSub._id,
          subscriptionNumber:
            matchedSub.subscriptionNumber ||
            matchedSub.subscriptionId ||
            matchedSub._id,
        }
      : null,

    visits: matchedVisits.map((v) => ({
      ...v,
      id: v._id,
      visitNumber: v.visitNumber || v._id,
    })),
  };
}

export async function createBooking(payload) {
  const masters = await getBookingMasters();
  const customerId = await resolveCustomerId(payload.customerId);

  let timeSlotId = payload.timeSlotId || payload.slotId;

  if (typeof timeSlotId === "string" && timeSlotId.includes("-")) {
    const selectedBathroom = masters.rawBathroomCounts?.find(
      (item) => String(item._id) === String(payload.bathroomCountId),
    );

    const selectedBathroomCount = selectedBathroom?.bathroomCount;

    const bathroomSlots =
      masters.slotsByBathroom?.[String(selectedBathroomCount)] || [];

    const slotObj = bathroomSlots.find((slot) => slot.id === timeSlotId);

    if (slotObj?.mongoId) {
      timeSlotId = slotObj.mongoId;
    } else {
      timeSlotId = timeSlotId.split("-")[0];
    }
  }

  const matchedPricing = masters.rawPricing.find((p) => {
    const pricingBathroomId =
      p.bathroomCountReference?._id ||
      p.bathroomCountReference ||
      p.bathroomCountId?._id ||
      p.bathroomCountId;
    const pricingFrequencyId = p.serviceFrequencyReference?._id || p.serviceFrequencyReference;
    const pricingSubscriptionId = p.subscriptionTypeReference?._id || p.subscriptionTypeReference;

    return (
      String(pricingBathroomId) === String(payload.bathroomCountId) &&
      String(pricingFrequencyId) === String(payload.serviceFrequencyId) &&
      String(pricingSubscriptionId) === String(payload.subscriptionTypeId) &&
      p.isActive !== false
    );
  });

  if (!matchedPricing) {
    throw new ApiError(
      "No active pricing configuration found for the selected bathroom count. Please configure the pricing in Settings.",
      400,
    );
  }

  const pricingId = matchedPricing._id;

  let resolvedStartTime = payload.startTime;
  if (
    !resolvedStartTime &&
    typeof (payload.timeSlotId || payload.slotId) === "string"
  ) {
    const rawSlot = payload.timeSlotId || payload.slotId;
    if (rawSlot.includes("-")) {
      const mins = Number(rawSlot.split("-")[1]);
      if (Number.isFinite(mins)) {
        resolvedStartTime = formatTime(mins);
      }
    }
  }

  const backendBody = {
    customerId,
    bathroomCountId: payload.bathroomCountId || undefined,
    pricingId,
    serviceFrequencyId:
      payload.frequencyId || payload.serviceFrequencyId || undefined,
    subscriptionTypeId:
      payload.planId || payload.subscriptionTypeId || undefined,
    timeSlotId,
    scheduledDate: payload.startDate || payload.scheduledDate,
    startTime: resolvedStartTime || undefined,
    discount: Number(payload.discount) || 0,
    discountReason: payload.discountReason || "",
    paymentMethodId:
      payload.paymentModeId || payload.paymentMethodId || undefined,
    paymentAccountId:
      payload.receiverAccountId || payload.paymentAccountId || undefined,
    paymentAmount:
      payload.paymentAmount !== undefined && payload.paymentAmount !== null
        ? Number(payload.paymentAmount)
        : undefined,
    transactionId: payload.paymentReference || payload.transactionId || "",
  };

  const result = await apiFetch("/bookings", {
    method: "POST",
    body: backendBody,
  });

  const createdBooking = result.booking || result;

  return {
    ...result,

    booking: {
      ...createdBooking,
      id: createdBooking._id,
      bookingNumber: createdBooking.bookingId || createdBooking._id,
      status: "Confirmed",
    },
  };
}

export async function cancelBooking(param, reason) {
  const id = await resolveBookingId(param);

  const booking = await apiFetch(`/bookings/${id}/cancel`, {
    method: "PATCH",
    body: { reason },
  });

  return normalizeBookingRecord(booking);
}

export { getBooking as getBookingByNumber, getBookingAvailability as checkSlotAvailability };
