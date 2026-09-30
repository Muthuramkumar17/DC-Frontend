import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, TextField, Button,
} from "@mui/material";

export function DeactivateDialog({ open, record, onClose, onConfirm, submitting }) {
  const [reason, setReason] = useState("");
  useEffect(() => { if (open) setReason(""); }, [open]);
  if (!record) return null;
  const canSubmit = reason.trim().length >= 5;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Deactivate role?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          "{record.roleName}" will no longer be assignable to Users. Users already holding this role keep their
          current effective permissions until reassigned.
        </Typography>
        <TextField label="Reason" required fullWidth multiline minRows={2} value={reason} onChange={(e) => setReason(e.target.value)} helperText="Minimum 5 characters." />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="contained" color="error" onClick={() => onConfirm(reason)} disabled={submitting || !canSubmit}>Deactivate</Button>
      </DialogActions>
    </Dialog>
  );
}

export function UnsavedChangesDialog({ open, onDiscard, onKeepEditing }) {
  return (
    <Dialog open={open} onClose={onKeepEditing} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Discard unsaved changes?</DialogTitle>
      <DialogContent><Typography variant="body2" color="text.secondary">You have unsaved changes. Leaving now will discard them.</Typography></DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onKeepEditing}>Continue editing</Button>
        <Button color="error" variant="contained" onClick={onDiscard}>Discard changes</Button>
      </DialogActions>
    </Dialog>
  );
}
