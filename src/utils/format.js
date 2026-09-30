import dayjs from 'dayjs';

export function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value, fmt = 'DD MMM YYYY') {
  if (!value) return '—';
  return dayjs(value).format(fmt);
}

export function formatDateTime(value) {
  if (!value) return '—';
  return dayjs(value).format('DD MMM YYYY, hh:mm A');
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
