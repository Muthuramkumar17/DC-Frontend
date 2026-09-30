import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import { SearchIcon } from '@/theme/icons';

import PageHeader from '@/components/layout/PageHeader';
import StatusChip from '@/components/ui/StatusChip';
import { EmptyState, ErrorState } from '@/components/feedback/PageStates';
import { useSubscriptionsList } from '../hooks/useSubscriptions';
import { formatDate } from '@/utils/format';

/**
 * SubscriptionListPage Component
 * Tracks active recurring cleaning subscriptions, service counts, and renewal alerts.
 */
export default function SubscriptionListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  /** Query subscriptions data with live search and filter parameters */
  const { data, isLoading, isError, error, refetch } = useSubscriptionsList({ search, status });

  /** Define subscription DataGrid columns */
  const columns = useMemo(
    () => [
      {
        field: 'serialNumber',
        headerName: 'S.No',
        minWidth: 75,
        flex: 0.45,
        sortable: false,
        valueGetter: (v, row, column, apiRef) => apiRef.current.getRowIndexRelativeToVisibleRows(row.id) + 1,
      },
      {
        field: 'customer',
        headerName: 'Customer',
        flex: 1,
        minWidth: 160,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {p.row.customer ? p.row.customer.name : '—'}
          </Typography>
        ),
      },
      {
        field: 'address',
        headerName: 'Address / Area',
        minWidth: 145,
        flex: 1,
        valueGetter: (v, row) =>
          row.address?.area || row.address?.addressLine || '—',
      },
      {
        field: 'progress',
        headerName: 'Visits Delivered',
        minWidth: 150,
        flex: 1.1,
        sortable: false,
        renderCell: (params) => {
          const period = params.row.currentPeriod;
          if (!period) return '—';
          const pct = Math.round((period.completedServices / period.totalServices) * 100);
          return (
            <Box sx={{ width: '100%', py: 1 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {period.completedServices} / {period.totalServices} visits
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pct}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: '#EAF3F1',
                  '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 3 },
                }}
              />
            </Box>
          );
        },
      },
      {
        field: 'nextVisit',
        headerName: 'Next Visit',
        minWidth: 115,
        flex: 0.85,
        valueGetter: (v, row) => (row.nextVisit ? formatDate(row.nextVisit.date) : '—'),
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Subscriptions"
        subtitle="Manage active customer recurring packages, service fulfillment, and renewal alerts."
      />

      {/* Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Search customer name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ width: 160 }}>
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Data Table */}
      <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
        {isError ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : !isLoading && (data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No subscriptions found"
            description="Subscriptions are automatically initialized when commercial bookings are confirmed."
          />
        ) : (
          <DataGrid
            rows={data || []}
            columns={columns}
            getRowId={(row) => row._id || row.id || row.subscriptionId || row.subscriptionNumber}
            loading={isLoading}
            autoHeight
            disableRowSelectionOnClick
            onRowClick={(p) => navigate(`/subscriptions/${p.row.subscriptionNumber}`)}
            sx={{
              border: 'none',
              '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: '#F3F7F6' } },
              '& .MuiDataGrid-columnHeaders': { bgcolor: '#F3F7F6' },
            }}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50]}
            getRowHeight={() => 60}
          />
        )}
      </Paper>
    </>
  );
}
