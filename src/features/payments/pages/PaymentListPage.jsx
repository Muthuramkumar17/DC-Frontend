import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { DataGrid } from '@mui/x-data-grid';
import { SearchIcon, PaymentsOutlinedIcon } from '@/theme/icons';

import PageHeader from '@/components/layout/PageHeader';
import StatusChip from '@/components/ui/StatusChip';
import Money from '@/components/ui/Money';
import { EmptyState, ErrorState } from '@/components/feedback/PageStates';
import { usePaymentsList, usePaymentMethods } from '@/features/payments/hooks/usePayments';
import { formatDate } from '@/utils/format';

/**
 * PaymentListPage Component
 * Financial audit log of all recorded collections and payment transaction receipts.
 */
export default function PaymentListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [modeId, setModeId] = useState('All');

  const { data: paymentMethods = [] } = usePaymentMethods();

  /** Query payments data */
  const { data, isLoading, isError, error, refetch } = usePaymentsList({ search, status, modeId });

  const rows = data || [];
  /** Calculate total valid collections excluding reversed payments */
  const totalCollected = rows.filter((p) => p.status !== 'Reversed').reduce((s, p) => s + p.amount, 0);

  /** DataGrid columns layout */
  const columns = useMemo(
    () => [
      { field: 'serialNumber', headerName: 'S.No', width: 75, sortable: false, valueGetter: (v, row, column, apiRef) => apiRef.current.getRowIndexRelativeToVisibleRows(row.id) + 1 },
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
      { field: 'amount', headerName: 'Amount Paid', width: 140, renderCell: (p) => <Money value={p.value} strong color="success.main" /> },
      { field: 'mode', headerName: 'Payment Mode', width: 140, valueGetter: (v, row) => row.mode || row.paymentMethod || '—' },
      { field: 'paymentDate', headerName: 'Payment Date', width: 130, valueGetter: (v, row) => formatDate(row.paymentDate || row.createdAt) },
      { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <StatusChip status={p.value} /> },
    ],
    []
  );

  return (
    <>
      <PageHeader title="Payments" subtitle="Financial record of collections, payment receipts, and gateway transactions." />

      {/* Summary KPI Card */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={4}>
          <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, borderColor: 'primary.light' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Filtered Collections
              </Typography>
              <PaymentsOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
            </Stack>
            <Typography variant="h2" sx={{ mt: 0.5, color: 'success.main', fontWeight: 700 }}>
              <Money value={totalCollected} strong />
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Search customer name or payment details..."
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
          <TextField select size="small" label="Mode" value={modeId} onChange={(e) => setModeId(e.target.value)} sx={{ width: 160 }}>
            <MenuItem value="All">All Modes</MenuItem>
            {paymentMethods.map((m) => (
              <MenuItem key={m._id} value={m._id}>
                {m.paymentMethodName || m.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ width: 160 }}>
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Recorded">Recorded</MenuItem>
            <MenuItem value="Reversed">Reversed</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Data Table */}
      <Paper variant="outlined" sx={{ height: 580, borderRadius: 3, overflow: 'hidden' }}>
        {isError ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : !isLoading && rows.length === 0 ? (
          <EmptyState title="No payments recorded" description="Payment transactions will appear automatically when bookings are processed." />
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            disableRowSelectionOnClick
            onRowClick={(p) => navigate(`/payments/${p.row.paymentNumber}`)}
            sx={{
              border: 'none',
              '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: '#F3F7F6' } },
              '& .MuiDataGrid-columnHeaders': { bgcolor: '#F3F7F6' },
            }}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50]}
          />
        )}
      </Paper>
    </>
  );
}
