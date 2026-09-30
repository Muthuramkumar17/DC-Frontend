import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/ui/StatusChip";
import Money from "@/components/ui/Money";
import {
  EmptyState,
  ErrorState,
} from "@/components/feedback/PageStates";
import { useBookingsList } from "../hooks/useBookings";
import { formatDate } from "@/utils/format";

/**
 * BookingListPage Component
 * Commercial operations table displaying scheduled and confirmed customer bookings.
 */
export default function BookingListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  /** Query bookings with filter parameters */
  const { data, isLoading, isError, error, refetch } = useBookingsList({ search, status });

  /** Configure DataGrid columns */
  const columns = useMemo(
    () => [
      {
        field: "serialNumber",
        headerName: "S.No",
        minWidth: 75,
        flex: 0.45,
        sortable: false,
        valueGetter: (v, row, column, apiRef) => apiRef.current.getRowIndexRelativeToVisibleRows(row.id) + 1,
      },
      {
        field: "customer",
        headerName: "Customer",
        minWidth: 175,
        flex: 1.4,
        renderCell: (p) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {p.row.customer ? p.row.customer.name : "—"}
          </Typography>
        ),
      },
      {
        field: "address",
        headerName: "Area",
        minWidth: 125,
        flex: 0.9,
        valueGetter: (v, row) => row.address?.area || "—",
      },
      {
        field: "bathrooms",
        headerName: "Baths",
        minWidth: 80,
        flex: 0.65,
        type: "number",
      },
      {
        field: "frequencyId",
        headerName: "Frequency",
        minWidth: 120,
        flex: 0.95,
        valueGetter: (v, row) => row.frequencyName || "—",
      },
      {
        field: "planId",
        headerName: "Plan",
        minWidth: 140,
        flex: 1,
        valueGetter: (v, row) => row.planName || "—",
      },
      {
        field: "total",
        headerName: "Total Amount",
        minWidth: 125,
        flex: 0.95,
        renderCell: (p) => <Money value={p.value} strong />,
      },
      {
        field: "startDate",
        headerName: "Start Date",
        minWidth: 115,
        flex: 0.9,
        valueGetter: (v, row) => formatDate(row.startDate),
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 115,
        flex: 0.9,
        renderCell: (p) => <StatusChip status={p.value} />,
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Manage scheduled service bookings and confirmed orders."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/bookings/new")}
          >
            New Booking
          </Button>
        }
      />

      {/* Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 1 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Search by customer name or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ width: 160 }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Data Table */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          "& .MuiDataGrid-root": { minWidth: 0 },
        }}
      >
        {isError ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : !isLoading && (data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No bookings found"
            description="Create a new commercial booking to generate service subscriptions."
            actionLabel="New Booking"
            onAction={() => navigate("/bookings/new")}
          />
        ) : (
          <DataGrid
            rows={data || []}
            columns={columns}
            columnVisibilityModel={{
              total:false,
              startDate: false,
            }}
            loading={isLoading}
            autoHeight
            disableRowSelectionOnClick
            disableColumnResize
            onRowClick={(p) => navigate(`/bookings/${p.row.bookingNumber}`)}
            sx={{
              border: "none",
              "& .MuiDataGrid-row": {
                cursor: "pointer",
                "&:hover": { bgcolor: "#F3F7F6" },
              },
              "& .MuiDataGrid-columnHeaders": { bgcolor: "#F3F7F6" },
            }}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 50]}
          />
        )}
      </Paper>
    </>
  );
}
