import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EntityLink from '@/components/ui/EntityLink';
import StatusChip from '@/components/ui/StatusChip';
import { formatDate } from '@/utils/format';

export default function SubscriptionsTab({ subscriptions, addresses }) {
  const navigate = useNavigate();
  const [expandedSubscriptions, setExpandedSubscriptions] = useState({});

  if (subscriptions.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          No subscriptions yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Subscriptions are created automatically once a booking is confirmed.
        </Typography>
      </Paper>
    );
  }

  const grouped = addresses.length
    ? addresses
        .map((addr) => ({
          addr,
          subs: subscriptions.filter((s) => {
            const candidates = [
              s.addressId,
              s.address?.id,
              s.address?.addressNumber,
              s.addressNumber,
              s.customerAddressId,
              s.customerAddress?.id,
            ];

            return candidates.some(
              (candidate) =>
                String(candidate) === String(addr.id) ||
                String(candidate) === String(addr.addressNumber) ||
                String(candidate) === String(addr.customerId),
            );
          }),
        }))
        .filter((g) => g.subs.length > 0)
    : [{ addr: { id: 'all', label: 'All addresses', area: '' }, subs: subscriptions }];

  const safeGrouped = grouped.length > 0 ? grouped : [{ addr: { id: 'all', label: 'All addresses', area: '' }, subs: subscriptions }];

  const toggleSubscription = (subscriptionKey) => {
    setExpandedSubscriptions((prev) => ({
      ...prev,
      [subscriptionKey]: !prev[subscriptionKey],
    }));
  };

  return (
    <Stack spacing={3}>
      {safeGrouped.map(({ addr, subs }) => (
        <Box key={addr.id}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
            {addr.label} · {addr.area || ''}
          </Typography>

          <Grid container spacing={2}>
            {subs.map((s, index) => {
              const period = s.currentPeriod || {};
              const schedule = Array.isArray(s.visits)
                ? s.visits
                : Array.isArray(period.visits)
                  ? period.visits
                  : [];
              const planName = s.planName || period.planName || s.subscriptionTypeName || '—';
              const frequencyName = s.frequencyName || period.frequencyName || s.serviceFrequencyName || '—';
              const totalServices = s.totalVisits || period.totalServices || schedule.length || 0;
              const completedServices =
                s.completedVisits ||
                period.completedServices ||
                schedule.filter((v) => v.status === 'Completed').length;
              const pct = totalServices ? Math.round((completedServices / totalServices) * 100) : 0;
              const subscriptionKey = s.id || s.subscriptionNumber || `${addr.id}-${index}`;
              const isExpanded = !!expandedSubscriptions[subscriptionKey];

              return (
                <Grid item xs={12} key={subscriptionKey}>
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <EntityLink type="Subscription" id={s.subscriptionNumber} />
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <StatusChip status={s.status} />
                        <IconButton
                          size="small"
                          onClick={() => toggleSubscription(subscriptionKey)}
                          aria-label={isExpanded ? 'Collapse subscription' : 'Expand subscription'}
                          sx={{ border: '1px solid', borderColor: 'divider' }}
                        >
                          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Stack spacing={1} sx={{ mt: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong style={{ color: '#1f2937' }}>Plan:</strong> {planName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong style={{ color: '#1f2937' }}>Frequency:</strong> {frequencyName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong style={{ color: '#1f2937' }}>Duration:</strong>{' '}
                        {s.startDate ? formatDate(s.startDate) : formatDate(period.startDate || new Date())} -{' '}
                        {s.endDate ? formatDate(s.endDate) : formatDate(period.endDate || new Date())}
                      </Typography>
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                        <Typography variant="caption" color="text.secondary">
                          {completedServices}/{totalServices} services completed
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pct}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ height: 7, borderRadius: 999, bgcolor: 'rgba(15, 92, 87, 0.08)' }}
                      />
                    </Box>

                    {isExpanded && (
                      <Box sx={{ mt: 2.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                          Visiting schedule
                        </Typography>

                        {schedule.length > 0 ? (
                          <Stack spacing={1}>
                            {schedule.map((visit, visitIndex) => (
                              <Box
                                key={visit.id || `${s.id}-visit-${visitIndex}`}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 1,
                                  p: 1,
                                  borderRadius: 2,
                                  bgcolor: 'rgba(15, 92, 87, 0.03)',
                                }}
                              >
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {visitIndex + 1}. {formatDate(visit.date || visit.scheduledStartDateTime || visit.scheduledDate)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {visit.slotLabel || visit.timeSlotName || visit.slotName || 'Time slot'}
                                  </Typography>
                                </Box>
                                <StatusChip status={visit.status || 'Scheduled'} size="small" />
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No visits scheduled yet.
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button size="small" onClick={() => navigate(`/subscriptions/${s.subscriptionNumber}`)}>
                        View
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Stack>
  );
}
