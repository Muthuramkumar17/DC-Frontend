import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import {
  SearchIcon,
  CalendarMonthOutlinedIcon,
  ReceiptLongOutlinedIcon,
  PrintOutlinedIcon,
  CloseIcon,
} from '@/theme/icons';

import Invoice from '../components/Invoice';
import { printInvoiceDocument } from '@/features/invoices/invoicePrintHelper';
import PageHeader from '@/components/layout/PageHeader';
import { ErrorState, LoadingSkeleton } from '@/components/feedback/PageStates';
import { useInvoicesList } from '@/features/invoices/hooks/useInvoices';
import { formatDate, formatMoney } from '@/utils/format';

const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Invoices' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'prev_month', label: 'Previous Month' },
];

export default function InvoiceListPage() {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { data: rawInvoices = [], isLoading, isError, error, refetch } = useInvoicesList({ search });

  // Filter invoices by date range
  const filteredInvoices = useMemo(() => {
    if (!rawInvoices.length) return [];
    if (dateFilter === 'all') return rawInvoices;

    const now = dayjs();
    return rawInvoices.filter((invoice) => {
      const invoiceDate = invoice.createdDate ? dayjs(invoice.createdDate) : null;
      if (!invoiceDate || !invoiceDate.isValid()) return false;

      if (dateFilter === 'today') {
        return invoiceDate.isSame(now, 'day');
      }
      if (dateFilter === 'week') {
        return invoiceDate.isSame(now, 'week');
      }
      if (dateFilter === 'month') {
        return invoiceDate.isSame(now, 'month');
      }
      if (dateFilter === 'prev_month') {
        return invoiceDate.isSame(now.subtract(1, 'month'), 'month');
      }
      return true;
    });
  }, [rawInvoices, dateFilter]);

  // Aggregate statistics
  const totalAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  }, [filteredInvoices]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <PageHeader
        title="Invoices"
        subtitle="Generated invoices and tax receipts for confirmed bookings."
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<ReceiptLongOutlinedIcon fontSize="small" />}
              label={`${filteredInvoices.length} ${filteredInvoices.length === 1 ? 'Invoice' : 'Invoices'}`}
              variant="outlined"
              sx={{ fontWeight: 600, py: 1.8, px: 0.5, borderRadius: 1 }}
            />
            <Chip
              label={`Total: ${formatMoney(totalAmount)}`}
              color="primary"
              sx={{ fontWeight: 700, py: 1.8, px: 0.5, borderRadius: 1 }}
            />
          </Stack>
        }
      />

      {/* Filter & Search Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={7} md={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by customer name or phone..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                ...(search && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch('')}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Date Period"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            >
              {DATE_FILTER_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {isLoading && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !isError && filteredInvoices.length === 0 && (
        <Paper variant="outlined" sx={{ p: 6, borderRadius: 1, textAlign: 'center', bgcolor: 'background.paper' }}>
          <ReceiptLongOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            No invoices found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dateFilter !== 'all' || search
              ? 'Try adjusting your search criteria or date period filter.'
              : 'Invoices will appear here once bookings are confirmed.'}
          </Typography>
          {(dateFilter !== 'all' || search) && (
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
              onClick={() => {
                setSearch('');
                setDateFilter('all');
              }}
            >
              Reset Filters
            </Button>
          )}
        </Paper>
      )}

      {!isLoading && !isError && filteredInvoices.length > 0 && (
        <Stack spacing={2}>
          {filteredInvoices.map((invoice) => (
            <Paper
              key={invoice.id}
              variant="outlined"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedInvoice(invoice)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setSelectedInvoice(invoice);
              }}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                '&:hover, &:focus-visible': {
                  borderColor: 'primary.main',
                  boxShadow: 2,
                  outline: 'none',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {invoice.customer?.name || 'Unknown customer'}
                    </Typography>
                    {invoice.customer?.phone && (
                      <Chip
                        label={invoice.customer.phone}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.725rem' }}
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Created {formatDate(invoice.createdDate, 'DD MMM YYYY, hh:mm A')}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: 'text.primary' }}>
                    {formatMoney(invoice.amount)}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PrintOutlinedIcon />}
                    onClick={(event) => {
                      event.stopPropagation();
                      printInvoiceDocument({
                        invoice,
                        customer: invoice.customer,
                        booking: invoice.booking,
                      });
                    }}
                    sx={{ borderRadius: 1 }}
                  >
                    Print
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Invoice Modal Preview */}
      <Dialog open={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ pr: 6, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Invoice Preview</span>
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedInvoice && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<PrintOutlinedIcon />}
                onClick={() => {
                  printInvoiceDocument({
                    invoice: selectedInvoice,
                    customer: selectedInvoice.customer,
                    booking: selectedInvoice.booking,
                  });
                }}
                sx={{ borderRadius: 1 }}
              >
                Print
              </Button>
            )}
            <IconButton
              onClick={() => setSelectedInvoice(null)}
              aria-label="Close invoice"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#F3F7F6', overflowX: 'auto', py: 3 }}>
          {selectedInvoice && (
            <Box>
              <Invoice
                invoice={selectedInvoice}
                customer={selectedInvoice.customer}
                booking={selectedInvoice.booking}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
