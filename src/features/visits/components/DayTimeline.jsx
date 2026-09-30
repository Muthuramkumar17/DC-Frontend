import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { CheckCircleIcon as CheckCircleOutlineIcon } from "@/theme/icons";
import { timeToMin, minToTime, fmtTime12 } from "@/utils/scheduling";

export default function DayTimeline({
  dayBookings,
  customerById,
  onComplete,
  durationByBathrooms,
  onBookingClick,
  dayStartMin = 8 * 60,
  dayEndMin = 19 * 60 + 30,
}) {
  const timelineStartMin = dayStartMin;
  const timelineEndMin = dayEndMin;
  const totalMin = timelineEndMin - timelineStartMin;
  const timelineHeight = 880;
  const minCardHeightPercent = (80 / timelineHeight) * 100;
  const hourMarks = [];
  for (let time = timelineStartMin; time <= timelineEndMin; time += 60) {
    hourMarks.push(time);
  }

  const toneFor = (status) => {
    if (status === "scheduled") {
      return {
        bg: "rgba(180, 124, 36, 0.12)",
        border: "#B47C24",
        label: "Scheduled",
      };
    }
    if (status === "conflict") {
      return {
        bg: "rgba(211, 47, 47, 0.12)",
        border: "#D32F2F",
        label: "Conflict",
      };
    }
    if (status === "completed") {
      return {
        bg: "rgba(45, 122, 105, 0.12)",
        border: "#2D7A69",
        label: "Completed",
      };
    }
    return { bg: "action.hover", border: "divider", label: status };
  };

  return (
    <Paper
      variant="outlined"
      sx={{ overflow: "hidden", borderRadius: 1.5, bgcolor: "background.paper" }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={{ xs: 1.5, sm: 3 }}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ whiteSpace: { sm: "nowrap" } }}
            >
              Daily Service Schedule
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Track service delivery activities
            </Typography>
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 2 }}
          flexWrap="wrap"
          useFlexGap
          sx={{
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            alignItems: "center",
            mt: 0,
            flexShrink: 0,
          }}
        >
          {[
            { label: "Scheduled", color: "#B47C24" },
            { label: "Completed", color: "#2D7A69" },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, whiteSpace: "nowrap", lineHeight: 1 }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>

      <Box sx={{ px: { xs: 1.5, sm: 2.5 }, py: 2 }}>
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              position: "relative",
              width: { xs: 54, sm: 68 },
              height: timelineHeight,
              flexShrink: 0,
            }}
          >
            {hourMarks.map((time) => {
              const percent = ((time - timelineStartMin) / totalMin) * 100;
              return (
                <Typography
                  key={time}
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    position: "absolute",
                    top: `${percent}%`,
                    right: 0,
                    transform: "translateY(-50%)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {fmtTime12(minToTime(time))}
                </Typography>
              );
            })}
          </Box>
          <Box
            sx={{
              position: "relative",
              flex: 1,
              minWidth: 0,
              width: 0,
              height: timelineHeight,
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor: "background.paper",
              backgroundImage:
                "linear-gradient(to bottom, rgba(113, 128, 121, 0.08) 1px, transparent 1px)",
              backgroundSize: "100% 50px",
            }}
          >
            {hourMarks.map((time) => {
              const percent = ((time - timelineStartMin) / totalMin) * 100;
              return (
                <Box
                  key={time}
                  sx={{
                    position: "absolute",
                    top: `${percent}%`,
                    left: 0,
                    right: 0,
                    borderTop: 1,
                    borderColor: "divider",
                    opacity: 0.8,
                  }}
                />
              );
            })}
            {dayBookings.length === 0 && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="text.secondary"
                >
                  No jobs scheduled
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  This day is clear.
                </Typography>
              </Box>
            )}
            {dayBookings.map((booking) => {
              const start = timeToMin(booking.startTime);
              const duration =
                durationByBathrooms[booking.bathroomCount] ||
                booking.duration ||
                60;
              const top = ((start - timelineStartMin) / totalMin) * 100;
              const height = Math.max((duration / totalMin) * 100, 4);
              const renderedServiceHeight = Math.max(height, minCardHeightPercent);
              const tone = toneFor(booking.status);
              const customer = booking.customer || customerById[booking.customerId];
              const canComplete = booking.status === "scheduled";

              const bufferMinutes = 15;
              const bufferTop = top + renderedServiceHeight;
              const bufferHeight = (bufferMinutes / totalMin) * 100;

              return (
                <Box key={booking.id}>
                  {/* Service Event Card */}
                  <Paper
                    elevation={0}
                    onClick={() => onBookingClick(booking)}
                    sx={{
                      position: "absolute",
                      top: `calc(${top}% + 5px)`,
                      height: `calc(${height}% - 10px)`,
                      minHeight: 70,
                      left: 10,
                      right: 10,
                      bgcolor: tone.bg,
                      border: 1,
                      borderColor: tone.border,
                      borderLeftWidth: 5,
                      borderRadius: 1,
                      px: { xs: 1.25, sm: 1.75 },
                      py: 1.25,
                      overflow: "hidden",
                      cursor: "pointer",
                      zIndex: 2,
                      transition: "transform .15s, box-shadow .15s",
                      "&:hover": { transform: "translateX(3px)", boxShadow: 3 },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                      sx={{ height: "100%", minWidth: 0 }}
                    >
                      <Box minWidth={0} sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ width: "100%", minWidth: 0 }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            sx={{ overflowWrap: "anywhere" }}
                          >
                            {customer?.name || "Unknown"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              ml: "auto",
                              color: tone.border,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                              flexShrink: 0,
                              textAlign: "right",
                            }}
                          >
                            {tone.label}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          fontWeight={700}
                          sx={{ overflowWrap: "anywhere" }}
                        >
                          <Box
                            component="span"
                            sx={{ color: tone.border, mr: 0.75 }}
                          >
                            Booked service
                          </Box>
                          {fmtTime12(booking.startTime)} –{" "}
                          {fmtTime12(minToTime(start + duration))}
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                          >
                            {" "}
                            · {booking.bathroomCount} Bathroom
                            {booking.bathroomCount > 1 ? "s" : ""}
                            {booking.solo && " · Solo"}
                          </Typography>
                        </Typography>
                        {booking.bookingNumber && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.25 }}
                          >
                            Booking: {booking.bookingNumber}
                          </Typography>
                        )}
                      </Box>
                      {booking.status !== "cancelled" && (
                        <Stack
                          direction="row"
                          spacing={0.2}
                          flexShrink={0}
                          sx={{ alignSelf: "center", mt: 0 }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {canComplete && (
                            <Tooltip title="Mark completed">
                              <IconButton
                                size="small"
                                onClick={() => onComplete(booking)}
                                sx={{
                                  p: 0.5,
                                  bgcolor: "transparent",
                                  "&:hover": {
                                    bgcolor: "transparent",
                                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                                  },
                                }}
                              >
                                <CheckCircleOutlineIcon
                                  sx={{ fontSize: 17 }}
                                  color="success"
                                />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Paper>

                  {/* Unavailable Buffer Time Window */}
                  {booking.status !== "cancelled" && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: `calc(${bufferTop}%)`,
                        height: `calc(${bufferHeight}%)`,
                        left: 10,
                        right: 10,
                        bgcolor: "action.disabledBackground",
                        opacity: 0.6,
                        border: "1px dashed",
                        borderColor: "text.disabled",
                        borderRadius: 1,
                        px: 1.5,
                        display: "flex",
                        alignItems: "center",
                        zIndex: 1,
                        pointerEvents: "none",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontStyle: "italic", fontSize: 11 }}>
                        Buffer Time ({bufferMinutes} min gap · {fmtTime12(minToTime(start + duration))} – {fmtTime12(minToTime(start + duration + bufferMinutes))})
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
