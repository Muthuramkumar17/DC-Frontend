/**
 * Extract and format time directly from a DB datetime string.
 *
 * The backend stores startDateTime/endDateTime as UTC ISO strings where the
 * HH:MM component already represents the *local* slot time (e.g.
 * "2026-09-27T09:45:00.000Z" means the slot is at 09:45 local time).
 * Using dayjs() would convert UTC→IST (+5:30) and show 03:15 PM instead.
 * We therefore read HH:MM straight out of the raw string.
 */
function fmtTime(value) {
  if (!value) return '';
  const s = String(value);
  // Match "T09:45" inside an ISO datetime
  const iso = s.match(/T(\d{2}):(\d{2})/);
  if (iso) {
    const h = parseInt(iso[1], 10);
    const m = iso[2];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }
  // Already "HH:mm" or "hh:mm AM/PM" — return as-is
  return s;
}

export function normalizeBookingRecord(booking) {
  const customerRef = booking.customerReference;

  const customerObj =
    typeof customerRef === "object" && customerRef ? customerRef : null;

  // ── Slot label: show actual SERVICE time only (no buffer).
  //   endDateTime in the DB = start + serviceDuration + bufferTime.
  //   We recompute the service-only end by adding durationMinutes to startDateTime.
  const bookedStart = booking.startDateTime;
  const durationMins =
    booking.serviceDurationReference?.durationMinutes ??
    booking.serviceDurationId?.durationMinutes ??
    null;

  // Derive service-end from start ISO + durationMins offset (no timezone conversion)
  let serviceEnd = null;
  if (bookedStart && durationMins != null) {
    const iso = String(bookedStart).match(/T(\d{2}):(\d{2})/);
    if (iso) {
      const totalMins = parseInt(iso[1], 10) * 60 + parseInt(iso[2], 10) + Number(durationMins);
      const endH = Math.floor(totalMins / 60) % 24;
      const endM = String(totalMins % 60).padStart(2, '0');
      const ampm = endH >= 12 ? 'PM' : 'AM';
      const h12 = endH % 12 || 12;
      serviceEnd = `${h12}:${endM} ${ampm}`;
    }
  }

  const slotLabel = bookedStart
    ? `${fmtTime(bookedStart)} – ${serviceEnd || fmtTime(booking.endDateTime)}`
    : booking.timeSlotReference?.startTime && booking.timeSlotReference?.endTime
      ? `${booking.timeSlotReference.startTime} – ${booking.timeSlotReference.endTime}`
      : 'Scheduled Slot';

  return {
    ...booking,
    id: booking._id,
    bookingNumber: booking.bookingId || booking._id,

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
          area: customerObj.area || "",
          city: customerObj.city || "",
          pincode: customerObj.pincode || "",
          doorNo: customerObj.doorNo || customerObj.doorNumber || "",
          block: customerObj.block || customerObj.blockNumber || "",
          landmark: customerObj.landmark || "",
          label: "Service address",
        }
      : null,

    bathrooms: booking.bathroomCountReference?.bathroomCount || 1,

    frequencyId:
      booking.serviceFrequencyReference?._id ||
      booking.serviceFrequencyReference,

    frequencyName: booking.serviceFrequencyReference?.frequencyName || "—",

    planName: booking.subscriptionTypeReference?.subscriptionName || "—",

    startDate: booking.scheduledDate || booking.startDateTime,

    slotLabel,

    total: booking.amount || 0,
    serviceCharges: booking.amount || 0,
    taxableAmount: booking.amount || 0,

    status: booking.isCancelled
      ? "Cancelled"
      : booking.isCompleted
        ? "Completed"
        : "Confirmed",

    createdOn: booking.createdAt,
  };
}
