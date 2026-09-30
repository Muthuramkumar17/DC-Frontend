import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from '@mui/x-data-grid';
import StatusChip from '@/components/ui/StatusChip';
import Money from '@/components/ui/Money';
import { EmptyState } from '@/components/feedback/PageStates';
import { formatDate } from '@/utils/format';

export default function BookingsTab({ bookings, addresses, customerNumber }) {
  const navigate = useNavigate();

  const columns = [
    {
      field: 'bookingNumber',
      headerName: 'S.No',
      width: 190,
      renderCell: (p) => p.api.getRowIndexRelativeToVisibleRows(p.id) + 1,
    },
    { field: 'type', headerName: 'Type', width: 100 },
    {
      field: 'address',
      headerName: 'Address',
      width: 150,
      valueGetter: (v, row) => addresses.find((a) => a.id === row.addressId)?.label || '—',
    },
    {
      field: 'plan',
      headerName: 'Plan',
      width: 150,
      valueGetter: (v, row) => row.planName || row.plan?.name || row.subscriptionTypeName || '—',
    },
    { field: 'total', headerName: 'Amount', width: 120, renderCell: (p) => <Money value={p.value} /> },
    { field: 'startDate', headerName: 'Start Date', width: 120, valueGetter: (v, row) => formatDate(row.startDate) },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <StatusChip status={p.value} /> },
  ];

  if (bookings.length === 0) {
    return (
      <Paper variant="outlined">
        <EmptyState
          title="No bookings yet"
          description="Create the first booking for this customer."
          actionLabel="Create Booking"
          onAction={() => navigate(`/bookings/new?customer=${customerNumber}`)}
        />
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-end">
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => navigate(`/bookings/new?customer=${customerNumber}`)}>
          Create Booking
        </Button>
      </Stack>
      <Paper variant="outlined" sx={{ height: 420 }}>
        <DataGrid
          rows={bookings}
          columns={columns}
          disableRowSelectionOnClick
          onRowClick={(p) => navigate(`/bookings/${p.row.bookingNumber}`)}
          sx={{ border: 'none', '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          pageSizeOptions={[5, 10, 25]}
        />
      </Paper>
    </Stack>
  );
}
