/**
 * BookingDetailPage.jsx
 * -----------------------------------------------------------------------
 * Detailed view of a single booking including customer details, service
 * specifications, linked entities (payment, invoice, visits), and bill summary.
 * -----------------------------------------------------------------------
 */

import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

import PageHeader from '@/components/layout/PageHeader';
import StatusChip from '@/components/ui/StatusChip';
import EntityLink from '@/components/ui/EntityLink';
import { LoadingSkeleton, ErrorState } from '@/components/feedback/PageStates';
import { useBookingDetail } from '../hooks/useBookings';
import { formatDate, formatDateTime, formatMoney } from '@/utils/format';
import { printInvoiceDocument } from '@/features/invoices/invoicePrintHelper';
import { ReceiptLongOutlinedIcon } from '@/theme/icons';

/** Consistent label/value pair row used inside detail cards */
function DetailRow({ label, value, mono }) {
  return (
    <Stack
      direction="row"
      sx={{
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          minWidth: 130,
          color: 'text.secondary',
          fontWeight: 500,
          pt: 0.15,
          flexShrink: 0,
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          fontFamily: mono ? '"JetBrains Mono", monospace' : 'inherit',
          fontSize: mono ? '0.8rem' : '0.875rem',
          wordBreak: 'break-all',
        }}
      >
        {value || '—'}
      </Typography>
    </Stack>
  );
}

/** Section heading within a card */
function SectionLabel({ children }) {
  return (
    <Typography
      variant="overline"
      sx={{
        display: 'block',
        color: 'primary.main',
        fontWeight: 700,
        fontSize: '0.7rem',
        letterSpacing: '0.08em',
        mb: 0.5,
        mt: 0.5,
      }}
    >
      {children}
    </Typography>
  );
}

/** Bill row used in the summary card */
function BillRow({ label, value, strong }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
      <Typography
        variant="body2"
        sx={{ color: strong ? 'text.primary' : 'text.secondary', fontWeight: strong ? 700 : 400 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: strong ? 700 : 500,
          color: strong ? 'primary.main' : 'text.primary',
          fontSize: strong ? '1rem' : '0.875rem',
        }}
      >
        {formatMoney(value)}
      </Typography>
    </Stack>
  );
}

/** Linked entity row in Related Records */
function RelatedRow({ label, children }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={2}
      sx={{
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          minWidth: 110,
          color: 'text.secondary',
          fontWeight: 500,
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      {children}
    </Stack>
  );
}

/**
 * Booking detail view component.
 */
export default function BookingDetailPage() {
  const { bookingNumber } = useParams();

  const { data: booking, isLoading, isError, error, refetch } = useBookingDetail(bookingNumber);

  const breadcrumbs = [
    { label: 'Bookings', to: '/bookings' },
    { label: bookingNumber },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Loading…" breadcrumbs={breadcrumbs} />
        <LoadingSkeleton rows={8} />
      </>
    );
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (!booking) {
    return <ErrorState message={`Booking ${bookingNumber} was not found.`} />;
  }

  const fullAddress = [
    booking.address?.doorNo,
    booking.address?.block,
    booking.address?.addressLine,
    booking.address?.landmark,
    booking.address?.area,
    booking.address?.city,
    booking.address?.pincode,
  ].filter(Boolean).join(', ');

  return (
    <>
      <PageHeader
        isMonoTitle
        breadcrumbs={[
          { label: 'Bookings', to: '/bookings' },
          { label: booking.bookingNumber },
        ]}
      />

      <Grid container spacing={3}>
        {/* ─── Left Column ─────────────────────────────────────────── */}
        <Grid item xs={12} md={8}>

          {/* Customer & Service Card */}
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 1 }}
          >
            <SectionLabel>Customer &amp; Address</SectionLabel>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
              <EntityLink type="Customer" id={booking.customer?.customerNumber} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {booking.customer?.name}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {fullAddress || booking.address?.label || '—'}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <SectionLabel>Service Details</SectionLabel>
            <Box>
              <DetailRow label="Offering" value={booking.offeringName || booking.offeringId || 'Toilet Cleaning'} />
              <DetailRow label="Bathrooms" value={booking.bathrooms} />
              <DetailRow label="Frequency" value={booking.frequencyName} />
              <DetailRow label="Plan" value={booking.planName} />
              <DetailRow label="Start Date" value={formatDate(booking.startDate)} />
              <DetailRow label="Slot" value={booking.slotLabel || '—'} />
            </Box>
          </Paper>

          {/* Related Records Card */}
          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 1 }}>
            <SectionLabel>Related Records</SectionLabel>
            <Box>
              <RelatedRow label="Invoice">
                {booking.invoice
                  ? (
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<ReceiptLongOutlinedIcon />}
                      onClick={() => printInvoiceDocument({
                        invoice: booking.invoice,
                        customer: booking.invoice.customer || booking.customer,
                        booking: booking.invoice.booking || booking,
                      })}
                    >
                      Download invoice
                    </Button>
                  )
                  : <Typography variant="body2" color="text.secondary">Not generated yet</Typography>}
              </RelatedRow>
              <RelatedRow label="Visits">
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                  {booking.invoice?.booking?.totalVisits ?? booking.visits?.length ?? 0} total visits
                </Typography>
              </RelatedRow>
            </Box>
          </Paper>
        </Grid>

        {/* ─── Right Column ────────────────────────────────────────── */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
            <SectionLabel>Bill Summary</SectionLabel>

            <Box sx={{ mt: 1 }}>
              <BillRow label="Service Charges" value={booking.serviceCharges} />
              {booking.discount > 0 && (
                <BillRow label="Authorised Discount" value={-booking.discount} />
              )}
              <BillRow label="Taxable Amount" value={booking.taxableAmount} />
              {booking.taxes?.map((t) => (
                <BillRow
                  key={t.id}
                  label={`${t.label} (${(t.rate * 100).toFixed(0)}%)`}
                  value={t.amount}
                />
              ))}
              <Divider sx={{ my: 1 }} />
              <BillRow label="Total Amount" value={booking.total} strong />
            </Box>

            <Box
              sx={{
                mt: 2.5,
                p: 1.5,
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.8 }}>
                Created&nbsp;
                <strong>{formatDateTime(booking.createdOn)}</strong>
              </Typography>
              {booking.confirmedOn && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.8 }}>
                  Confirmed&nbsp;
                  <strong>{formatDateTime(booking.confirmedOn)}</strong>
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
