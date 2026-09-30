import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import {
  SearchIcon,
  AddIcon,
  MoreVertIcon,
  PersonOutlineIcon,
  EventNoteOutlinedIcon,
  PlaceOutlinedIcon,
} from "@/theme/icons";

import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/ui/StatusChip";
import {
  EmptyState,
  ErrorState,
} from "@/components/feedback/PageStates";
import { useCustomersList } from "../hooks/useCustomers";
import { formatDate } from "@/utils/format";
import { CustomerCreateDrawer } from "@/features/customers/components";

const customerProfilePath = (customerNumber) =>
  `/customers/${encodeURIComponent(String(customerNumber))}`;

/**
 * RowActions Component
 * Action menu dropdown for individual customer row entries in DataGrid.
 */
function RowActions({ row }) {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAnchor(e.currentTarget);
        }}
        aria-label="Row actions"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, width: 180 } }}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null);
            navigate(customerProfilePath(row.customerNumber));
          }}
          sx={{ fontSize: "0.85rem", gap: 1 }}
        >
          <PersonOutlineIcon fontSize="small" /> View Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            navigate(
              `${customerProfilePath(row.customerNumber)}?tab=addresses&action=add`,
            );
          }}
          sx={{ fontSize: "0.85rem", gap: 1 }}
        >
          <PlaceOutlinedIcon fontSize="small" /> Add Address
        </MenuItem>
        <MenuItem
          onClick={() =>
            navigate(
              `/bookings/new?customer=${encodeURIComponent(row.customerNumber)}`,
            )
          }
          sx={{ fontSize: "0.85rem", gap: 1 }}
        >
          <EventNoteOutlinedIcon fontSize="small" /> Create Booking
        </MenuItem>
      </Menu>
    </>
  );
}

/**
 * CustomerListPage Component
 * Manages permanent customer profiles, search filtering, and drawer registration.
 */
export default function CustomerListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    customerNumber: false,
    mobile: false,
    addressCount: false,
    activeSubscriptionCount: false,
    nextVisit: false,
  });

  useEffect(() => {
    if (!location.state?.openCustomerDrawer) return;

    setDrawerOpen(true);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state?.openCustomerDrawer, navigate]);

  /** Query customer list with live search and status filters */
  const { data, isLoading, isError, error, refetch } = useCustomersList({
    search,
    status,
  });

  /** Table columns configuration */
  const columns = useMemo(
    () => [
      {
        field: "customerNumber",
        headerName: "S.No",
        minWidth: 155,
        flex: 1.15,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            {params.api.getRowIndexRelativeToVisibleRows(params.id) + 1}
          </Box>
        ),
      },
      {
        field: "name",
        headerName: "Customer Name",
        flex: 1.55,
        minWidth: 175,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}
            >
              {params.value}
            </Typography>
          </Box>
        ),
      },
      { field: "mobile", headerName: "Mobile", minWidth: 130, flex: 1.05 },
      {
        field: "defaultAddress",
        headerName: "Default Area",
        minWidth: 145,
        flex: 1.15,
        valueGetter: (v, row) =>
          row.defaultArea ||
          row.defaultAddress?.area ||
          "—",
      },
      {
        field: "serviceFrequency",
        headerName: "Service Frequency",
        minWidth: 155,
        flex: 1.15,
        valueGetter: (value, row) =>
          row.serviceFrequency ||
          row.serviceFrequencyName ||
          row.frequencyName ||
          row.frequency ||
          "—",
      },
      {
        field: "subscriptionType",
        headerName: "Subscription Type",
        minWidth: 155,
        flex: 1.15,
        valueGetter: (value, row) =>
          row.subscriptionType ||
          row.subscriptionTypeName ||
          row.planName ||
          "—",
      },
      {
        field: "addressCount",
        headerName: "Addresses",
        minWidth: 105,
        flex: 0.8,
        type: "number",
      },
      {
        field: "activeSubscriptionCount",
        headerName: "Active Subscriptions",
        minWidth: 155,
        flex: 1.15,
        type: "number",
      },
      {
        field: "nextVisit",
        headerName: "Next Visit",
        minWidth: 125,
        flex: 1,
        valueGetter: (v, row) =>
          row.nextVisit ? formatDate(row.nextVisit.date) : "—",
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 115,
        flex: 0.9,
        renderCell: (params) => <StatusChip status={params.value} />,
      },
      {
        field: "actions",
        headerName: "",
        width: 64,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => <RowActions row={params.row} />,
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Manage permanent customer records, contact information, and service addresses."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDrawerOpen(true)}
          >
            Add Customer
          </Button>
        }
      />

      {/* Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Search by name, mobile phone, or area..."
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
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {/* Data Table */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 1, overflow: "hidden" }}
      >
        {isError ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : !isLoading && (data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No customers found"
            description="Register your first customer profile to start booking services."
            actionLabel="Add Customer"
            onAction={() => setDrawerOpen(true)}
          />
        ) : (
          <DataGrid
            rows={data || []}
            columns={columns}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            loading={isLoading}
            autoHeight
            disableRowSelectionOnClick
            onRowClick={(params, event) => {
              // Keep row navigation from being triggered by the actions menu.
              if (event?.defaultMuiPrevented) return;
              navigate(customerProfilePath(params.row.customerNumber));
            }}
            sx={{
              border: "none",
              "& .MuiDataGrid-row": {
                cursor: "pointer",
                "&:hover": { bgcolor: "#F3F7F6" },
              },
              "& .MuiDataGrid-columnHeaders": { bgcolor: "#F3F7F6" },
            }}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50]}
          />
        )}
      </Paper>

      {/* Registration Slide-over Drawer */}
      <CustomerCreateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={(customerNumber, addressNumber) => {
          setDrawerOpen(false);
          if (customerNumber) {
            const params = new URLSearchParams({ customer: customerNumber });
            if (addressNumber) params.set("address", addressNumber);
            navigate(`/bookings/new?${params.toString()}`);
            return;
          }
          navigate("/bookings/new");
        }}
      />
    </>
  );
}
