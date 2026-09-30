import { useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@/theme/icons";
import { pad2 } from "@/utils/scheduling";

const CELL_SIZE = 32;

export default function CalendarDatePicker({
  monthCursor,
  selectedDate,
  setSelectedDate,
  bookings,
}) {
  const [year, month] = monthCursor.split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  }, []);

  const statusByDate = useMemo(() => {
    const bookingsByDate = {};
    bookings.forEach((booking) => {
      if (booking.status === "cancelled") return;
      bookingsByDate[booking.date] = [
        ...(bookingsByDate[booking.date] || []),
        booking,
      ];
    });
    return Object.fromEntries(
      Object.entries(bookingsByDate).map(([date, dateBookings]) => [
        date,
        {
          count: dateBookings.length,
          isCompleted: dateBookings.every(
            (booking) => booking.status === "completed",
          ),
          hasUnfinished: dateBookings.some(
            (booking) => booking.status !== "completed",
          ),
        },
      ]),
    );
  }, [bookings]);

  const cells = [];
  for (let index = 0; index < startWeekday; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  const shiftMonth = (delta) => {
    const next = new Date(year, month - 1 + delta, 1);
    setSelectedDate(`${next.getFullYear()}-${pad2(next.getMonth() + 1)}-01`);
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 1.5 }}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <IconButton
          size="small"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          sx={{ border: 1, borderColor: "divider" }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          {first.toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          })}
        </Typography>
        <IconButton
          size="small"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          sx={{ border: 1, borderColor: "divider" }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 0.5,
          mb: 0.75,
        }}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <Typography
            key={index}
            variant="caption"
            color="text.disabled"
            sx={{ textAlign: "center", fontWeight: 700 }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 0.5,
        }}
      >
        {cells.map((day, index) => {
          if (!day) return <Box key={index} sx={{ height: CELL_SIZE }} />;
          const date = `${year}-${pad2(month)}-${pad2(day)}`;
          const isSelected = date === selectedDate;
          const isToday = date === todayStr;
          const dateStatus = statusByDate[date];
          const isCompleted = Boolean(dateStatus?.isCompleted);
          const hasUnfinished = Boolean(dateStatus?.hasUnfinished);
          const isUpcoming = Boolean(dateStatus && date > todayStr);
          const isUnfinished = hasUnfinished && date <= todayStr;
          return (
            <Box
              key={index}
              onClick={() => setSelectedDate(date)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedDate(date);
                }
              }}
              sx={{
                height: CELL_SIZE,
                width: CELL_SIZE,
                minWidth: CELL_SIZE,
                aspectRatio: "1 / 1",
                mx: "auto",
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                cursor: "pointer",
                bgcolor: isCompleted
                  ? "#178A72"
                  : isUnfinished
                    ? "error.main"
                    : isSelected
                      ? "primary.main"
                      : isUpcoming
                        ? "#E8F3F0"
                        : "transparent",
                color:
                  isCompleted || isUnfinished || isSelected
                    ? "#fff"
                    : isUpcoming
                      ? "#0E6B57"
                      : "text.primary",
                border: isToday && !isSelected ? 1.5 : 0,
                borderColor: "primary.main",
                boxSizing: "border-box",
                fontWeight: isToday || isSelected ? 700 : 400,
                transition: "background-color .15s",
                "&:hover": {
                  bgcolor: isCompleted
                    ? "#0E6B57"
                    : isUnfinished
                      ? "error.dark"
                      : isSelected
                        ? "primary.dark"
                        : isUpcoming
                          ? "#D5ECE6"
                          : "action.hover",
                },
                "&:focus-visible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "inherit", lineHeight: 1 }}
              >
                {day}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
