import dayjs from "dayjs";
import { apiFetch } from "@/services/http/client.js";
import { ApiError } from "@/services/http/errors.js";
import { isMongoId } from "@/utils/idGenerator.js";

export async function resolveVisitId(param) {
  if (!param) return null;
  if (isMongoId(param)) return param;

  const visits = await apiFetch("/visits");
  const match = Array.isArray(visits)
    ? visits.find((v) => v.visitId === param || v._id === param)
    : null;

  return match ? match._id : param;
}

export function areaWorkloadToday(visits) {
  const areaNames = Array.from(
    new Set(
      (visits || [])
        .map((v) => v.areaId || v.address?.area || "Unknown")
        .filter(Boolean),
    ),
  );

  return areaNames
    .map((areaName) => {
      const areaVisits = visits.filter(
        (v) => (v.areaId || v.address?.area) === areaName,
      );

      return {
        area: {
          id: areaName,
          name: areaName,
        },
        total: areaVisits.length,
        completed: areaVisits.filter((v) => v.status === "Completed").length,
      };
    })
    .filter((row) => row.total > 0);
}

export async function listVisits({
  search = "",
  status = "All",
  area = "All",
  date,
  dateFrom,
  dateTo,
} = {}) {
  const visits = await apiFetch("/visits");

  if (!Array.isArray(visits)) return [];

  let rows = visits.map((visit) => {
    const customerObj =
      typeof visit.customerReference === "object"
        ? visit.customerReference
        : null;

    const bookingObj =
      typeof visit.bookingReference === "object"
        ? visit.bookingReference
        : null;

    const slotObj =
      typeof visit.timeSlotReference === "object"
        ? visit.timeSlotReference
        : null;

    const scheduledDate = visit.scheduledStartDateTime
      ? dayjs(visit.scheduledStartDateTime).format("YYYY-MM-DD")
      : "";

    const scheduledStart = visit.scheduledStartDateTime
      ? dayjs(visit.scheduledStartDateTime)
      : null;

    const scheduledEnd = visit.scheduledEndDateTime
      ? dayjs(visit.scheduledEndDateTime)
      : null;

    const bathroomCount =
      visit.bathroomCount ??
      visit.bathrooms ??
      visit.bookingReference?.bathroomCountReference?.bathroomCount ??
      bookingObj?.bathroomCountReference?.bathroomCount ??
      bookingObj?.bathrooms ??
      bookingObj?.bathroomCount ??
      1;

    return {
      ...visit,
      id: visit._id,
      visitNumber: visit.visitId || visit._id,
      date: scheduledDate,
      scheduledDate,
      status: visit.isCancelled
        ? "Cancelled"
        : visit.isCompleted
          ? "Completed"
          : "Scheduled",

      customer: customerObj
        ? {
            ...customerObj,
            id: customerObj._id,
            customerNumber: customerObj.customerId || customerObj._id,
            mobile: customerObj.phoneNumber,
            area: customerObj.area || "",
          }
        : null,

      booking: bookingObj
        ? {
            ...bookingObj,
            id: bookingObj._id,
            bookingNumber: bookingObj.bookingId || bookingObj._id,
            bathroomCount,
            bathrooms: bathroomCount,
          }
        : null,

      slotId: slotObj?._id || "",

      slotLabel: slotObj?.startTime
        ? `${slotObj.startTime} – ${slotObj.endTime}`
        : "",

      serviceStartTime: scheduledStart ? scheduledStart.format("h:mm A") : "",
      serviceEndTime: scheduledEnd ? scheduledEnd.format("h:mm A") : "",

      bathroomCount,
      areaId: customerObj?.area || "",

      address: customerObj
        ? {
            addressLine: customerObj.address,
            doorNo: customerObj.doorNo,
            block: customerObj.block,
            area: customerObj.area,
          }
        : null,
    };
  });

  if (status !== "All") {
    rows = rows.filter((v) => v.status === status);
  }

  if (area !== "All") {
    rows = rows.filter((v) => v.areaId === area);
  }

  if (date) {
    rows = rows.filter((v) => v.date === date);
  }

  if (dateFrom) {
    rows = rows.filter((v) => v.date >= dateFrom);
  }

  if (dateTo) {
    rows = rows.filter((v) => v.date <= dateTo);
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();

    rows = rows.filter(
      (v) => (v.customer?.name || "").toLowerCase().includes(q),
    );
  }

  return rows.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
}

