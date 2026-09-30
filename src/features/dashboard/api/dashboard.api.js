import dayjs from "dayjs";
import { listCustomers } from "@/features/customers/api/customers.api.js";
import { listBookings } from "@/features/bookings/api/bookings.api.js";
import { listSubscriptions } from "@/features/subscriptions/api/subscriptions.api.js";
import { listVisits } from "@/features/visits/api/visits.api.js";
import { listPayments } from "@/features/payments/api/payments.api.js";

export async function getDashboardSummary({
  date = dayjs().format("YYYY-MM-DD"),
} = {}) {
  const [customers, bookings, subscriptions, visits, payments] =
    await Promise.all([
      listCustomers(),
      listBookings(),
      listSubscriptions(),
      listVisits(),
      listPayments(),
    ]);

  const todayVisitsList = visits.filter((v) => v.date === date);

  const activeSubscriptionsList = subscriptions.filter(
    (s) => s.status === "Active" || s.isActive,
  );

  const lastServiceDateBySubscription = new Map();
  visits.forEach((visit) => {
    if (visit.isCancelled) return;

    const subscriptionReference = visit.subscriptionReference;
    const subscriptionId =
      typeof subscriptionReference === "object"
        ? subscriptionReference?._id ||
          subscriptionReference?.id ||
          subscriptionReference?.subscriptionId
        : subscriptionReference;
    const serviceDate = visit.date || visit.scheduledDate || visit.scheduledStartDateTime;
    if (!subscriptionId || !serviceDate || !dayjs(serviceDate).isValid()) return;

    const key = String(subscriptionId);
    const existingDate = lastServiceDateBySubscription.get(key);
    if (!existingDate || dayjs(serviceDate).isAfter(existingDate)) {
      lastServiceDateBySubscription.set(key, serviceDate);
    }
  });

  const renewalsList = subscriptions
    .filter((s) => s.endDate)
    .map((s) => ({
      id: s.id,
      customerName: s.customer?.name || "Customer",
      mobileNumber: s.customer?.mobile || "—",
      renewalDate: lastServiceDateBySubscription.get(String(s.id)) || s.endDate,
      subscriptionType: s.currentPeriod?.planName || "Subscription",
    }));

  const completedToday = todayVisitsList.filter(
    (v) => v.status === "Completed",
  ).length;

  const pendingToday = todayVisitsList.filter(
    (v) => v.status === "Scheduled",
  ).length;

  const bookingLookup = new Map();

  bookings.forEach((booking) => {
    const ids = [
      booking?._id,
      booking?.id,
      booking?.bookingId,
      booking?.bookingNumber,
    ].filter(Boolean);

    ids.forEach((id) => {
      bookingLookup.set(String(id), booking);
    });
  });

  const getServiceTimeLabel = (visit) => {
    const bookingId =
      (typeof visit?.bookingReference === "object"
        ? visit.bookingReference?._id ||
          visit.bookingReference?.id ||
          visit.bookingReference?.bookingId
        : visit?.bookingReference) ||
      visit?.bookingId ||
      visit?.booking?._id ||
      visit?.booking?.id ||
      visit?.booking?.bookingId;

    const relatedBooking = bookingId ? bookingLookup.get(String(bookingId)) : null;

    const visitStart =
      visit?.scheduledStartDateTime ||
      visit?.startDateTime ||
      relatedBooking?.startDateTime ||
      "";

    const visitEnd =
      visit?.scheduledEndDateTime ||
      visit?.endDateTime ||
      relatedBooking?.endDateTime ||
      "";

    if (visitStart && visitEnd) {
      return `${dayjs.utc(visitStart).format("h:mm A")} – ${dayjs.utc(visitEnd).format("h:mm A")}`;
    }

    if (visit?.serviceStartTime && visit?.serviceEndTime) {
      return `${visit.serviceStartTime} – ${visit.serviceEndTime}`;
    }

    return "—";
  };

  const withBookingTime = (visit) => {
    const serviceTimeLabel = getServiceTimeLabel(visit);
    const bookingId =
      (typeof visit?.bookingReference === "object"
        ? visit.bookingReference?._id ||
          visit.bookingReference?.id ||
          visit.bookingReference?.bookingId
        : visit?.bookingReference) ||
      visit?.bookingId ||
      visit?.booking?._id ||
      visit?.booking?.id ||
      visit?.booking?.bookingId;

    const relatedBooking = bookingId ? bookingLookup.get(String(bookingId)) : null;

    const bookingStart =
      visit?.scheduledStartDateTime ||
      visit?.startDateTime ||
      relatedBooking?.startDateTime ||
      visit?.serviceStartTime ||
      "";
    const bookingEnd =
      visit?.scheduledEndDateTime ||
      visit?.endDateTime ||
      relatedBooking?.endDateTime ||
      visit?.serviceEndTime ||
      "";

    const displayedServiceTime = serviceTimeLabel;

    const serviceStartTime = bookingStart ? dayjs.utc(bookingStart).format("h:mm A") : visit?.serviceStartTime || "";
    const serviceEndTime = bookingEnd ? dayjs.utc(bookingEnd).format("h:mm A") : visit?.serviceEndTime || "";

    return {
      ...visit,
      slotLabel: displayedServiceTime,
      serviceStartTime,
      serviceEndTime,
      customer:
        visit.customer ||
        (relatedBooking?.customerReference
          ? {
              ...relatedBooking.customerReference,
              id: relatedBooking.customerReference._id,
              customerNumber:
                relatedBooking.customerReference.customerId ||
                relatedBooking.customerReference._id,
              mobile: relatedBooking.customerReference.phoneNumber,
              area: relatedBooking.customerReference.area || "",
            }
          : null),
      address:
        visit.address ||
        (relatedBooking?.customerReference
          ? {
              addressLine: relatedBooking.customerReference.address,
              area: relatedBooking.customerReference.area || "",
              city: relatedBooking.customerReference.city || "",
              pincode: relatedBooking.customerReference.pincode || "",
            }
          : null),
    };
  };

  const enrichedVisits = visits.map(withBookingTime);

  return {
    kpis: {
      todayVisits: todayVisitsList.length,
      activeSubscriptions: activeSubscriptionsList.length,
      renewalsDueSoon: renewalsList.length,
      completedToday,
      pendingToday,
      totalCollected: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    },

    todayVisitsList: todayVisitsList.map((v) => {
      const enriched = withBookingTime(v);
      return {
        id: enriched.id,
        customerName: enriched.customer?.name || "—",
        mobileNumber: enriched.customer?.mobile || "—",
        visitDate: enriched.date,
        noOfService: 1,
        status: enriched.status,
        serviceStartTime: enriched.serviceStartTime,
        serviceEndTime: enriched.serviceEndTime,
        slotLabel: enriched.slotLabel,
        address: enriched.address,
      };
    }),

    activeSubscriptionsList: activeSubscriptionsList.map((s) => ({
      id: s.id,
      customerName: s.customer?.name || "—",
      phoneNumber: s.customer?.mobile || "—",
      subscriptionType: s.currentPeriod?.planName || "Subscription",
      status: s.status,
    })),

    renewalsList,
    upcomingVisits: enrichedVisits,
    monthVisits: enrichedVisits,
    exceptions: {
      staleDrafts: [],
    },
  };
}
