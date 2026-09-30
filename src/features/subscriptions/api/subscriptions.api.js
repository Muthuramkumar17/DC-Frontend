import { apiFetch } from "@/services/http/client.js";
import { isMongoId } from "@/utils/idGenerator.js";

export async function resolveSubscriptionId(param) {
  if (!param) return null;
  if (isMongoId(param)) return param;

  const subscriptions = await apiFetch("/subscriptions");
  const match = Array.isArray(subscriptions)
    ? subscriptions.find((s) => s.subscriptionId === param || s._id === param)
    : null;

  return match ? match._id : param;
}

function normalizeSubscriptionRecord(subscription) {
  const customerObj =
    typeof subscription.customerReference === "object"
      ? subscription.customerReference
      : null;

  const bookingObj =
    typeof subscription.bookingReference === "object"
      ? subscription.bookingReference
      : null;

  const frequencyObj =
    typeof subscription.serviceFrequencyReference === "object"
      ? subscription.serviceFrequencyReference
      : null;

  const planObj =
    typeof subscription.subscriptionTypeReference === "object"
      ? subscription.subscriptionTypeReference
      : null;

  const totalVisits = subscription.totalVisits || 0;
  const completedVisits = subscription.completedVisits || 0;

  const planName =
    planObj?.subscriptionName ||
    planObj?.name ||
    subscription.subscriptionTypeName ||
    "—";

  const frequencyName =
    frequencyObj?.frequencyName ||
    frequencyObj?.name ||
    subscription.serviceFrequencyName ||
    subscription.frequencyName ||
    "—";

  return {
    ...subscription,
    id: subscription._id,
    subscriptionNumber: subscription.subscriptionId || subscription._id,

    customer: customerObj
      ? {
          ...customerObj,
          id: customerObj._id,
          customerNumber: customerObj.customerId || customerObj._id,
          mobile: customerObj.phoneNumber,
        }
      : null,

    address: customerObj
      ? {
          addressLine: customerObj.address,
          area: customerObj.area,
          label: "Service address",
        }
      : null,

    booking: bookingObj
      ? {
          ...bookingObj,
          id: bookingObj._id,
          bookingNumber: bookingObj.bookingId || bookingObj._id,
        }
      : null,

    status: subscription.subscriptionStatus || "Active",

    currentPeriod: {
      totalServices: totalVisits,
      completedServices: completedVisits,
      endDate: subscription.endDate,
      planName,
      frequencyName,
    },

    nextVisit: null,
    renewalStatus: "On Track",
    createdOn: subscription.createdAt,
  };
}

export async function listSubscriptions({ search = "", status = "All" } = {}) {
  const [subscriptions, visits] = await Promise.all([
    apiFetch("/subscriptions"),
    apiFetch("/visits").catch(() => []),
  ]);

  if (!Array.isArray(subscriptions)) {
    return [];
  }

  const visitsBySubscription = new Map();

  for (const visit of Array.isArray(visits) ? visits : []) {
    const subscriptionId =
      typeof visit.subscriptionReference === "object"
        ? visit.subscriptionReference?._id
        : visit.subscriptionReference;

    if (!subscriptionId) continue;

    if (!visitsBySubscription.has(subscriptionId)) {
      visitsBySubscription.set(subscriptionId, []);
    }

    visitsBySubscription.get(subscriptionId).push(visit);
  }

  let rows = subscriptions
    .map((subscription) => {
      const normalized = normalizeSubscriptionRecord(subscription);
      const relatedVisits = visitsBySubscription.get(subscription._id) || [];

      const nextVisit = [...relatedVisits]
        .filter((visit) => !visit.isCompleted && !visit.isCancelled)
        .sort(
          (a, b) =>
            new Date(a.scheduledStartDateTime || 0) -
            new Date(b.scheduledStartDateTime || 0),
        )[0];

      return {
        ...normalized,
        nextVisit: nextVisit
          ? {
              id: nextVisit._id,
              date: nextVisit.scheduledStartDateTime,
              status: nextVisit.isCompleted
                ? "Completed"
                : nextVisit.isCancelled
                  ? "Cancelled"
                  : "Scheduled",
            }
          : null,
      };
    })
    .filter((subscription) => subscription.status !== "Completed");

  if (status !== "All") {
    rows = rows.filter((s) => s.status === status);
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();

    rows = rows.filter(
      (s) => (s.customer?.name || "").toLowerCase().includes(q),
    );
  }

  return rows.sort(
    (a, b) => new Date(b.createdOn || 0) - new Date(a.createdOn || 0),
  );
}

