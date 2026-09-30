import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * ConfirmDialog Component
 * Reusable modal popup to confirm user actions like cancellations, deletions, or status overrides.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether dialog modal is open
 * @param {string} props.title - Title text of the confirmation modal
 * @param {string} props.description - Explanatory prompt message
 * @param {string} [props.entityLabel] - Target business ID code highlighted in monospace font
 * @param {boolean} [props.requireReason=false] - If true, requires user to enter a text reason
 * @param {string} [props.confirmLabel='Confirm'] - Action button text
 * @param {boolean} [props.destructive=false] - If true, styles primary action button with red error color
 * @param {Function} props.onConfirm - Async callback function executing the confirmed action
 * @param {Function} props.onClose - Callback function closing the dialog modal
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  entityLabel,
  requireReason = false,
  confirmLabel = 'Confirm',
  destructive = false,
  onConfirm,
  onClose,
  children,
  confirmDisabled = false,
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /** Submits confirmation and resets internal form state */
  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(reason);
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0.5,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pt: 2.5, pb: 1 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: entityLabel ? 1 : 0, color: 'text.secondary', fontSize: '0.9rem' }}>
          {description}
        </DialogContentText>
        {entityLabel && (
          <DialogContentText
            sx={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontWeight: 600,
              color: 'primary.dark',
              bgcolor: '#EAF3F1',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              display: 'inline-block',
              mt: 0.5,
            }}
          >
            {entityLabel}
          </DialogContentText>
        )}
        {requireReason && (
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Reason required"
            placeholder="Please provide a brief explanation..."
            sx={{ mt: 2 }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          onClick={handleConfirm}
          disabled={submitting || confirmDisabled || (requireReason && !reason.trim())}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
