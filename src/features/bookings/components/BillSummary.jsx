import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Money from "@/components/ui/Money";

/**
 * Summary Row Helper Component
 * Render label on left and money amount on right with support for strong/muted emphasis.
 */
function Row({ label, value, muted, strong }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography
        variant="body2"
        color={muted ? "text.secondary" : "text.primary"}
        sx={{ fontWeight: strong ? 700 : 400 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{
          fontWeight: strong ? 700 : 500,
          color: strong ? "primary.main" : "text.primary",
        }}
      >
        <Money value={value} strong={strong} />
      </Typography>
    </Stack>
  );
}

/**
 * BillSummary Component
 * Sticky sidebar panel showing the mapped pricing configuration for bookings.
 *
 * @param {Object} props
 * @param {Object} [props.quote] - Computed price quote object from api/pricing
 * @param {boolean} [props.priceChanged] - Flag indicating if master pricing has been modified
 */
export default function BillSummary({ quote, priceChanged }) {
  if (!quote) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Bill Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a service plan, frequency, and bathroom count to compute total
          pricing.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.75,
        borderRadius: 3,
        bgcolor: "#FFFFFF",
        position: { md: "sticky" },
        top: { md: 88 },
        boxShadow: "0 4px 16px rgba(15, 92, 87, 0.06)",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Bill Summary
        </Typography>
        {priceChanged && (
          <Chip
            size="small"
            color="warning"
            label="Price updated"
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
        )}
      </Stack>

      {/* Mapped pricing only */}
      <Stack spacing={1}>
        <Row label="Base Amount" value={quote.baseAmount} />
        <Row label={`CGST (${(quote.taxes?.[0]?.rate * 100 || 0).toFixed(0)}%)`} value={quote.taxes?.[0]?.amount || 0} muted />
        <Row label={`SGST (${(quote.taxes?.[1]?.rate * 100 || 0).toFixed(0)}%)`} value={quote.taxes?.[1]?.amount || 0} muted />
        <Row label="GST Amount" value={quote.gstAmount} />
        {quote.authorizedDiscount > 0 && (
          <Row label="Discount" value={quote.authorizedDiscount} muted />
        )}
        <Row label="Final Amount" value={quote.total} strong />
      </Stack>
    </Paper>
  );
}
