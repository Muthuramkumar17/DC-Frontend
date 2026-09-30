import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Typography,
  Chip,
  Stack,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  PersonIcon,
  PlaceIcon,
  EventIcon,
  AccessTimeIcon,
  BathtubIcon,
  CloseIcon,
} from "@/theme/icons";

import {
  timeToMin,
  minToTime,
  fmtTime12,
  fmtDateHuman,
  formatCustomerAddress,
} from "@/utils/scheduling";

const STATUS_COLOR = {
  scheduled: "#B47C24",
  completed: "#2D7A69",
  conflict: "#D32F2F",
  cancelled: "#757575",
};

function Row({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      {icon}
      <Stack spacing={0} sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default function BookingDetailsDialog({
  booking,
  customerById,
  durationByBathrooms,
  onClose,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const customer = booking ? booking.customer || customerById[booking.customerId] : null;
  const duration = booking ? durationByBathrooms[booking.bathroomCount] : null;
  const address = booking ? formatCustomerAddress(customer) : "";
  const start = booking?.startTime ? timeToMin(booking.startTime) : null;
  const statusColor = booking ? STATUS_COLOR[booking.status] || "#757575" : "#757575";

  return (
    <Dialog
      open={!!booking}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      fullScreen={fullScreen}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        Booking Details
        <IconButton aria-label="Close booking details" onClick={onClose} edge="end" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {booking && (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight={800} noWrap>
                  {customer?.name || "Unknown customer"}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="flex-start">
                  <PlaceIcon fontSize="inherit" sx={{ mt: "3px", color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {address}
                  </Typography>
                </Stack>
              </Stack>
              <Chip
                size="small"
                label={booking.status}
                sx={{
                  fontWeight: 700,
                  textTransform: "capitalize",
                  bgcolor: `${statusColor}22`,
                  color: statusColor,
                  flexShrink: 0,
                }}
              />
            </Stack>

            <Divider />

            <Stack spacing={1.5}>
              <Row
                icon={<EventIcon fontSize="small" color="action" />}
                label="Date"
                value={fmtDateHuman(booking.date)}
              />
              <Row
                icon={<AccessTimeIcon fontSize="small" color="action" />}
                label="Time"
                value={
                  start === null
                    ? "Unscheduled"
                    : `${fmtTime12(booking.startTime)} – ${fmtTime12(minToTime(start + duration))}`
                }
              />
              <Row
                icon={<BathtubIcon fontSize="small" color="action" />}
                label="Service"
                value={`${booking.bathroomCount} bathroom${booking.bathroomCount > 1 ? "s" : ""} · ${duration} minutes${booking.solo ? " · Solo" : ""}`}
              />
              {customer?.phone && (
                <Row
                  icon={<PersonIcon fontSize="small" color="action" />}
                  label="Contact"
                  value={customer.phone}
                />
              )}
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}