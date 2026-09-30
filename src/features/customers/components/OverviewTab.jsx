import { useState } from 'react';
import {
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
} from "@mui/material";

import { EmptyState } from "@/components/feedback/PageStates";
import EntityLink from "@/components/ui/EntityLink";
import Money from "@/components/ui/Money";
import StatusChip from "@/components/ui/StatusChip";
import AddressCard from './AddressCard';
import { formatDate } from '@/utils/format';
import { printInvoiceDocument } from '@/features/invoices/invoicePrintHelper';
import {
  CheckCircleOutlineIcon,
  CleaningServicesOutlinedIcon,
  EventNoteOutlinedIcon,
  ExpandLessIcon,
  ExpandMoreIcon,
  PlaceOutlinedIcon,
  ReceiptLongOutlinedIcon,
} from '@/theme/icons';

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        minHeight: 112,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Typography variant="body3" color="text.secondary" noWrap>
        {label}
      </Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Box
          sx={{
            width: 28,
            height: 28,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 1,
            color: 'primary.main',
            bgcolor: 'primary.light',
          }}
        >
          <Icon sx={{ fontSize: 17 }} />
        </Box>
      </Stack>
    </Paper>
  );
}

export default function OverviewTab({ data, onCreateBooking }) {
  const { summary, addresses, subscriptions, bookings, payments, invoices } = data;
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const [expandedGroups, setExpandedGroups] = useState({});

  const groupedNextVisits = (subscriptions || [])
    .map((subscription, index) => {
      const upcomingVisits = (subscription.visits || [])
        .filter((visit) => !visit.isCompleted && !visit.isCancelled)
        .sort(
          (a, b) =>
            new Date(a.date || a.scheduledStartDateTime) -
            new Date(b.date || b.scheduledStartDateTime),
        );

      return {
        id: subscription.id || subscription.subscriptionNumber || `subscription-${index}`,
        label: `Subscription ${index + 1}`,
        planName: subscription.planName || subscription.currentPeriod?.planName || 'Subscription',
        visits: upcomingVisits,
      };
    })
    .filter((group) => group.visits.length > 0);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <SummaryCard label="Addresses" value={summary.addressCount} icon={PlaceOutlinedIcon} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <SummaryCard label="Total Bookings" value={summary.totalBookings} icon={EventNoteOutlinedIcon} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <SummaryCard label="Active Plans" value={summary.activeSubscriptions} icon={CleaningServicesOutlinedIcon} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <SummaryCard label="Visits Done" value={summary.visitsCompleted} icon={CheckCircleOutlineIcon} />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Upcoming Visits
            </Typography>
            {groupedNextVisits.length === 0 ? (
              <EmptyState title="No upcoming visits scheduled" description="Next visits will appear here once bookings or subscriptions are created." />
            ) : (
              <Stack spacing={2}>
                {groupedNextVisits.map((group) => {
                  const isExpanded = !!expandedGroups[group.id];
                  const displayedVisits = isExpanded ? group.visits : group.visits.slice(0, 1);

                  return (
                    <Paper key={group.id} variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: 'background.default' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {group.label}
                          </Typography>
                          <Chip label={group.planName} size="small" variant="outlined" />
                        </Stack>

                        {group.visits.length > 1 && (
                          <IconButton size="small" onClick={() => toggleGroup(group.id)}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        )}
                      </Stack>

                      <Stack spacing={1}>
                        {displayedVisits.map((visit) => (
                          <Stack key={visit.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formatDate(visit.date || visit.scheduledStartDateTime)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {visit.slotLabel || 'Time slot'}
                              </Typography>
                            </Box>
                            <StatusChip status={visit.status || 'Scheduled'} />
                          </Stack>
                        ))}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Recent Payments & Invoices
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Payments ({payments.length})
                </Typography>
                <Stack spacing={1}>
                  {payments.slice(0, 3).map((p) => (
                    <Stack key={p.id} spacing={1} sx={{ p: 1.5, minHeight: 84, justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <EntityLink type="Payment" id={p.paymentNumber} label={p.paymentNumber} />
                      <Box sx={{ alignSelf: 'flex-start' }}>
                        <Money value={p.amount} />
                      </Box>
                    </Stack>
                  ))}
                  {payments.length === 0 && <Typography variant="body2" color="text.secondary">No payments yet</Typography>}
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Invoices ({invoices.length})
                </Typography>
                <Stack spacing={1}>
                  {invoices.slice(0, 3).map((inv) => (
                    <Stack key={inv.id} spacing={1} sx={{ p: 1.5, minHeight: 84, justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                        {inv.invoiceNumber}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                        <Money value={inv.amount} />
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<ReceiptLongOutlinedIcon />}
                          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                          onClick={() => printInvoiceDocument({
                            invoice: {
                              ...inv,
                              createdDate: inv.createdDate || inv.createdAt,
                            },
                            customer: inv.customer || data.customer,
                            booking: inv.booking,
                          })}
                        >
                          Download
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
                  {invoices.length === 0 && <Typography variant="body2" color="text.secondary">No invoices yet</Typography>}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </Grid>

      <Grid item xs={12} md={4}>
        <Stack spacing={3}>
          {defaultAddress && (
            <Stack spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Primary Service Address
              </Typography>
              <AddressCard address={defaultAddress} />
            </Stack>
          )}

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Lifetime Value
            </Typography>
            <Money value={summary.lifetimeCollected} sx={{ typography: 'h4', fontWeight: 600, color: 'primary.main' }} />
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}
