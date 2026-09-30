import { useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { CloseIcon } from "@/theme/icons";

import CalendarHeader from "@/features/visits/components/CalendarHeader";
import CalendarDatePicker from "@/features/visits/components/CalendarDatePicker";
import RouteByBlock from "@/features/visits/components/RouteByBlock";
import DayTimeline from "@/features/visits/components/DayTimeline";
import BookingDetailsDialog from "@/features/visits/components/BookingDetailsDialog";
import CompleteJobForm from "@/features/visits/components/CompleteJobForm";
import { printServiceAreaDocument } from "@/features/visits/components/serviceAreaPrintHelper";
import { useSnackbar } from "@/components/feedback/SnackbarProvider";
import { LoadingSkeleton, ErrorState } from "@/components/feedback/PageStates";
import { useVisitsList, useUpdateVisit } from "@/features/visits/hooks/useVisits";
import { useBookingMasters } from "@/features/bookings/hooks/useBookings";
import { timeToMin, toDateStr } from "@/utils/scheduling";

dayjs.extend(utc);

function timeFromSlotId(slotId) {
  const match = String(slotId || "").match(/-(\d+)$/);
  if (!match) return "";
  const minutes = Number(match[1]);
  if (minutes < 0 || minutes > 1439) return "";
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function toCalendarBooking(visit) {
  const customer = visit.customer || (visit.customerId && typeof visit.customerId === "object" ? visit.customerId : {});
  const booking = visit.booking || (visit.bookingId && typeof visit.bookingId === "object" ? visit.bookingId : {});
  const calendarCustomer = {
    ...customer,
    phone: customer.phone || customer.mobile || customer.phoneNumber || "",
    blockNumber: customer.blockNumber || customer.block || "",
  };
  const scheduledStart =
    visit.scheduledStartDateTime ||
    visit.startDateTime ||
    booking.startDateTime ||
    booking.scheduledDate;
  const scheduledEnd = visit.scheduledEndDateTime || visit.endDateTime;
  const scheduledDate = scheduledStart || visit.scheduledDate || visit.date;
  const bathroomCount =
    booking.bathroomCount ??
    booking.bathrooms ??
    booking.bathroomCountReference?.bathroomCount ??
    visit.bathroomCount ??
    visit.bathrooms ??
    visit.bathroomCountReference?.bathroomCount ??
    booking.bathroomCountId?.bathroomCount ??
    visit.bathroomCountId?.bathroomCount ??
    1;
  // Use dayjs (local timezone) to extract the date so that UTC ISO strings
  // like "2026-09-18T18:30:00Z" (= 2026-09-19 in IST) are displayed on the
  // correct calendar day instead of the previous day.
  const date = scheduledDate ? dayjs.utc(scheduledDate).format("YYYY-MM-DD") : "";
  const slotTime = timeFromSlotId(booking.slotId || visit.slotId);
  const scheduledDuration =
    scheduledStart && scheduledEnd && dayjs.utc(scheduledStart).isValid() && dayjs.utc(scheduledEnd).isValid()
      ? dayjs.utc(scheduledEnd).diff(dayjs.utc(scheduledStart), "minute")
      : 0;
  const bufferMinutes = Number(
    visit.timeSlotReference?.bufferTime
      ?? booking.timeSlotReference?.bufferTime
      ?? visit.bufferMinutes
      ?? booking.bufferMinutes
      ?? 0,
  );
  const duration =
    Math.max(scheduledDuration - bufferMinutes, 0) ||
    Number(booking.durationMinutes || booking.serviceDurationId?.durationMinutes || 60);
  const startTime =
    (scheduledStart && dayjs.utc(scheduledStart).isValid()
      ? dayjs.utc(scheduledStart).format("HH:mm")
      : "") ||
    slotTime ||
    "08:00";

  return {
    id: visit._id || visit.id,
    visitNumber: visit.visitNumber || booking.bookingId || visit._id,
    bookingNumber: booking.bookingId || visit.visitNumber || visit._id,
    customerId: customer._id || customer.id || visit.customerId,
    customer: calendarCustomer,
    booking,
    date,
    startTime,
    bathroomCount,
    duration,
    bufferMinutes,
    status: visit.isCancelled ? "cancelled" : visit.isCompleted ? "completed" : "scheduled",
    blockNumber: customer.block || "",
    area: customer.area || "",
  };
}



/**
 * ServiceCalendarPage Component
 * Main service operations calendar: combines date picking, daily timeline, route mapping, and execution.
 */
export default function ServiceCalendarPage() {
  const snackbar = useSnackbar();
  const today = toDateStr(new Date());

  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);

  const {
    data: visits = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useVisitsList();

  const updateVisitMutation = useUpdateVisit();

  const bookings = useMemo(() => visits.map(toCalendarBooking), [visits]);

  const { data: bookingMasters } = useBookingMasters();

  const durationByBathrooms = useMemo(
    () => ({
      ...(bookingMasters?.durationByBathroom || {}),
      ...bookings.reduce((durations, booking) => {
        if (!durations[booking.bathroomCount]) {
          durations[booking.bathroomCount] = booking.duration;
        }
        return durations;
      }, {}),
    }),
    [bookings, bookingMasters]
  );

  const calendarDayEndMin = useMemo(() => {
    const configuredEnd = bookingMasters?.dayEndMin || 19 * 60 + 30;
    const latestBookingEnd = bookings.reduce((latest, booking) => {
      const start = timeToMin(booking.startTime);
      const duration =
        durationByBathrooms[booking.bathroomCount] || booking.duration || 60;
      return Math.max(latest, start + duration);
    }, configuredEnd);

    return Math.max(configuredEnd, latestBookingEnd + 30);
  }, [bookings, bookingMasters, durationByBathrooms]);

  const customerById = useMemo(() => {
    const customers = {};
    visits.forEach((visit) => {
      const customer = visit.customer || (visit.customerId && typeof visit.customerId === "object" ? visit.customerId : null);
      if (customer) {
        const customerId = customer._id || customer.id;
        customers[customerId] = {
          ...customer,
          phone: customer.phoneNumber || customer.mobile,
          blockNumber: customer.block || customer.blockNumber || "",
        };
      }
    });
    return customers;
  }, [visits]);

  const dayBookings = useMemo(
    () => bookings.filter((booking) => booking.date === selectedDate),
    [bookings, selectedDate]
  );

  const monthCursor = selectedDate.slice(0, 7);
  const activeBookings = dayBookings.filter((booking) => booking.status !== "cancelled");
  const completedCount = activeBookings.filter((booking) => booking.status === "completed").length;

  const handlePrintServices = (data) => {
    printServiceAreaDocument(data);
  };

  const handleComplete = async (id) => {
    await updateVisitMutation.mutateAsync({
      id,
      changes: {
        isCompleted: true,
        isPending: false,
        actualEndDateTime: new Date().toISOString(),
      },
    });
    setCompleteTarget(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
        <LoadingSkeleton rows={8} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
        <ErrorState message={error?.message || "Could not load service calendar"} onRetry={refetch} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", pb: 3 }}>
      {/* Calendar Header with Summary & Today shortcut */}
      <CalendarHeader
        selectedDate={selectedDate}
        onToday={() => setSelectedDate(today)}
        totalCount={activeBookings.length}
        completedCount={completedCount}
      />

      {/* Main Grid Layout: Timeline + Date Picker + Route/Area summary */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: "minmax(0, 3fr) minmax(0, 7fr)",
          },
          gridTemplateAreas: {
            xs: '"picker" "timeline" "route"',
            lg: '"picker timeline" "route timeline"',
          },
          gridTemplateRows: {
            lg: "auto 1fr",
          },
          gap: { xs: 2, lg: 2.5 },
          alignItems: "start",
        }}
      >
        <Box sx={{ gridArea: "timeline", minWidth: 0 }}>
          <DayTimeline
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dayBookings={dayBookings}
            customerById={customerById}
            onComplete={setCompleteTarget}
            durationByBathrooms={durationByBathrooms}
            onBookingClick={setSelectedBooking}
            dayStartMin={bookingMasters?.dayStartMin}
            dayEndMin={calendarDayEndMin}
          />
        </Box>

        <Box sx={{ gridArea: "picker", minWidth: 0 }}>
          <CalendarDatePicker
            monthCursor={monthCursor}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            bookings={bookings}
          />
        </Box>

        <Box sx={{ gridArea: "route", minWidth: 0 }}>
          <RouteByBlock
            bookings={dayBookings}
            customerById={customerById}
            selectedDate={selectedDate}
            onPrintServices={handlePrintServices}
          />
        </Box>
      </Box>

      {/* Booking Details Modal */}
      <BookingDetailsDialog
        booking={selectedBooking}
        customerById={customerById}
        durationByBathrooms={durationByBathrooms}
        onClose={() => setSelectedBooking(null)}
      />

      {/* Mark Job Completed Modal */}
      <Dialog
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Mark Job Completed
          <IconButton size="small" onClick={() => setCompleteTarget(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {completeTarget && (
            <CompleteJobForm
              booking={completeTarget}
              customerById={customerById}
              onSubmit={handleComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
