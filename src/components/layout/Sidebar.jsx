import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Collapse from "@mui/material/Collapse";
import { useTheme, alpha } from "@mui/material/styles";

import jollyLogo from "@/assets/logo/Jollydark.png";
import {
  DashboardOutlinedIcon,
  PeopleAltOutlinedIcon,
  EventNoteOutlinedIcon,
  AutorenewOutlinedIcon,
  CalendarMonthOutlinedIcon,
  ReceiptLongOutlinedIcon,
  SettingsOutlinedIcon,
  ExpandLessIcon,
  ExpandMoreIcon,
  NotificationsOutlinedIcon,
} from "@/theme/icons";
import { initials } from "@/utils/format";

export const DRAWER_WIDTH = 220;

function getNavSections(isSuperAdmin) {
  return [
    {
      title: "MAIN",
      items: [
        { label: "Dashboard", to: "/dashboard", icon: DashboardOutlinedIcon },
        { label: "Customers", to: "/customers", icon: PeopleAltOutlinedIcon },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        { label: "Bookings", to: "/bookings", icon: EventNoteOutlinedIcon },
        {
          label: "Subscriptions",
          to: "/subscriptions",
          icon: AutorenewOutlinedIcon,
        },
        {
          label: "Visit Calendar",
          to: "/visits/calendar",
          icon: CalendarMonthOutlinedIcon,
        },
      ],
    },
    {
      title: "TAX INVOICE",
      items: [
        { label: "Invoices", to: "/invoices", icon: ReceiptLongOutlinedIcon },
      ],
    },
    ...(isSuperAdmin
  ? [
      {
        title: "CONFIGURATION",
        items: [
          {
            label: "Settings",
            to: "/settings",
            icon: SettingsOutlinedIcon,
          },
        ],
      },
    ]
  : []),
  ];
}

