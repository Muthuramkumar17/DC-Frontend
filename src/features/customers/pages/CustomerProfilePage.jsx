/**
 * CustomerProfilePage.jsx
 * -----------------------------------------------------------------------
 * Customer 360 view displaying profile header, key metric quick stats, and
 * tabbed views (Overview, Addresses, Bookings, Subscriptions).
 * -----------------------------------------------------------------------
 */

import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import {
  EditOutlinedIcon,
  AddLocationAltOutlinedIcon,
  EventNoteOutlinedIcon,
  MoreVertIcon,
} from "@/theme/icons";

import PageHeader from "@/components/layout/PageHeader";
import StatusChip from "@/components/ui/StatusChip";
import {
  LoadingSkeleton,
  ErrorState,
  EmptyState,
} from "@/components/feedback/PageStates";
import { useCustomer360 } from "../hooks/useCustomers";
import { formatDate, initials } from "@/utils/format";

import {
  OverviewTab,
  AddressesTab,
  BookingsTab,
  SubscriptionsTab,
  AddAddressDialog,
  CustomerCreateDrawer,
} from "@/features/customers/components";

const TABS = ["overview", "addresses", "bookings", "subscriptions"];

/**
 * Customer 360 profile master page component.
 */
export default function CustomerProfilePage() {
  const { customerNumber } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(
    searchParams.get("action") === "add" &&
      searchParams.get("tab") === "addresses",
  );

  const tabParam = searchParams.get("tab");
  const activeTab = TABS.includes(tabParam) ? tabParam : "overview";

  const { data, isLoading, isError, error, refetch } = useCustomer360(customerNumber);

  /**
   * Tab switch handler updating URL query params.
   */
  const handleTabChange = (_, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", value);
      next.delete("action");
      return next;
    });
  };

  /**
   * Direct navigation helper to create new booking for customer.
   */
  const goCreateBooking = (address) => {
    navigate(
      `/bookings/new?customer=${customerNumber}${address ? `&address=${address.addressNumber}` : ""}`,
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
        <PageHeader
          title="Customer Profile"
          subtitle="Loading customer details..."
          breadcrumbs={[
            { label: "Customers", path: "/customers" },
            { label: "Customer" },
          ]}
        />
        <LoadingSkeleton rows={8} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
        <ErrorState message={error.message} onRetry={refetch} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
          <EmptyState
            title="Customer not found"
            description={`No customer matches ${customerNumber}.`}
          />
        </Paper>
      </Box>
    );
  }

  const { customer, addresses, bookings, subscriptions, summary } = data;
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        p: { xs: 2, sm: 3.5 },
      }}
    >
      <PageHeader
        breadcrumbs={[
          { label: "Customers", path: "/customers" },
          { label: customer.name },
        ]}
        actions={
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={() => setEditCustomerOpen(true)}
            >
              Edit
            </Button>

            <Button
              size="small"
              variant="contained"
              startIcon={<EventNoteOutlinedIcon />}
              onClick={() => goCreateBooking()}
            >
              Create Booking
            </Button>

            <Menu
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={() => setMenuAnchor(null)}>
                Download Customer Statement
              </MenuItem>
              <MenuItem onClick={() => setMenuAnchor(null)}>
                Deactivate Customer
              </MenuItem>
            </Menu>
          </Stack>
        }
      />

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 3 }}
      >
        <Grid container spacing={2.5} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "1.25rem",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(15, 92, 87, 0.25)",
              }}
            >
              {initials(customer.name)}
            </Avatar>
          </Grid>
          <Grid item>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {customer.name}
              </Typography>
              <StatusChip status={customer.status} />
            </Stack>
            <Stack direction="row" spacing={2.5} flexWrap="wrap" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                 Mobile Number: {customer.mobile}
              </Typography>
              {defaultAddress?.area && (
                <Typography variant="body2" color="text.secondary">
                  Area: {defaultAddress.area}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                 Active subscription: {summary.activeSubscriptions}
              </Typography>
              {summary.nextVisits[0] && (
                <Typography variant="body2" color="text.secondary">
                  Next visit: {formatDate(summary.nextVisits[0].date)}
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Overview" value="overview" />
          <Tab label={`Addresses (${addresses.length})`} value="addresses" />
          <Tab label={`Bookings (${bookings.length})`} value="bookings" />
          <Tab
            label={`Subscriptions (${subscriptions.length})`}
            value="subscriptions"
          />
        </Tabs>
        <Stack sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {activeTab === "overview" && (
            <OverviewTab data={data} onCreateBooking={goCreateBooking} />
          )}
          {activeTab === "addresses" && (
            <AddressesTab
              addresses={addresses}
              onAddAddress={() => setAddAddressOpen(true)}
              onCreateBooking={goCreateBooking}
            />
          )}
          {activeTab === "bookings" && (
            <BookingsTab
              bookings={bookings}
              addresses={addresses}
              customerNumber={customer.customerNumber}
            />
          )}
          {activeTab === "subscriptions" && (
            <SubscriptionsTab
              subscriptions={subscriptions}
              addresses={addresses}
            />
          )}
        </Stack>
      </Paper>

      <CustomerCreateDrawer
        open={editCustomerOpen}
        onClose={() => setEditCustomerOpen(false)}
        mode="edit"
        customerId={customer.customerNumber}
        initialValues={{
          name: customer.name || "",
          mobile: customer.mobile || "",
          sameAsMobile: true,
          whatsapp: "",
          email: customer.email || "",
          addressLabel: defaultAddress?.label || "Home",
          doorNo: defaultAddress?.doorNo || "",
          block: defaultAddress?.block || "",
          community: defaultAddress?.community || defaultAddress?.apartmentName || "",
          addressLine: defaultAddress?.addressLine || "",
          area: defaultAddress?.area || "",
          city: defaultAddress?.city || "",
          pincode: defaultAddress?.pincode || "",
          landmark: defaultAddress?.landmark || "",
        }}
        onCreated={() => {
          setEditCustomerOpen(false);
          refetch();
        }}
      />

      <AddAddressDialog
        open={addAddressOpen}
        onClose={() => setAddAddressOpen(false)}
        customerNumber={customer.customerNumber}
      />
    </Box>
  );
}