export async function getVisit(param) {
  const id = await resolveVisitId(param);

  const visit = await apiFetch(`/visits/${id}`);

  const customerObj =
    typeof visit.customerReference === "object"
      ? visit.customerReference
      : null;

  const bookingObj =
    typeof visit.bookingReference === "object" ? visit.bookingReference : null;

  const slotObj =
    typeof visit.timeSlotReference === "object"
      ? visit.timeSlotReference
      : null;

  const scheduledDate = visit.scheduledStartDateTime
    ? dayjs(visit.scheduledStartDateTime).format("YYYY-MM-DD")
    : "";

  return {
    ...visit,
    id: visit._id,
    visitNumber: visit.visitId || visit._id,
    date: scheduledDate,
    scheduledDate,
    status: visit.isCancelled
      ? "Cancelled"
      : visit.isCompleted
        ? "Completed"
        : "Scheduled",

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

    slotId: slotObj?._id || "",

    slotLabel: slotObj?.startTime
      ? `${slotObj.startTime} – ${slotObj.endTime}`
      : "",
  };
}

export async function updateVisit(id, changes) {
  const mongoId = await resolveVisitId(id);

  let scheduledStartDateTime = null;
  if (changes.isCompleted) {
    try {
      const existingVisit = await getVisit(mongoId);
      scheduledStartDateTime = existingVisit?.scheduledStartDateTime || null;
    } catch {
      scheduledStartDateTime = null;
    }
  }

  const payload = {};

  const candidateStart =
    changes.actualStartDateTime !== undefined
      ? new Date(changes.actualStartDateTime)
      : scheduledStartDateTime
        ? new Date(scheduledStartDateTime)
        : null;

  const candidateEnd =
    changes.actualEndDateTime !== undefined
      ? new Date(changes.actualEndDateTime)
      : null;

  if (candidateStart && !Number.isNaN(candidateStart.getTime())) {
    payload.actualStartDateTime = candidateStart.toISOString();
  }

  if (candidateEnd && !Number.isNaN(candidateEnd.getTime())) {
    let end = candidateEnd;
    const startTime = candidateStart && !Number.isNaN(candidateStart.getTime())
      ? candidateStart.getTime()
      : end.getTime();

    if (end.getTime() <= startTime) {
      end = new Date(startTime + 60 * 1000);
    }

    payload.actualEndDateTime = end.toISOString();
  }

  if (changes.remarks !== undefined || changes.completionRemarks !== undefined) {
    payload.remarks = changes.remarks ?? changes.completionRemarks ?? "";
  }

  if (changes.isCompleted !== undefined) {
    payload.isCompleted = changes.isCompleted;
  }

  if (changes.isPending !== undefined) {
    payload.isPending = changes.isPending;
  }

  if (changes.isCancelled !== undefined) {
    payload.isCancelled = changes.isCancelled;
  }

  if (changes.isActive !== undefined) {
    payload.isActive = changes.isActive;
  }

  if (payload.isCompleted && !payload.actualStartDateTime) {
    payload.actualStartDateTime = new Date().toISOString();
  }

  if (payload.isCompleted && !payload.actualEndDateTime) {
    const startTime = new Date(payload.actualStartDateTime).getTime();
    payload.actualEndDateTime = new Date(Math.max(startTime + 60 * 1000, Date.now())).toISOString();
  }

  if (
    payload.isCompleted &&
    new Date(payload.actualEndDateTime).getTime() <= new Date(payload.actualStartDateTime).getTime()
  ) {
    const startTime = new Date(payload.actualStartDateTime).getTime();
    payload.actualEndDateTime = new Date(startTime + 60 * 1000).toISOString();
  }

  const result = await apiFetch(`/visits/${mongoId}`, {
    method: "PATCH",
    body: payload,
  });

  return result.visit || result;
}

export async function completeVisit(param, { completedOn, remarks = "" } = {}) {
  const mongoId = await resolveVisitId(param);

  const existingVisit = await getVisit(mongoId).catch(() => null);
  const scheduledStart = existingVisit?.scheduledStartDateTime
    ? new Date(existingVisit.scheduledStartDateTime)
    : new Date();

  const completionTime = completedOn ? new Date(completedOn) : new Date();
  const safeEndTime = new Date(
    Math.max(completionTime.getTime(), scheduledStart.getTime() + 60 * 1000),
  );

  const payload = {
    remarks,
    isPending: false,
    isCompleted: true,
    isCancelled: false,
    isActive: true,
    actualStartDateTime: scheduledStart.toISOString(),
    actualEndDateTime: safeEndTime.toISOString(),
  };

  return updateVisit(mongoId, payload);
}

export async function batchCompleteVisits(visitNumbers = [], options = {}) {
  const results = [];

  for (const num of visitNumbers) {
    results.push(await completeVisit(num, options));
  }

  return results;
}

export async function rescheduleVisit(
  param,
  { newDate, newSlotId, reason, remarks = "" } = {},
) {
  throw new ApiError(
    "Visit rescheduling is not currently supported by the backend server.",
    400,
  );
}

export async function cancelVisit(param, reason) {
  const id = await resolveVisitId(param);
  return updateVisit(id, {
    isCancelled: true,
    isActive: false,
    remarks: reason || "",
  });
}

export { getVisit as getVisitByNumber };
