import { useState } from 'react';
import dayjs from 'dayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useSnackbar } from '@/components/feedback/SnackbarProvider';
import { formatDate } from '@/utils/format';
import { useRescheduleVisit } from '@/features/visits/hooks/useVisits';
import { useBookingMasters } from '@/features/bookings/hooks/useBookings';

const REASONS = ['Customer Requested', 'Technician Unavailable', 'Access Not Available', 'Holiday', 'Operational Issue', 'Other'];

export default function RescheduleVisitDialog({ open, onClose, visit }) {
  const snackbar = useSnackbar();
  const [newDate, setNewDate] = useState(dayjs().add(1, 'day'));
  const [newSlotId, setNewSlotId] = useState('');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');

  const { data: masters } = useBookingMasters();
  const serviceSlots = masters?.slots || [];

  const rescheduleMutation = useRescheduleVisit();

  const handleClose = () => {
    setReason('');
    setRemarks('');
    setNewSlotId('');
    onClose();
  };

  const handleSubmit = () => {
    rescheduleMutation.mutate(
      {
        visitNumber: visit.visitNumber,
        payload: {
          newDate: newDate.format('YYYY-MM-DD'),
          newSlotId,
          reason,
          remarks,
        },
      },
      {
        onSuccess: (result) => {
          snackbar.success(`Visit rescheduled from ${formatDate(result.oldDate)} to ${formatDate(result.newDate)}.`);
          handleClose();
        },
        onError: (err) => snackbar.error(err.message),
      }
    );
  };

  if (!visit) return null;

  return (
    <Dialog open={open} onClose={rescheduleMutation.isPending ? undefined : handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reschedule Visit</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {visit.visitNumber}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Current: {formatDate(visit.date)} · {serviceSlots.find((s) => s.id === visit.slotId)?.label}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          <DatePicker
            label="New Date"
            value={newDate}
            onChange={setNewDate}
            minDate={dayjs()}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <TextField select label="New Available Slot" required fullWidth value={newSlotId} onChange={(e) => setNewSlotId(e.target.value)}>
            {serviceSlots.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Reason" required fullWidth value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
          {reason === 'Other' && (
            <TextField
              label="Remarks"
              required
              fullWidth
              multiline
              minRows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={rescheduleMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={rescheduleMutation.isPending || !newSlotId || !reason || (reason === 'Other' && !remarks.trim())}
          startIcon={rescheduleMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Reschedule
        </Button>
      </DialogActions>
    </Dialog>
  );
}
