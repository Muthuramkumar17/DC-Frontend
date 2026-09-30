import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { CheckCircleIcon } from "@/theme/icons";
import { fmtDateHuman, fmtTime12 } from "@/utils/scheduling";

export default function CompleteJobForm({ booking, customerById, onSubmit }) {
  return (
    <Box sx={{ pt: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {booking.customer?.name || customerById[booking.customerId]?.name || "Unknown customer"} · {fmtDateHuman(booking.date)}{" "}
        · {booking.startTime ? fmtTime12(booking.startTime) : "unscheduled"}
      </Typography>
      <Button
        fullWidth
        variant="contained"
        startIcon={<CheckCircleIcon />}
        onClick={() => onSubmit(booking.id)}
      >
        Mark Completed
      </Button>
    </Box>
  );
}