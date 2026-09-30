import { apiFetch } from "@/services/http/client.js";
import { isMongoId } from "@/utils/idGenerator.js";
import { normalizeInvoiceRecord } from "@/features/invoices/api/invoices.api.js";

export async function resolveCustomerId(param) {
  if (!param) return null;
  if (isMongoId(param)) return param;

  const customers = await apiFetch(
    `/customers?search=${encodeURIComponent(param)}`,
  );
  const match = Array.isArray(customers)
    ? customers.find(
        (c) =>
          c.customerId === param ||
          c.customerNumber === param ||
          c._id === param ||
          c.phoneNumber === param,
      )
    : null;

  return match ? match._id : param;
}

export async function listCustomers({ search = "", status = "All" } = {}) {
  const queryParam = search.trim()
    ? `?search=${encodeURIComponent(search.trim())}`
    : "";

  const customers = await apiFetch(`/customers${queryParam}`);

  if (!Array.isArray(customers)) return [];

  let rows = customers.map((customer) => ({
    id: customer._id,
    customerNumber:
      customer.customerId || customer.customerNumber || customer._id,
    name: customer.name,
    mobile: customer.phoneNumber,
    email: customer.email || "",
    status: customer.isActive ? "Active" : "Inactive",
    address: customer.address,
    doorNo: customer.doorNo || "",
    block: customer.block || "",
    apartmentName: customer.apartmentName || "",
    landmark: customer.landmark || "",
    area: customer.area || "",
    city: customer.city || "",
    pincode: customer.pincode || "",
    defaultAddress: customer.address
      ? {
          addressLine: customer.address,
          area: customer.area || null,
        }
      : null,
    defaultArea: customer.area || "",
    serviceFrequencyName:
      customer.serviceFrequency?.name ||
      customer.serviceFrequency?.frequencyName ||
      customer.serviceFrequency?.serviceFrequencyName ||
      "—",
    subscriptionTypeName:
      customer.subscriptionType?.name ||
      customer.subscriptionType?.subscriptionTypeName ||
      customer.subscriptionType?.typeName ||
      customer.subscriptionType?.subscriptionName ||
      "—",
    addressCount: customer.address ? 1 : 0,
    activeSubscriptionCount: customer.activeSubscriptionCount || 0,
    createdOn: customer.createdAt,
  }));

  if (status !== "All") {
    rows = rows.filter((c) => c.status === status);
  }

  return rows.sort(
    (a, b) => new Date(b.createdOn || 0) - new Date(a.createdOn || 0),
  );
}

export async function getCustomerByNumber(param) {
  const id = await resolveCustomerId(param);

  const customer = await apiFetch(`/customers/${id}`);

  return {
    ...customer,
    id: customer._id,
    customerNumber: customer.customerId || customer._id,
    mobile: customer.phoneNumber,
    status: customer.isActive ? "Active" : "Inactive",
  };
}

export async function listAddressesForCustomer(param) {
  const id = await resolveCustomerId(param);
  const customer = await apiFetch(`/customers/${id}`);

  if (!customer || !customer.address) return [];

  return [
    {
      id: customer._id,
      addressNumber: customer._id,
      customerId: customer._id,
      label: "Primary Address",
      addressLine: customer.address,
      doorNo: customer.doorNo || "",
      block: customer.block || "",
      community: customer.apartmentName || "",
      area: customer.area || "",
      city: customer.city || "",
      pincode: customer.pincode || "",
      landmark: customer.landmark || "",
      isDefault: true,
      status: customer.isActive ? "Active" : "Inactive",
    },
  ];
}

export async function findByMobile(mobile) {
  if (!mobile) return [];

  const customers = await apiFetch(
    `/customers?search=${encodeURIComponent(mobile)}`,
  );

  if (!Array.isArray(customers)) return [];

  return customers.map((customer) => ({
    id: customer._id,
    customerNumber: customer.customerId || customer._id,
    name: customer.name,
    mobile: customer.phoneNumber,
  }));
}

