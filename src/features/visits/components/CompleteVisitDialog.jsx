import { useState } from "react";
import dayjs from "dayjs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import { useCompleteVisit, useBatchCompleteVisits } from "../hooks/useVisits";
import { useSnackbar } from "@/components/feedback/SnackbarProvider";

export default function CompleteVisitDialog({
  open,
  onClose,
  visitNumbers = [],
}) {
  const snackbar = useSnackbar();
  const completeVisitHook = useCompleteVisit();
  const batchCompleteHook = useBatchCompleteVisits();
  const [completedOn, setCompletedOn] = useState(dayjs());
  const [remarks, setRemarks] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const isBatch = visitNumbers.length > 1;
  const isSubmitting = completeVisitHook.isPending || batchCompleteHook.isPending;

  const handleConfirm = async () => {
    const payload = {
      actualEndDateTime: completedOn.toISOString(),
      remarks: remarks || "",
      isCompleted: true,
      isPending: false,
    };

    if (isBatch) {
      batchCompleteHook.mutate(
        { visitNumbers, payload },
        {
          onSuccess: () => {
            snackbar.success(`${visitNumbers.length} visits marked completed.`);
            handleClose();
          },
          onError: (err) => {
            snackbar.error(err.message || "Failed to complete visits.");
          },
        },
      );
    } else {
      completeVisitHook.mutate(
        { visitNumber: visitNumbers[0], payload },
        {
          onSuccess: () => {
            snackbar.success("Visit marked as completed.");
            handleClose();
          },
          onError: (err) => snackbar.error(err.message || "Failed to complete visit."),
        },
      );
    }
  };

  const handleClose = () => {
    setRemarks("");
    setConfirmed(false);
    setCompletedOn(dayjs());
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        {isBatch ? `Complete ${visitNumbers.length} Visits` : "Complete Visit"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {isBatch
            ? "Record these visits as completed based on the returned technician worksheet."
            : `Record ${visitNumbers[0]} as completed.`}
        </DialogContentText>
        {!isBatch && (
          <Chip
            size="small"
            label={visitNumbers[0]}
            sx={{ mb: 2, fontFamily: "IBM Plex Mono, monospace" }}
          />
        )}
        <Stack spacing={2}>
          <DateTimePicker
            label="Completed On"
            value={completedOn}
            onChange={setCompletedOn}
            maxDateTime={dayjs()}
            slotProps={{ textField: { fullWidth: true } }}
          />
          {!isBatch && (
            <TextField
              label="Completion Remarks"
              fullWidth
              multiline
              minRows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
            }
            label="I confirm this completion was verified against the returned worksheet."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={isSubmitting || !confirmed}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : null
          }
        >
          Mark Completed
        </Button>
      </DialogActions>
    </Dialog>
  );
}
