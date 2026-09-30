import { ButtonBase, Paper, Stack, Typography } from "@mui/material";

export function KpiCard({ label, value, onClick, accent, icon }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: "100%",
        textAlign: "left",
        borderRadius: 1,
        transition: "transform 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
        },
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2.25,
          width: "100%",
          borderRadius: 1,
          boxShadow: "0 2px 8px rgba(15, 92, 87, 0.04)",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography variant="h6" color="text.secondary">
            {label}
          </Typography>

          {icon}
        </Stack>

        <Typography
          variant="h2"
          sx={{ mt: 1, color: accent || "text.primary", fontWeight: 700 }}
        >
          {value}
        </Typography>
      </Paper>
    </ButtonBase>
  );
}

export default KpiCard;