export async function createCustomerWithAddress(payload) {
  const customer = await apiFetch("/customers", {
    method: "POST",
    body: {
      name: payload.name,
      phoneNumber: payload.mobile,
      address: payload.addressLine || payload.address || "",
      doorNo: payload.doorNo || "",
      block: payload.block || "",
      apartmentName: payload.community || payload.apartmentName || "",
      landmark: payload.landmark || "",
      city: payload.city || "",
      pincode: payload.pincode || "",
      area: payload.area || "",
    },
  });

  return {
    customer: {
      ...customer,
      id: customer._id,
      customerNumber: customer.customerId || customer._id,
      mobile: customer.phoneNumber,
    },

    address: {
      id: customer._id,
      addressNumber: customer._id,
      addressLine: customer.address,
    },
  };
}

export async function updateCustomer(param, payload) {
  const id = await resolveCustomerId(param);

  const customer = await apiFetch(`/customers/${id}`, {
    method: "PUT",
    body: {
      name: payload.name,
      phoneNumber: payload.mobile,
      address: payload.addressLine || payload.address || "",
      doorNo: payload.doorNo || "",
      block: payload.block || "",
      apartmentName: payload.community || payload.apartmentName || "",
      landmark: payload.landmark || "",
      city: payload.city || "",
      pincode: payload.pincode || "",
      area: payload.area || "",
    },
  });

  return {
    ...customer,
    id: customer._id,
    customerNumber: customer.customerId || customer._id,
    mobile: customer.phoneNumber,
  };
}

export async function addAddress(param, payload) {
  const id = await resolveCustomerId(param);

  const customer = await apiFetch(`/customers/${id}`, {
    method: "PUT",
    body: {
      address: payload.addressLine || payload.address || "",
      doorNo: payload.doorNo || "",
      block: payload.block || "",
      apartmentName: payload.community || payload.apartmentName || "",
      area: payload.area || "",
      city: payload.city || "",
      pincode: payload.pincode || "",
      landmark: payload.landmark || "",
    },
  });

  return {
    id: customer._id,
    addressNumber: customer._id,
    customerId: customer._id,
    label: payload.addressLabel || "Primary address",
    addressLine: customer.address,
    doorNo: customer.doorNo,
    block: customer.block,
    community: customer.apartmentName,
    area: customer.area,
    city: customer.city,
    pincode: customer.pincode,
    landmark: customer.landmark,
    isDefault: true,
    status: customer.isActive ? "Active" : "Inactive",
  };
}