export async function getSubscription(param) {
  const id = await resolveSubscriptionId(param);

  let res;

  try {
    res = await apiFetch(`/subscriptions/${id}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }

  const subObj = res.subscription || res;
  const visits = res.visits || [];
  const normalized = normalizeSubscriptionRecord(subObj);

  const formattedVisits = visits.map((v) => ({
    ...v,
    id: v._id,
    date: v.scheduledStartDateTime,

    status: v.isCompleted
      ? "Completed"
      : v.isCancelled
        ? "Cancelled"
        : "Scheduled",
  }));

  const period = {
    id: `${subObj._id}-period`,
    periodNumber: `PER-${subObj.subscriptionId || subObj._id}`,
    kind: "Current",
    status: subObj.subscriptionStatus || "Active",
    startDate: subObj.startDate,
    endDate: subObj.endDate,
    totalServices: subObj.totalVisits || formattedVisits.length,
    completedServices:
      subObj.completedVisits ||
      formattedVisits.filter((v) => v.isCompleted).length,
    planName: normalized.currentPeriod?.planName || "—",
    frequencyName: normalized.currentPeriod?.frequencyName || "—",
    booking: normalized.booking,
    visits: formattedVisits,
  };

  return {
    ...normalized,
    currentPeriod: period,
    periods: [period],
    nextVisit:
      formattedVisits.find((v) => !v.isCompleted && !v.isCancelled) || null,
  };
}

export async function pauseSubscription(param, reason) {
  const id = await resolveSubscriptionId(param);
  return apiFetch(`/subscriptions/${id}/pause`, {
    method: "POST",
    body: { reason },
  });
}

export async function resumeSubscription(param) {
  const id = await resolveSubscriptionId(param);
  return apiFetch(`/subscriptions/${id}/resume`, {
    method: "POST",
  });
}

export async function cancelSubscription(param, reason) {
  const id = await resolveSubscriptionId(param);
  return apiFetch(`/subscriptions/${id}/cancel`, {
    method: "POST",
    body: { reason },
  });
}

export async function getSubscriptionReceiptData(subscription) {
  if (!subscription) return {};

  const idOf = (v) => String(v && typeof v === "object" ? v._id : v || "");
  const subId = idOf(subscription._id || subscription.id);
  const bookingRef = subscription.bookingReference || subscription.bookingId;
  const bookingMongoId = idOf(bookingRef);
  const customerId = idOf(subscription.customerId || subscription.customerReference);

  const [customers, payments, invoices, frequenciesList, subscriptionTypesList] =
    await Promise.all([
      apiFetch("/customers").catch(() => []),
      apiFetch("/service-payments").catch(() => []),
      apiFetch("/invoices").catch(() => []),
      apiFetch("/service-frequencies").catch(() => []),
      apiFetch("/subscription-types").catch(() => []),
    ]);

  let customerData = null;
  if (Array.isArray(customers)) {
    customerData =
      customers.find(
        (c) =>
          idOf(c._id) === customerId ||
          c.customerId === subscription.customer?.customerNumber ||
          c.customerId === subscription.customer?.customerId,
      ) || null;
  }

  let paymentData = null;
  if (Array.isArray(payments)) {
    paymentData =
      payments.find(
        (p) =>
          idOf(p.subscriptionReference) === subId ||
          (bookingMongoId && idOf(p.bookingReference) === bookingMongoId),
      ) || null;
  }

  let invoiceData = null;
  if (Array.isArray(invoices)) {
    invoiceData =
      invoices.find(
        (inv) =>
          idOf(inv.subscriptionReference) === subId ||
          (bookingMongoId && idOf(inv.bookingReference) === bookingMongoId) ||
          (paymentData && idOf(inv.servicePaymentReference) === idOf(paymentData._id)),
      ) || null;
  }

  return {
    customerData,
    paymentData,
    invoiceData,
    frequenciesList: Array.isArray(frequenciesList) ? frequenciesList : [],
    subscriptionTypesList: Array.isArray(subscriptionTypesList) ? subscriptionTypesList : [],
  };
}

export { getSubscription as getSubscriptionByNumber };

