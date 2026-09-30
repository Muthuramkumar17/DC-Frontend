import { PlaceIcon, PrintIcon } from "@/theme/icons";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { fmtTime12, formatCustomerAddress } from "@/utils/scheduling";

export default function RouteByBlock({ bookings, customerById, selectedDate, onPrintServices }) {
  const byBlock = {};
  bookings.forEach((booking) => {
    if (booking.status === "cancelled") return;
    const customer = booking.customer || customerById[booking.customerId];
    const block = customer?.blockNumber || customer?.block || "Unassigned block";
    byBlock[block] = byBlock[block] || [];
    byBlock[block].push(booking);
  });

  const blockEntries = Object.entries(byBlock);
  if (blockEntries.length === 0) return null;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <PlaceIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, minWidth: 0 }} noWrap>
          Today's Service Area
        </Typography>
        <Tooltip title="Print services">
          <IconButton
            size="small"
            aria-label="Print services"
            onClick={() => onPrintServices({ date: selectedDate, bookings, customerById })}
            sx={{
              p: 0.75,
              color: "#fff",
              bgcolor: "secondary.main",
              borderRadius: 1.5,
              boxShadow: 1,
              transition: "background-color 0.2s, box-shadow 0.2s, transform 0.2s",
              "&:hover": { bgcolor: "secondary.dark", boxShadow: 3, transform: "translateY(-1px)" },
            }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack spacing={1.5} divider={<Divider flexItem />}>
        {blockEntries.map(([block, list]) => {
          const areas = [
            ...new Set(list.map((b) => (b.customer || customerById[b.customerId])?.area).filter(Boolean)),
          ];
          const names = [
            ...new Set(list.map((b) => (b.customer || customerById[b.customerId])?.name).filter(Boolean)),
          ];
          return (
            <Box key={block}>
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 0.5 }}
              >
                <Chip
                  size="small"
                  label={areas.join(", ") || block}
                  sx={{ fontWeight: 700, bgcolor: "action.selected" }}
                />
                <Typography variant="caption" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
                  {names.join(", ") || "Unknown customer"} · {list.length} visit
                  {list.length > 1 ? "s" : ""}
                </Typography>
              </Stack>
              <Stack spacing={0.5} sx={{ pl: 0.5 }}>
                {list.map((booking) => {
                  const customer = booking.customer || customerById[booking.customerId];
                  const address = formatCustomerAddress(customer);
                  return (
                    <Box
                      key={booking.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "72px minmax(0, 1fr)",
                        alignItems: "center",
                        columnGap: 1,
                        minHeight: 28,
                      }}
                    >
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
                      >
                        {fmtTime12(booking.startTime)}
                      </Typography>
                      <Tooltip title={address}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ minWidth: 0 }}
                        >
                          {address}
                        </Typography>
                      </Tooltip>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}