export async function getCustomer360(param) {
  const id = await resolveCustomerId(param);

  let customer;

  try {
    customer = await apiFetch(`/customers/${id}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }

  const [subscriptionsRes, bookingsRes, visitsRes, invoicesRes, paymentsRes] =
    await Promise.allSettled([
      apiFetch(`/subscriptions?customerReference=${id}`),
      apiFetch(`/bookings?customerId=${id}`),
      apiFetch(`/visits?customerReference=${id}`),
      apiFetch(`/invoices?customerReference=${id}`),
      apiFetch(`/service-payments?customerReference=${id}`),
    ]);

  const subscriptions =
    subscriptionsRes.status === "fulfilled" &&
    Array.isArray(subscriptionsRes.value)
      ? subscriptionsRes.value
      : [];

  const bookings =
    bookingsRes.status === "fulfilled" && Array.isArray(bookingsRes.value)
      ? bookingsRes.value
      : [];

  const visits =
    visitsRes.status === "fulfilled" && Array.isArray(visitsRes.value)
      ? visitsRes.value
      : [];

  const invoices =
    invoicesRes.status === "fulfilled" && Array.isArray(invoicesRes.value)
      ? invoicesRes.value
      : [];

  const payments =
    paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value)
      ? paymentsRes.value
      : [];

  const formattedCustomer = {
    ...customer,
    id: customer._id,
    customerNumber: customer.customerId || customer._id,
    mobile: customer.phoneNumber,
    status: customer.isActive ? "Active" : "Inactive",
  };

  const addresses = customer.address
    ? [
        {
          id: customer._id,
          addressNumber: customer._id,
          customerId: customer._id,
          label: "Primary address",
          addressLine: customer.address,
          doorNo: customer.doorNo || "",
          block: customer.block || "",
          area: customer.area || "",
          city: customer.city || "",
          pincode: customer.pincode || "",
          isDefault: true,
          status: customer.isActive ? "Active" : "Inactive",
        },
      ]
    : [];

  const formattedBookings = bookings.map((b) => ({
    ...b,
    id: b._id,
    bookingNumber: b.bookingId || b._id,
    type:
      b.bathroomCountReference?.bathroomCount != null
        ? `${b.bathroomCountReference.bathroomCount} Bathroom${b.bathroomCountReference.bathroomCount > 1 ? "s" : ""}`
        : b.bathroomCount || b.serviceType || "—",
    addressId: b.customerReference?._id || b.customerReference || customer._id,
    planName:
      b.subscriptionTypeReference?.subscriptionName ||
      b.subscriptionTypeReference?.name ||
      b.planName ||
      "—",
    startDate: b.startDateTime || b.scheduledDate,
    status: b.isCancelled
      ? "Cancelled"
      : b.isCompleted
        ? "Completed"
        : "Confirmed",
    total: b.amount,
  }));

  const visitsBySubscription = visits.reduce((acc, v) => {
    const subscriptionId = v.subscriptionReference?._id || v.subscriptionReference;

    if (!subscriptionId) return acc;

    if (!acc[subscriptionId]) acc[subscriptionId] = [];

    acc[subscriptionId].push({
      ...v,
      id: v._id,
      visitNumber: v.visitId || v._id,
      date: v.scheduledStartDateTime || v.scheduledDate,
      status: v.isCompleted
        ? "Completed"
        : v.isCancelled
          ? "Cancelled"
          : "Scheduled",
    });

    return acc;
  }, {});

  const formattedSubscriptions = subscriptions.map((s) => {
    const schedule = visitsBySubscription[s._id] || [];
    const totalServices = s.totalVisits || schedule.length || 0;
    const completedServices =
      s.completedVisits || schedule.filter((v) => v.isCompleted).length;
    const planName =
      s.subscriptionTypeReference?.subscriptionName ||
      s.subscriptionType?.subscriptionName ||
      s.planName ||
      "—";
    const frequencyName =
      s.serviceFrequencyReference?.frequencyName ||
      s.serviceFrequency?.frequencyName ||
      s.frequencyName ||
      "—";

    return {
      ...s,
      id: s._id,
      subscriptionNumber: s.subscriptionId || s._id,
      status: s.subscriptionStatus || "Active",
      planName,
      frequencyName,
      visits: schedule,
      currentPeriod: {
        ...(s.currentPeriod || {}),
        planName,
        frequencyName,
        totalServices,
        completedServices,
        endDate: s.endDate || s.currentPeriod?.endDate,
        visits: schedule,
      },
    };
  });

  const formattedVisits = visits.map((v) => ({
    ...v,
    id: v._id,
    visitNumber: v.visitId || v._id,
    date: v.scheduledStartDateTime || v.scheduledDate,
    status: v.isCompleted
      ? "Completed"
      : v.isCancelled
        ? "Cancelled"
        : "Scheduled",
  }));

  return {
    customer: formattedCustomer,
    addresses,
    bookings: formattedBookings,
    subscriptions: formattedSubscriptions,

    payments: payments.map((p) => ({
      ...p,
      id: p._id,
      paymentNumber: p._id,
      amount: p.totalAmount,
    })),

    invoices: invoices.map(normalizeInvoiceRecord),

    visits: formattedVisits,
    auditEvents: [],

    summary: {
      addressCount: addresses.length,
      totalBookings: bookings.length,
      activeSubscriptions: subscriptions.filter(
        (s) => s.subscriptionStatus === "Active" || s.isActive,
      ).length,
      visitsCompleted: visits.filter((v) => v.isCompleted).length,
      lifetimeCollected: payments.reduce(
        (sum, p) => sum + (p.totalAmount || 0),
        0,
      ),
      nextVisits: formattedVisits.filter(
        (v) => !v.isCompleted && !v.isCancelled,
      ),
    },
  };
}

export async function deactivateCustomer(param) {
  const id = await resolveCustomerId(param);

  const customer = await apiFetch(`/customers/${id}`, {
    method: "PUT",
    body: { isActive: false },
  });

  return {
    ...customer,
    id: customer._id,
    customerNumber: customer.customerId || customer._id,
    status: "Inactive",
  };
}
