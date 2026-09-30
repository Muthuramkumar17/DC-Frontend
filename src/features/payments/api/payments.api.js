import dayjs from "dayjs";
import { apiFetch } from "@/services/http/client.js";
import { ApiError } from "@/services/http/errors.js";
import { isMongoId } from "@/utils/idGenerator.js";

export async function listPayments({
  search = "",
  status = "All",
  modeId = "All",
} = {}) {
  const payments = await apiFetch("/service-payments");

  if (!Array.isArray(payments)) return [];

  let rows = payments.map((payment) => {
    const customerObj =
      typeof payment.customerReference === "object"
        ? payment.customerReference
        : null;

    const bookingObj =
      typeof payment.bookingReference === "object"
        ? payment.bookingReference
        : null;

    const methodObj =
      typeof payment.paymentMethodReference === "object"
        ? payment.paymentMethodReference
        : null;

    let payStatus = "Completed";

    if (payment.isCancelled) {
      payStatus = "Reversed";
    } else if (payment.isPending) {
      payStatus = "Pending";
    } else if (payment.isCompleted) {
      payStatus = "Completed";
    }

    return {
      ...payment,
      id: payment._id,
      paymentNumber: payment.transactionId || payment._id,
      amount: payment.totalAmount || 0,
      paymentDate: payment.createdAt,

      customer: customerObj
        ? {
            ...customerObj,
            id: customerObj._id,
            customerNumber: customerObj.customerId || customerObj._id,
            mobile: customerObj.phoneNumber,
          }
        : null,

      booking: bookingObj
        ? {
            ...bookingObj,
            id: bookingObj._id,
            bookingNumber: bookingObj.bookingId || bookingObj._id,
          }
        : null,

      invoice: null,
      mode: methodObj?.paymentMethodName || "Online",
      modeId: methodObj?._id || "",
      status: payStatus,
    };
  });

  if (status !== "All") {
    rows = rows.filter((p) => p.status === status);
  }

  if (modeId !== "All") {
    rows = rows.filter((p) => p.modeId === modeId);
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();

    rows = rows.filter(
      (p) => (p.customer?.name || "").toLowerCase().includes(q),
    );
  }

  return rows.sort(
    (a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0),
  );
}

export async function getPayment(param) {
  if (isMongoId(param)) {
    try {
      const payment = await apiFetch(`/service-payments/${param}`);

      const customerObj =
        typeof payment.customerReference === "object"
          ? payment.customerReference
          : null;

      const bookingObj =
        typeof payment.bookingReference === "object"
          ? payment.bookingReference
          : null;

      const methodObj =
        typeof payment.paymentMethodReference === "object"
          ? payment.paymentMethodReference
          : null;

      let payStatus = "Completed";

      if (payment.isCancelled) {
        payStatus = "Reversed";
      } else if (payment.isPending) {
        payStatus = "Pending";
      }

      return {
        ...payment,
        id: payment._id,
        paymentNumber: payment.transactionId || payment._id,
        amount: payment.totalAmount || 0,
        paymentDate: payment.createdAt,

        customer: customerObj
          ? {
              ...customerObj,
              name: customerObj.name,
              mobile: customerObj.phoneNumber,
            }
          : null,

        booking: bookingObj
          ? {
              ...bookingObj,
              bookingNumber: bookingObj.bookingId || bookingObj._id,
            }
          : null,

        mode: methodObj?.paymentMethodName || "Online",
        status: payStatus,
      };
    } catch (e) {}
  }

  const payments = await listPayments();

  return (
    payments.find((p) => p.paymentNumber === param || p.id === param) || null
  );
}

export async function reversePayment(param, reason) {
  if (!reason)
    throw new ApiError("A reason is required to reverse a payment.", 400);

  const payments = await listPayments();

  const match = payments.find(
    (p) => p.paymentNumber === param || p.id === param,
  );

  const id = match ? match.id : param;

  const result = await apiFetch(`/service-payments/${id}`, {
    method: "PUT",
    body: {
      isPending: false,
      isCompleted: false,
      isCancelled: true,
      isActive: false,
    },
  });

  return {
    ...result,
    status: "Reversed",
  };
}

export async function dailyCollectionSummary(
  date = dayjs().format("YYYY-MM-DD"),
) {
  const [payments, methods, accounts] = await Promise.all([
    listPayments({}),
    apiFetch("/payment-methods"),
    apiFetch("/payment-accounts"),
  ]);

  const rows = payments.filter(
    (p) =>
      dayjs(p.paymentDate || p.createdAt).format("YYYY-MM-DD") === date &&
      p.status !== "Reversed",
  );

  const byMode = (methods || []).map((m) => {
    const modePayments = rows.filter(
      (r) => r.modeId === m._id || r.mode === m.paymentMethodName,
    );

    return {
      mode: {
        id: m._id,
        name: m.paymentMethodName,
      },
      total: modePayments.reduce((s, r) => s + (r.amount || 0), 0),
      count: modePayments.length,
    };
  });

  return {
    date,
    totalCollected: rows.reduce((s, r) => s + (r.amount || 0), 0),
    totalCount: rows.length,
    byMode,
    receiverAccounts: (accounts || []).map((a) => ({
      id: a._id,
      name: a.accountName,
    })),
  };
}

export async function recordPayment(payload) {
  const result = await apiFetch("/service-payments", {
    method: "POST",
    body: payload,
  });
  return result.payment || result;
}

export async function fetchPaymentMethods() {
  return apiFetch("/payment-methods").catch(() => []);
}

export { dailyCollectionSummary as getDailyCollection };

