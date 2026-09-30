/**
 * SubscriptionDetailPage.jsx
 * -----------------------------------------------------------------------
 * Detailed view of an active or past subscription, displaying current period
 * progress, historical renewal periods, and scheduled service visits.
 * -----------------------------------------------------------------------
 */

import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { ExpandMoreIcon } from '@/theme/icons';

import PageHeader from '@/components/layout/PageHeader';
import StatusChip from '@/components/ui/StatusChip';
import EntityLink from '@/components/ui/EntityLink';
import { LoadingSkeleton, ErrorState } from '@/components/feedback/PageStates';
import { useSubscriptionDetail } from '../hooks/useSubscriptions';
import { formatDate } from '@/utils/format';
import SubscriptionReceiptPrint from './SubscriptionReceiptPrint';

/**
 * Subscription detail view page component.
 */
export default function SubscriptionDetailPage() {
  const { subscriptionNumber } = useParams();

  const { data: subscription, isLoading, isError, error, refetch } = useSubscriptionDetail(subscriptionNumber);

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
        <PageHeader
          title="Loading subscription…"
          breadcrumbs={[{ label: 'Subscriptions', path: '/subscriptions' }, { label: subscriptionNumber }]}
        />
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

  if (!subscription) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
        <ErrorState message={`Subscription ${subscriptionNumber} was not found.`} />
      </Box>
    );
  }

  const { customer, address, currentPeriod, periods } = subscription;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, sm: 3.5 } }}>
      <PageHeader
        isMonoTitle
        breadcrumbs={[{ label: 'Subscriptions', path: '/subscriptions' }, { label: subscription.subscriptionNumber }]}
        actions={null}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
              Customer & Address
            </Typography>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EntityLink type="Customer" id={customer?.customerNumber} />
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {customer?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer?.mobile}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {address?.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {address?.addressLine}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {address?.area ? `${address.area}, ` : ''}{address?.city} {address?.pincode}
              </Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Service Offering
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
              {subscription.offeringName || subscription.offeringId || 'Toilet Cleaning'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Renewal Status
            </Typography>
            <StatusChip status={subscription.renewalStatus} />
          </Paper>

          {currentPeriod && (
            <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
                Current Period
              </Typography>
              <Typography variant="body2" color="text.secondary">
              {currentPeriod.planName || '—'} ·{' '}
              {currentPeriod.frequencyName || '—'}
              </Typography>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary">
                  {currentPeriod.completedServices}/{currentPeriod.totalServices} services completed
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ends {formatDate(currentPeriod.endDate)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.round((currentPeriod.completedServices / currentPeriod.totalServices) * 100)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Paper>
          )}

          {/* Print receipt button – always visible below current period */}
          <SubscriptionReceiptPrint subscription={subscription} />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Subscription Periods
            </Typography>
            <Stack spacing={2}>
              {periods.map((period, idx) => (
                <Accordion key={period.id} defaultExpanded={idx === 0} variant="outlined" disableGutters sx={{ borderRadius: '12px !important', overflow: 'hidden' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                      <EntityLink type="Period" id={period.periodNumber} copyable={false} />
                      <Chip size="small" label={period.kind} variant="outlined" sx={{ borderRadius: 1 }} />
                      {String(period.status || '').toLowerCase() !== 'upcoming' && (
                        <StatusChip status={period.status} />
                      )}
                      <Stack sx={{ flex: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(period.startDate)} – {formatDate(period.endDate)}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 2.5 }}>
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Plan
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {period.planName || '—'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Frequency
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {period.frequencyName || '—'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Services
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {period.completedServices}/{period.totalServices}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                      Service Visits
                    </Typography>
                    <Table size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F3F7F6' }}>
                          <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {period.visits.map((v, visitIndex) => (
                          <TableRow key={v.id || v.visitNumber || `${period.id}-visit-${visitIndex}`} hover>
                            <TableCell>
                              {visitIndex + 1}
                            </TableCell>
                            <TableCell>{formatDate(v.date)}</TableCell>
                            <TableCell>
                              <StatusChip status={v.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

    </Box>
  );
}
