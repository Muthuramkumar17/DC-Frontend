import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { CalendarMonthOutlinedIcon, TodayIcon } from "@/theme/icons";
import { fmtDateHuman } from "@/utils/scheduling";

export default function CalendarHeader({
  selectedDate,
  onToday,
  totalCount = 0,
  completedCount = 0,
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1.5}
      sx={{ mb: 2.5, px: { xs: 0, sm: 0.25 } }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <CalendarMonthOutlinedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Service Schedule
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {selectedDate
            ? fmtDateHuman(selectedDate)
            : "Manage schedules and service activities."}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ width: "auto", flexShrink: 0 }}
      >
        <Chip
          size="small"
          label={`${totalCount} Service${totalCount === 1 ? "" : "s"}`}
          sx={{ fontWeight: 700, bgcolor: "action.selected" }}
        />
        {completedCount > 0 && (
          <Chip
            size="small"
            label={`${completedCount} Completed`}
            color="success"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        )}
        {onToday && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<TodayIcon fontSize="small" />}
            onClick={onToday}
            sx={{ ml: { xs: 0, sm: 0.5 }, flexShrink: 0 }}
          >
            Today
          </Button>
        )}
      </Stack>
    </Stack>
  );
}