import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, alpha } from "@mui/material/styles";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";
import {
  MenuIcon,
  SearchIcon,
  LogoutOutlinedIcon,
} from "@/theme/icons";

import { getCurrentUserApi, logout } from "@/features/auth/api/auth.api.js";



/**
 * AppShell Component
 * Main application layout wrapper containing top AppBar and responsive side navigation Drawer.
 */
export default function AppShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    name: "System User",
    email: "",
    role: "admin",
  });
  const isSuperAdmin =
    typeof currentUser.role === "string" &&
    currentUser.role.toLowerCase().includes("super");
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalResults, setGlobalResults] = useState([]);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUserApi();
        if (!active) return;

        setCurrentUser({
          name: user?.userName || user?.name || "System User",
          email: user?.email || "",
          role:
            user?.roleReference?.roleName || user?.role?.roleName || "Admin",
        });
      } catch (error) {
        if (!active) return;
        logout();
      }
    };

    loadCurrentUser();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const query = globalSearch.trim();
    if (!query) {
      setGlobalResults([]);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      const responses = await Promise.allSettled([
        listCustomers({ search: query }),
        listBookings({ search: query }),
        listSubscriptions({ search: query }),
        listVisits({ search: query }),
      ]);
      if (cancelled) return;

      const [customers, bookings, subscriptions, visits] = responses.map(
        (response) =>
          response.status === "fulfilled" ? response.value.slice(0, 4) : [],
      );
      setGlobalResults(
        [
          ...customers.map((item) => ({
            type: "Customer",
            label: item.name,
            to: `/customers/${item.customerNumber}`,
          })),
          ...bookings.map((item) => ({
            type: "Booking",
            label: item.customer?.name || "Booking",
            detail: item.customer?.name || "",
            to: `/bookings/${item.bookingNumber}`,
          })),
          ...subscriptions.map((item) => ({
            type: "Subscription",
            label: item.customer?.name || "Subscription",
            detail: item.customer?.name || "",
            to: `/subscriptions/${item.subscriptionNumber}`,
          })),
          ...visits.map((item) => ({
            type: "Visit",
            label: item.customer?.name || "Visit",
            detail: item.customer?.name || "",
            to: `/visits/${item.visitNumber}`,
          })),
        ].slice(0, 8),
      );
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [globalSearch]);

  const handleGlobalResult = (to) => {
    setGlobalSearch("");
    setGlobalSearchOpen(false);
    navigate(to);
  };

  /** Navigation routing handler */
  const handleNavigate = (to) => {
    navigate(to);
    if (isMobile) setMobileOpen(false);
  };

  /** Open user profile dropdown menu */
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  /** Close user profile dropdown menu */
  const handleMenuClose = () => setAnchorEl(null);
  /** End the current client session and return to the login screen. */
  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top Application Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1.5, px: { xs: 2, sm: 3 } }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: "none" } }}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>

          {/* Global Search Bar */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#F3F7F6",
              borderRadius: 1,
              px: 2,
              py: 0.65,
              flex: 1,
              maxWidth: "100%",
              border: "1px solid #DCE5E3",
              transition: "all 0.2s ease",
              "&:focus-within": {
                bgcolor: "#FFFFFF",
                borderColor: "primary.main",
                boxShadow: "0 0 0 3px rgba(15, 92, 87, 0.1)",
              },
            }}
          >
            <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
            <InputBase
              placeholder="Search customer name, mobile, or area..."
              sx={{ fontSize: "0.85rem", width: "100%" }}
              inputProps={{ "aria-label": "Global search" }}
              value={globalSearch}
              onChange={(event) => {
                setGlobalSearch(event.target.value);
                setGlobalSearchOpen(true);
              }}
              onFocus={() => setGlobalSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setGlobalSearchOpen(false);
              }}
            />
            <Chip
              label="/"
              size="small"
              sx={{
                height: 18,
                fontSize: "0.65rem",
                fontWeight: 700,
                bgcolor: "#E0E8E6",
                color: "text.secondary",
                px: 0.5,
              }}
            />
            {globalSearchOpen && globalSearch.trim() && (
              <Box
                sx={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  zIndex: theme.zIndex.modal,
                  bgcolor: "#FFFFFF",
                  border: "1px solid #DCE5E3",
                  borderRadius: 2,
                  boxShadow: "0 8px 24px rgba(16, 47, 45, 0.16)",
                  overflow: "hidden",
                }}
              >
                {globalResults.length ? (
                  globalResults.map((result) => (
                    <Box
                      key={`${result.type}-${result.to}`}
                      component="button"
                      type="button"
                      onClick={() => handleGlobalResult(result.to)}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        width: "100%",
                        px: 1.5,
                        py: 1,
                        border: 0,
                        borderBottom: "1px solid #EEF3F2",
                        bgcolor: "transparent",
                        textAlign: "left",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "#F3F7F6" },
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {result.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.type}
                        {result.detail ? ` · ${result.detail}` : ""}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ px: 1.5, py: 1.25 }}
                  >
                    No matching records
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* User Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1,
                width: 200,
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {currentUser.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser.email || "No email on file"}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={handleLogout}
              sx={{ fontSize: "0.85rem", gap: 1.5, py: 1, color: "error.main" }}
            >
              <LogoutOutlinedIcon fontSize="small" color="error" /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Side Navigation Drawer */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        isSuperAdmin={isSuperAdmin}
        currentUser={currentUser}
        onProfileMenuOpen={handleMenuOpen}
        width={DRAWER_WIDTH}
      />

      {/* Main Content View Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 3.5 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: "64px",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
