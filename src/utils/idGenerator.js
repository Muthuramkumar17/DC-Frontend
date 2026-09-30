// Generates business-facing IDs in the formats used throughout the spec.
// Sequences are kept in-memory per prefix; in a real backend these would be
// DB sequences guarded by a unique constraint / transaction.
const sequences = {};

function nextSeq(key, width = 6) {
  sequences[key] = (sequences[key] || 0) + 1;
  return String(sequences[key]).padStart(width, '0');
}

function todayStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function financialYearLabel(date = new Date()) {
  // Indian FY: Apr(1) - Mar. April 2026 -> FY 2026-27.
  const y = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? y : y - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
}

export const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export function isMongoId(str) {
  return typeof str === "string" && MONGO_ID_REGEX.test(str);
}

export const generateId = {
  customer: () => `CUS-${nextSeq('customer')}`,
  address: () => `ADR-${nextSeq('address')}`,
  booking: (date = new Date()) => `BKG-${todayStamp(date)}-${nextSeq('booking')}`,
  payment: (date = new Date()) => `PAY-${todayStamp(date)}-${nextSeq('payment')}`,
  invoice: (date = new Date()) => `INV/${financialYearLabel(date)}/${nextSeq('invoice')}`,
  subscription: () => `SUB-${nextSeq('subscription')}`,
  period: () => `SPR-${nextSeq('period')}`,
  visit: (date = new Date()) => `SV-${todayStamp(date)}-${nextSeq('visit')}`,
};

