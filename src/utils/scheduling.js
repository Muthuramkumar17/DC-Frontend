import dayjs from 'dayjs';

const DAY_START_MIN = 8 * 60;
const DAY_END_MIN = 19 * 60 + 30;
const DEFAULT_DURATION_BY_BATHROOMS = { 1: 30, 2: 45, 3: 60, 4: 75 };

export function pad2(value) {
  return String(value).padStart(2, '0');
}

export function toDateStr(value) {
  return dayjs(value).format('YYYY-MM-DD');
}

export function timeToMin(value) {
  if (typeof value === 'number') return value;
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

export function minToTime(value) {
  return `${pad2(Math.floor(value / 60))}:${pad2(value % 60)}`;
}

export function timeFromSlotId(slotId) {
  const match = String(slotId || '').match(/-(\d+)$/);
  if (!match) return '';
  const minutes = Number(match[1]);
  if (minutes < 0 || minutes > 1439) return '';
  return minToTime(minutes);
}

export function occupiedWindow(booking, durationByBathrooms = DEFAULT_DURATION_BY_BATHROOMS, bufferMinutes = 0) {
  const start = timeToMin(booking.startTime);
  const duration = Number(
    booking.duration
    || booking.durationMinutes
    || durationByBathrooms?.[booking.bathroomCount]
    || 30,
  );
  return [start, start + duration + Number(booking.bufferMinutes || bufferMinutes || 0)];
}

export function hasConflict(
  dateStr,
  startTime,
  bathroomCount,
  bookings,
  excludeId,
  durationByBathrooms = DEFAULT_DURATION_BY_BATHROOMS,
  enforceWorkingHours = true,
  bufferMinutes = 0,
  dayStartMin = DAY_START_MIN,
  dayEndMin = DAY_END_MIN,
) {
  const duration = Number(durationByBathrooms?.[bathroomCount] || 30);
  const start = timeToMin(startTime);
  const end = start + duration + bufferMinutes;

  if (
    enforceWorkingHours
    && (start < dayStartMin || start + duration + bufferMinutes > dayEndMin)
  ) {
    return true;
  }

  return bookings.some((booking) => {
    if (booking.id === excludeId) return false;
    if (booking.date !== dateStr) return false;
    if (String(booking.status || '').toLowerCase() === 'cancelled') return false;
    if (!booking.startTime) return false;

    const [existingStart, existingEnd] = occupiedWindow(
      booking,
      durationByBathrooms,
      bufferMinutes,
    );

    return start < existingEnd && existingStart < end;
  });
}

export function findAvailableStarts(
  date,
  bathroomCount,
  bookings,
  excludedId,
  durationByBathrooms = DEFAULT_DURATION_BY_BATHROOMS,
  enforceWorkingHours = true,
  bufferMinutes = 0,
) {
  const starts = [];
  const duration = Number(durationByBathrooms[bathroomCount] || DEFAULT_DURATION_BY_BATHROOMS[1]);
  for (let minutes = DAY_START_MIN; minutes + duration <= DAY_END_MIN; minutes += 30) {
    const candidate = minToTime(minutes);
    if (
      !hasConflict(
        date,
        candidate,
        bathroomCount,
        bookings,
        excludedId,
        durationByBathrooms,
        enforceWorkingHours,
        bufferMinutes,
      )
    ) starts.push(candidate);
  }
  return starts;
}

export function fmtDateHuman(value) {
  return value ? dayjs(value).format('DD MMM YYYY') : '—';
}

export function fmtMoney(value) {
  return Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtTime12(value) {
  if (!value) return '—';
  const timeOnly = String(value).match(/^(\d{1,2}):(\d{2})$/);
  if (timeOnly) {
    const hours = Number(timeOnly[1]);
    const minutes = timeOnly[2];
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${pad2(displayHours)}:${minutes} ${suffix}`;
  }
  return dayjs(value).isValid() ? dayjs(value).format('hh:mm A') : '—';
}

export function formatCustomerAddress(customer) {
  return [customer?.address, customer?.area, customer?.city, customer?.pincode].filter(Boolean).join(', ') || '—';
}
