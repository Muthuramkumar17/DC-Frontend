/**
 * VisitDetailPage.jsx
 * -----------------------------------------------------------------------
 * Detailed view of an individual cleaning visit, showing customer details,
 * address snapshot, scheduled slot, completion status, and reschedule history.
 * -----------------------------------------------------------------------
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { CheckCircleOutlineIcon, EventRepeatIcon } from '@/theme/icons';

import PageHeader from '@/components/layout/PageHeader';
import StatusChip from '@/components/ui/StatusChip';
import EntityLink from '@/components/ui/EntityLink';
import { LoadingSkeleton, ErrorState } from '@/components/feedback/PageStates';
import { useVisitDetail } from '../hooks/useVisits';
import { formatDate, formatDateTime } from '@/utils/format';
import CompleteVisitDialog from '@/features/visits/components/CompleteVisitDialog';

/**
 * Visit detail view component.
 */
export default function VisitDetailPage() {
  const { visitNumber } = useParams();
  const [completeOpen, setCompleteOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const { data: visit, isLoading, isError, error, refetch } = useVisitDetail(visitNumber);

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
        <PageHeader title="Loading visit…" breadcrumbs={[{ label: 'Visit Calendar', path: '/visits/calendar' }, { label: visitNumber }]} />
        <LoadingSkeleton rows={8} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
        <ErrorState message={error.message} onRetry={refetch} />
      </Box>
    );
  }

  if (!visit) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
        <ErrorState message={`Visit ${visitNumber} was not found.`} />
      </Box>
    );
  }

  const canComplete = visit.status !== 'Completed' && visit.status !== 'Cancelled';
  const canReschedule = visit.status !== 'Completed';
  const addressChanged = visit.address && visit.address.updatedOn && visit.address.updatedOn > visit.date;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, sm: 3.5 } }}>
      <PageHeader
        title={visit.visitNumber}
        isMonoTitle
        breadcrumbs={[{ label: 'Visit Calendar', path: '/visits/calendar' }, { label: visit.visitNumber }]}
        statusSlot={<StatusChip status={visit.status} />}
        actions={
          <Stack direction="row" spacing={1.5}>
            {canComplete && (
              <Button variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={() => setCompleteOpen(true)}>
                Complete
              </Button>
            )}
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
              Customer & Address
            </Typography>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EntityLink type="Customer" id={visit.customer?.customerNumber} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {visit.customer?.name}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {[visit.address?.doorNo, visit.address?.block, visit.address?.addressLine].filter(Boolean).join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {visit.areaId ? `${visit.areaId}, ` : ''}{visit.address?.city} {visit.address?.pincode}
              </Typography>
            </Stack>

            {addressChanged && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                The live address has been updated since this visit was scheduled. The details above are the snapshot at
                scheduling time.
              </Alert>
            )}

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
              Schedule
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Scheduled Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatDate(visit.date)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Slot
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {visit.slotLabel || visit.slotId || '—'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Sequence
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {visit.sequence}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Plan
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {visit.booking?.planName || visit.period?.planName || '—'}
                </Typography>
              </Grid>
            </Grid>

            {visit.status === 'Completed' && (
              <>
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
                  Completion Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Completed On
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDateTime(visit.completedOn)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Completed By
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {visit.completedBy}
                    </Typography>
                  </Grid>
                  {visit.completionRemarks && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Remarks
                      </Typography>
                      <Typography variant="body2">{visit.completionRemarks}</Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {visit.rescheduleHistory?.length > 0 && (
              <>
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
                  Reschedule History
                </Typography>
                <List dense disablePadding>
                  {visit.rescheduleHistory.map((h, i) => (
                    <ListItem key={i} disableGutters sx={{ py: 1 }}>
                      <ListItemText
                        primary={`${formatDate(h.fromDate)} → ${formatDate(h.toDate)}`}
                        secondary={`${h.reason}${h.remarks ? ` — ${h.remarks}` : ''} · ${formatDateTime(h.changedOn)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
              Related Records
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters sx={{ py: 1 }}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 110, color: 'text.secondary' }}>
                        Subscription
                      </Typography>
                      {visit.subscription ? <EntityLink type="Subscription" id={visit.subscription.subscriptionNumber} /> : '—'}
                    </Stack>
                  }
                />
              </ListItem>
              <ListItem disableGutters sx={{ py: 1 }}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 110, color: 'text.secondary' }}>
                        Period
                      </Typography>
                      {visit.period ? <EntityLink type="Period" id={visit.period.periodNumber} /> : '—'}
                    </Stack>
                  }
                />
              </ListItem>
              <ListItem disableGutters sx={{ py: 1 }}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 110, color: 'text.secondary' }}>
                        Source Booking
                      </Typography>
                      {visit.booking ? <EntityLink type="Booking" id={visit.booking.bookingNumber} /> : '—'}
                    </Stack>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <CompleteVisitDialog open={completeOpen} onClose={() => setCompleteOpen(false)} visitNumbers={[visit.visitNumber]} />
    </Box>
  );
}