function NavGroup({ item, currentPath, onNavigate }) {
  const theme = useTheme();
  const [openGroup, setOpenGroup] = useState(
    item.children
      ? item.children.some((c) => currentPath.startsWith(c.to))
      : false,
  );
  const Icon = item.icon;

  return (
    <>
      <ListItemButton
        onClick={() => setOpenGroup((o) => !o)}
        sx={{
          mx: 1.2,
          mb: 0.5,
          borderRadius: 2,
          color: "text.primary",
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
        }}
      >
        <ListItemIcon sx={{ color: "text.secondary", minWidth: 34 }}>
          <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
          primary={item.label}
        />
        {openGroup ? (
          <ExpandLessIcon fontSize="small" sx={{ opacity: 0.7 }} />
        ) : (
          <ExpandMoreIcon fontSize="small" sx={{ opacity: 0.7 }} />
        )}
      </ListItemButton>

      <Collapse in={openGroup} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.children.map((child) => {
            const selected = currentPath === child.to;
            return (
              <ListItemButton
                key={child.to}
                selected={selected}
                onClick={() => onNavigate(child.to)}
                sx={{
                  pl: 5.5,
                  mx: 1.2,
                  mb: 0.25,
                  borderRadius: 1.75,
                  color: selected ? "primary.main" : "text.secondary",
                  bgcolor: selected
                    ? alpha(theme.palette.primary.main, 0.12)
                    : "transparent",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "0.825rem",
                    fontWeight: selected ? 600 : 400,
                  }}
                  primary={child.label}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </>
  );
}

function DrawerContent({
  currentPath,
  onNavigate,
  isSuperAdmin,
  currentUser,
  onProfileMenuOpen,
}) {
  const theme = useTheme();
  const navSections = getNavSections(isSuperAdmin);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand Header */}
      <Toolbar sx={{ gap: 1.5, px: 2.5, minHeight: "64px !important" }}>
        <Box
          component="img"
          src={jollyLogo}
          alt="Jolly Home Needs"
          sx={{
            width: 180,
            height: 84,
            objectFit: "contain",
            objectPosition: "left center",
          }}
        />
      </Toolbar>

      {/* Navigation List grouped by operational domain */}
      <List sx={{ flex: 1, py: 1.5, px: 0, overflowY: "auto" }}>
        {navSections.map((section) => (
          <Box key={section.title} sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                px: 2.5,
                py: 0.5,
                display: "block",
                fontSize: "0.675rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: theme.palette.primary.contrastText,
                opacity: 0.9,
              }}
            >
              {section.title}
            </Typography>

            {section.items.map((item) => {
              if (item.children) {
                return (
                  <NavGroup
                    key={item.label}
                    item={item}
                    currentPath={currentPath}
                    onNavigate={onNavigate}
                  />
                );
              }

              const selected =
                currentPath === item.to ||
                (item.to !== "/" && currentPath.startsWith(item.to + "/"));

              return (
                <ListItemButton
                  key={item.to}
                  selected={selected}
                  onClick={() => onNavigate(item.to)}
                  sx={{
                    mx: 1.2,
                    mb: 0.35,
                    borderRadius: 2,
                    color: selected
                      ? theme.palette.primary.contrastText
                      : "#EAF6F4",
                    position: "relative",
                    bgcolor: selected
                      ? alpha(theme.palette.primary.dark, 0.35)
                      : "transparent",
                    boxShadow: selected
                      ? `0 2px 8px ${alpha(theme.palette.primary.dark, 0.2)}`
                      : "none",
                    "&:hover": {
                      bgcolor: selected
                        ? alpha(theme.palette.primary.dark, 0.45)
                        : alpha(theme.palette.primary.contrastText, 0.08),
                    },
                    "&::before": selected
                      ? {
                          content: '""',
                          position: "absolute",
                          left: -6,
                          top: 8,
                          bottom: 8,
                          width: 4,
                          borderRadius: 2,
                          bgcolor: theme.palette.primary.contrastText,
                        }
                      : {},
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: selected
                        ? theme.palette.primary.contrastText
                        : "#DFF1ED",
                      minWidth: 34,
                      opacity: selected ? 1 : 0.9,
                    }}
                  >
                    <item.icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: selected ? 600 : 500,
                    }}
                    primary={item.label}
                  />
                </ListItemButton>
              );
            })}
          </Box>
        ))}
      </List>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1,
          borderTop: `1px solid ${alpha(theme.palette.primary.contrastText, 0.16)}`,
        }}
      >
        <Tooltip title="Account menu">
          <ListItemButton
            onClick={onProfileMenuOpen}
            aria-label="Open account menu"
            sx={{
              minWidth: 0,
              p: 0.15,
              borderRadius: 2,
              color: "#EAF6F4",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.contrastText, 0.08),
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 0.75,
                fontSize: "0.75rem",
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.contrastText, 0.16),
                color: "#FFFFFF",
              }}
            >
              {initials(currentUser?.name)}
            </Avatar>
            <ListItemText
              primary={currentUser?.name || "System User"}
              secondary={currentUser?.role || ""}
              primaryTypographyProps={{
                noWrap: true,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
              secondaryTypographyProps={{
                noWrap: true,
                fontSize: "0.65rem",
                sx: { color: alpha(theme.palette.primary.contrastText, 0.7) },
              }}
              sx={{ minWidth: 0, my: 0 }}
            />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
  currentPath,
  onNavigate,
  isSuperAdmin = false,
  currentUser,
  onProfileMenuOpen,
  width = DRAWER_WIDTH,
}) {
  const theme = useTheme();

  return (
    <Box
      component="nav"
      sx={{ width: { md: width }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width,
            background: theme.palette.primary.main,
            borderRight: `1px solid ${theme.palette.primary.dark}`,
          },
        }}
      >
        <DrawerContent
          currentPath={currentPath}
          onNavigate={onNavigate}
          isSuperAdmin={isSuperAdmin}
          currentUser={currentUser}
          onProfileMenuOpen={onProfileMenuOpen}
        />
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            background: theme.palette.primary.main,
            borderRight: `1px solid ${theme.palette.primary.dark}`,
          },
        }}
        open
      >
        <DrawerContent
          currentPath={currentPath}
          onNavigate={onNavigate}
          isSuperAdmin={isSuperAdmin}
          currentUser={currentUser}
          onProfileMenuOpen={onProfileMenuOpen}
        />
      </Drawer>
    </Box>
  );
}
