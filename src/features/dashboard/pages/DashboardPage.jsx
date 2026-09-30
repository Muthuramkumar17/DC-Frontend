import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

function getServiceTimeRange(visit) {
  if (!visit) return "—";

  const scheduledStart =
    visit.scheduledStartDateTime ||
    visit.startDateTime ||
    visit.booking?.startDateTime ||
    visit.bookingReference?.startDateTime ||
    visit.serviceStartTime ||
    "";

  const serviceDuration = Number(
    visit.durationMinutes ?? visit.duration ??
      visit.serviceDurationReference?.durationMinutes ??
      visit.serviceDurationId?.durationMinutes ??
      visit.booking?.durationMinutes ?? visit.booking?.duration ??
      visit.booking?.serviceDurationReference?.durationMinutes ??
      visit.bookingReference?.durationMinutes ?? visit.bookingReference?.duration ??
      visit.bookingReference?.serviceDurationReference?.durationMinutes,
  );
  const scheduledEnd =
    scheduledStart && Number.isFinite(serviceDuration) && serviceDuration > 0
      ? dayjs.utc(scheduledStart).add(serviceDuration, "minute").toISOString()
      : "";

  if (scheduledStart && scheduledEnd) {
    return `${dayjs.utc(scheduledStart).format("h:mm A")} – ${dayjs.utc(scheduledEnd).format("h:mm A")}`;
  }

  if (visit.serviceStartTime && visit.serviceEndTime) {
    return `${visit.serviceStartTime} – ${visit.serviceEndTime}`;
  }

  return "—";
}
import {
  Grid,
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  AddIcon,
  EventNoteOutlinedIcon,
  CleaningServicesOutlinedIcon,
  TrendingUpIcon,
  CloseIcon,
  SearchIcon,
  ClearIcon,
} from "@/theme/icons";




import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/ui/StatusChip";
import {
  LoadingSkeleton,
  ErrorState,
} from "@/components/feedback/PageStates";
import KpiCard from "@/features/dashboard/components/KpiCards";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboard";
import { formatDate } from "@/utils/format";

/**
 * DashboardPage Component
 * Operational control center giving telecallers & admins real-time insights into today's visit workload, financial collections, and pending exceptions.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const today = dayjs().format("YYYY-MM-DD");

  const [dateRangeFilter, setDateRangeFilter] = useState("today"); // 'today' | 'week' | 'month'
  const [areaSearch, setAreaSearch] = useState("");

  // State for KPI Cards Modal Dialogs
  const [kpiModal, setKpiModal] = useState(null); // 'visits' | 'subscriptions' | 'renewals' | null
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [renewalMonthFilter, setRenewalMonthFilter] = useState(
    String(dayjs().month()),
  );
  const [renewalPage, setRenewalPage] = useState(0);
  const [visitPage, setVisitPage] = useState(0);
  const [subscriptionPage, setSubscriptionPage] = useState(0);
  const [renewalRowsPerPage, setRenewalRowsPerPage] = useState(5);
  const [visitRowsPerPage, setVisitRowsPerPage] = useState(5);
  const [subscriptionRowsPerPage, setSubscriptionRowsPerPage] = useState(5);

  /** Fetch live dashboard metrics */
  const { data, isLoading, isError, error, refetch } = useDashboardSummary(today);

  const upcomingVisits = data?.upcomingVisits || [];
  const monthVisits = data?.monthVisits || [];
  const todayVisitsList = data?.todayVisitsList || [];
  const activeSubscriptionsList = data?.activeSubscriptionsList || [];
  const renewalsList = data?.renewalsList || [];

  const MONTHS = [
    { value: "ALL", label: "All Months" },
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  /** Filter renewals due month-wise */
  const filteredRenewals = useMemo(() => {
    if (!renewalsList.length) return [];
    if (renewalMonthFilter === "ALL") return renewalsList;

    return renewalsList.filter((item) => {
      if (!item.renewalDate) return false;
      const monthIndex = dayjs(item.renewalDate).month();
      return String(monthIndex) === String(renewalMonthFilter);
    });
  }, [renewalsList, renewalMonthFilter]);

  /** Filter scheduled visits by date period (Today, This Week, This Month) and search by Area */
  const filteredVisits = useMemo(() => {
    const sourceVisits =
      dateRangeFilter === "month"
        ? monthVisits.length
          ? monthVisits
          : upcomingVisits
        : upcomingVisits;
    if (!sourceVisits.length) return [];

    return sourceVisits.filter((visit) => {
      // 1. Date Period Filter
      const visitDate = dayjs(visit.date);
      const now = dayjs();
      let matchesDate = false;

      if (dateRangeFilter === "today") {
        matchesDate = visitDate.isSame(now, "day");
      } else if (dateRangeFilter === "week") {
        matchesDate = visitDate.isSame(now, "week");
      } else if (dateRangeFilter === "month") {
        matchesDate = visitDate.isSame(now, "month");
      } else {
        matchesDate = true;
      }

      if (!matchesDate) return false;

      // 2. Area Text Search Input
      if (areaSearch.trim()) {
        const query = areaSearch.trim().toLowerCase();
        const areaName = (visit.customer?.area || "Unassigned").toLowerCase();
        const rawArea = (visit.customer?.area || "").toLowerCase();
        const customerName = (visit.customer?.name || "").toLowerCase();
        const visitNum = (visit.visitNumber || "").toLowerCase();
        const matchesAreaText =
          areaName.includes(query) || rawArea.includes(query);
        const matchesOtherText =
          customerName.includes(query) || visitNum.includes(query);

        if (!matchesAreaText && !matchesOtherText) return false;
      }

      return true;
    });
  }, [upcomingVisits, monthVisits, dateRangeFilter, areaSearch]);

  const renewalDueSoonCount =
    renewalMonthFilter === "ALL"
      ? kpis?.renewalsDueSoon || 0
      : filteredRenewals.length;

  const paginatedRenewals = useMemo(() => {
    const start = renewalPage * renewalRowsPerPage;
    return filteredRenewals.slice(start, start + renewalRowsPerPage);
  }, [filteredRenewals, renewalPage]);

  const paginatedTodayVisits = useMemo(() => {
    const start = visitPage * visitRowsPerPage;
    return todayVisitsList.slice(start, start + visitRowsPerPage);
  }, [todayVisitsList, visitPage, visitRowsPerPage]);

  const paginatedActiveSubscriptions = useMemo(() => {
    const start = subscriptionPage * subscriptionRowsPerPage;
    return activeSubscriptionsList.slice(
      start,
      start + subscriptionRowsPerPage,
    );
  }, [activeSubscriptionsList, subscriptionPage, subscriptionRowsPerPage]);

  const renewalPageCount = Math.max(
    1,
    Math.ceil((filteredRenewals.length || 0) / renewalRowsPerPage),
  );

  const visitPageCount = Math.max(
    1,
    Math.ceil((todayVisitsList.length || 0) / visitRowsPerPage),
  );

  const subscriptionPageCount = Math.max(
    1,
    Math.ceil((activeSubscriptionsList.length || 0) / subscriptionRowsPerPage),
  );

  const scheduledVisitRows = useMemo(
    () => filteredVisits.map((visit, index) => ({ ...visit, sno: index + 1 })),
    [filteredVisits],
  );

  const scheduledVisitColumns = useMemo(
    () => [
      {
        field: "sno",
        headerName: "S.No",
        width: 75,
        type: "number",
      },
      
      {
        field: "customerName",
        headerName: "Customer",
        minWidth: 120,
        flex: 1.4,
        valueGetter: (value, row) => row.customer?.name || "—",
        renderCell: (params) => (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography
              variant="body2"
              sx={{  lineHeight: 1.2 }}
            >
              {params.row.customer?.name || "—"}
            </Typography>
            {params.row.customer?.phoneNumber && (
              <Typography variant="caption" color="text.secondary">
                {params.row.customer.phoneNumber}
              </Typography>
            )}
          </Box>
        ),
      },

      {
        field: "area",
        headerName: "Area",
        minWidth: 145,
        flex: 1,
        valueGetter: (value, row) => row.customer?.area || "—",
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500, fontSize: "0.75rem" }}
          />
        ),
      },

      {
        field: "date",
        headerName: "Scheduled Date",
        minWidth: 190,
        flex: 1.3,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatDate(params.row.date)}
          </Typography>
        ),
      },

      {
        field: "status",
        headerName: "Status",
        minWidth: 125,
        flex: 0.8,
        renderCell: (params) => (
          <StatusChip status={params.value || "Scheduled"} />
        ),
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          subtitle={dayjs().format("dddd, DD MMMM YYYY")}
        />
        <LoadingSkeleton rows={8} />
      </>
    );
  }

  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  const { kpis, exceptions } = data;

  const selectedVisitServiceTime = selectedVisit
    ? selectedVisit.serviceBookedTime || getServiceTimeRange(selectedVisit)
    : "—";

  return (
    <>
      {/* Top Header & Quick Actions */}
      <PageHeader
        title="Dashboard"
        subtitle={`Operational summary for ${dayjs().format("dddd, DD MMMM YYYY")}`}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() =>
                navigate("/customers", { state: { openCustomerDrawer: true } })
              }
            >
              Add Customer
            </Button>
            <Button
              variant="contained"
              startIcon={<EventNoteOutlinedIcon />}
              onClick={() => navigate("/bookings/new")}
            >
              Create Booking
            </Button>
          </>
        }
      />

      {/* Row 1: Visit Execution KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={4}>
          <KpiCard
            label="Today's Visits"
            value={kpis.todayVisits}
            onClick={() => setKpiModal("visits")}
            icon={
              <CleaningServicesOutlinedIcon
                fontSize="small"
                sx={{ color: "primary.main", opacity: 0.8 }}
              />
            }
          />
        </Grid>

        <Grid item xs={6} sm={4} md={4}>
          <KpiCard
            label="Active Subscriptions"
            value={kpis.activeSubscriptions}
            onClick={() => setKpiModal("subscriptions")}
            icon={
              <TrendingUpIcon fontSize="small" sx={{ color: "primary.main" }} />
            }
          />
        </Grid>

        <Grid item xs={6} sm={4}>
          <KpiCard
            label="Renewals Due Soon"
            value={renewalDueSoonCount}
            accent="warning.main"
            onClick={() => setKpiModal("renewals")}
          />
        </Grid>
      </Grid>

      {/* Row 4: Recent Feeds */}
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {/* Cleaning Service Schedule Table */}
        <Grid item xs={12} md={12}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Scheduled Cleaning Services
                  </Typography>
                  <Chip
                    label={`${filteredVisits.length} ${filteredVisits.length === 1 ? "Service" : "Services"}`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  />
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {dateRangeFilter === "today"
                    ? `Showing services scheduled for today (${dayjs().format("DD MMM YYYY")})`
                    : dateRangeFilter === "week"
                      ? `Showing services scheduled for this week (${dayjs().startOf("week").format("DD MMM")} – ${dayjs().endOf("week").format("DD MMM YYYY")})`
                      : `Showing services scheduled for ${dayjs().format("MMMM YYYY")}`}
                </Typography>
              </Box>
            </Stack>

            {/* Filter and Search Toolbar */}
            <Stack
              direction={{ xs: "row", sm: "row" }}
              spacing={1.5}
              alignItems="center"
              justifyContent="space-between"
              sx={{
                mb: 2.5,
                p: 1.5,
                bgcolor: "grey.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                flexWrap: "wrap",
              }}
            >
              {/* Search by Area Text Field (Stretched) */}
              <TextField
                size="small"
                placeholder="Search by area..."
                value={areaSearch}
                onChange={(e) => {
                  setAreaSearch(e.target.value);
                }}
                sx={{
                  flex: 1,
                  minWidth: { xs: 0, sm: 220 },
                  maxWidth: { xs: "100%", sm: "none" },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: areaSearch ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setAreaSearch("")}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />

              {/* Period Date Filter Dropdown */}
              <TextField
                select
                size="small"
                label="Period"
                value={dateRangeFilter}
                onChange={(e) => {
                  setDateRangeFilter(e.target.value);
                }}
                sx={{ width: { xs: 140, sm: 160 }, minWidth: 140 }}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </TextField>

            </Stack>

            {filteredVisits.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  No cleaning services found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {areaSearch
                    ? "No services match your area search."
                    : `No services scheduled for ${
                        dateRangeFilter === "today"
                          ? "today"
                          : dateRangeFilter === "week"
                            ? "this week"
                            : "this month"
                      }.`}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ width: "100%" }}>
                <DataGrid
                  rows={scheduledVisitRows}
                  columns={scheduledVisitColumns}
                  getRowId={(row) => row.id || row.visitNumber}
                  disableRowSelectionOnClick
                  onRowClick={(params) =>
                    setSelectedVisit({
                      ...params.row,
                      serviceBookedTime: getServiceTimeRange(params.row),
                    })
                  }
                  sx={{
                    border: "none",
                    "& .MuiDataGrid-row": {
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#F3F7F6" },
                    },
                    "& .MuiDataGrid-columnHeaders": { bgcolor: "#F3F7F6" },
                  }}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 1. Customer Details */}
      <Dialog
        open={Boolean(selectedVisit)}
        onClose={() => setSelectedVisit(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selectedVisit?.customer?.name || "Customer Details"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedVisit ? formatDate(selectedVisit.date) : ""}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setSelectedVisit(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5 }}>
          {selectedVisit && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 1, bgcolor: "grey.50" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Customer & Address
                  </Typography>

                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Customer Name
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {selectedVisit.customer?.name || "—"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Mobile Number
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedVisit.customer?.phoneNumber || selectedVisit.mobileNumber || "—"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Area
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedVisit.customer?.area || "—"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedVisit.customer?.address || "—"}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 1, bgcolor: "grey.50" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Service Details
                  </Typography>

                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Scheduled Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatDate(selectedVisit.date)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Service Booked Time
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedVisitServiceTime}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* 1. Today's Visits Modal */}
      <Dialog
        open={kpiModal === "visits"}
        onClose={() => setKpiModal(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Today's Visits Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({dayjs().format("DD MMMM YYYY")})
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setKpiModal(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          {todayVisitsList.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 3, textAlign: "center" }}
            >
              No visits scheduled for today.
            </Typography>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Customer Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Mobile Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Visit Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        No. of Service
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTodayVisits.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {row.customerName}
                        </TableCell>
                        <TableCell>{row.mobileNumber}</TableCell>
                        <TableCell>{formatDate(row.visitDate)}</TableCell>
                        <TableCell>{row.noOfService}</TableCell>
                        <TableCell>
                          <StatusChip status={row.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Box />
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <TextField
                    select
                    size="small"
                    label="Rows per page"
                    value={visitRowsPerPage}
                    onChange={(e) => {
                      setVisitRowsPerPage(Number(e.target.value));
                      setVisitPage(0);
                    }}
                    sx={{ width: 140 }}
                  >
                    {[5, 10, 25].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="caption" color="text.secondary">
                    {visitPage * visitRowsPerPage + 1}-
                    {Math.min(
                      (visitPage + 1) * visitRowsPerPage,
                      todayVisitsList.length,
                    )}{" "}
                    of {todayVisitsList.length}
                  </Typography>
                  <IconButton
                    size="small"
                    disabled={visitPage === 0}
                    onClick={() => setVisitPage((p) => Math.max(0, p - 1))}
                  >
                    <Typography variant="body2">‹</Typography>
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={visitPage >= visitPageCount - 1}
                    onClick={() =>
                      setVisitPage((p) => Math.min(visitPageCount - 1, p + 1))
                    }
                  >
                    <Typography variant="body2">›</Typography>
                  </IconButton>
                </Stack>
              </Stack>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Active Subscriptions Modal */}
      <Dialog
        open={kpiModal === "subscriptions"}
        onClose={() => setKpiModal(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Active Subscriptions
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setKpiModal(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          {activeSubscriptionsList.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 3, textAlign: "center" }}
            >
              No active subscriptions found.
            </Typography>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Customer Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Phone Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Type of Subscription
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedActiveSubscriptions.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {row.customerName}
                        </TableCell>
                        <TableCell>{row.phoneNumber}</TableCell>
                        <TableCell>{row.subscriptionType}</TableCell>
                        <TableCell>
                          <StatusChip status={row.status || "Active"} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Box />
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <TextField
                    select
                    size="small"
                    label="Rows per page"
                    value={subscriptionRowsPerPage}
                    onChange={(e) => {
                      setSubscriptionRowsPerPage(Number(e.target.value));
                      setSubscriptionPage(0);
                    }}
                    sx={{ width: 140 }}
                  >
                    {[5, 10, 25].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="caption" color="text.secondary">
                    {subscriptionPage * subscriptionRowsPerPage + 1}-
                    {Math.min(
                      (subscriptionPage + 1) * subscriptionRowsPerPage,
                      activeSubscriptionsList.length,
                    )}{" "}
                    of {activeSubscriptionsList.length}
                  </Typography>
                  <IconButton
                    size="small"
                    disabled={subscriptionPage === 0}
                    onClick={() =>
                      setSubscriptionPage((p) => Math.max(0, p - 1))
                    }
                  >
                    <Typography variant="body2">‹</Typography>
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={subscriptionPage >= subscriptionPageCount - 1}
                    onClick={() =>
                      setSubscriptionPage((p) =>
                        Math.min(subscriptionPageCount - 1, p + 1),
                      )
                    }
                  >
                    <Typography variant="body2">›</Typography>
                  </IconButton>
                </Stack>
              </Stack>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. Renewals Due Soon Modal */}
      <Dialog
        open={kpiModal === "renewals"}
        onClose={() => setKpiModal(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Renewals Due Details
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setKpiModal(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          {/* Month Filter Dropdown */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <TextField
              select
              size="small"
              label="Filter by Month"
              value={renewalMonthFilter}
              onChange={(e) => setRenewalMonthFilter(e.target.value)}
              sx={{ width: 200 }}
            >
              {MONTHS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {filteredRenewals.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 3, textAlign: "center" }}
            >
              No renewals found for the selected month.
            </Typography>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Customer Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Mobile Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Renewal Due Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Type of Subscription
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRenewals.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {row.customerName}
                        </TableCell>
                        <TableCell>{row.mobileNumber}</TableCell>
                        <TableCell>{formatDate(row.renewalDate)}</TableCell>
                        <TableCell>{row.subscriptionType}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Box />
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <TextField
                    select
                    size="small"
                    label="Rows per page"
                    value={renewalRowsPerPage}
                    onChange={(e) => {
                      setRenewalRowsPerPage(Number(e.target.value));
                      setRenewalPage(0);
                    }}
                    sx={{ width: 140 }}
                  >
                    {[5, 10, 25].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="caption" color="text.secondary">
                    {renewalPage * renewalRowsPerPage + 1}-
                    {Math.min(
                      (renewalPage + 1) * renewalRowsPerPage,
                      filteredRenewals.length,
                    )}{" "}
                    of {filteredRenewals.length}
                  </Typography>
                  <IconButton
                    size="small"
                    disabled={renewalPage === 0}
                    onClick={() => setRenewalPage((p) => Math.max(0, p - 1))}
                  >
                    <Typography variant="body2">‹</Typography>
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={renewalPage >= renewalPageCount - 1}
                    onClick={() =>
                      setRenewalPage((p) =>
                        Math.min(renewalPageCount - 1, p + 1),
                      )
                    }
                  >
                    <Typography variant="body2">›</Typography>
                  </IconButton>
                </Stack>
              </Stack>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
