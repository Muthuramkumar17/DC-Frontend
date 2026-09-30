import { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { InlineSpinner } from "@/components/feedback/PageStates";
import ComingSoonPage from "@/components/feedback/ComingSoonPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import { getAuthToken, getCurrentUserApi, logout } from "@/features/auth/api/auth.api.js";
import { queryClient } from "@/app/queryClient.js";

const CustomerListPage = lazy(
  () => import("@/features/customers/pages/CustomerListPage"),
);
const CustomerProfilePage = lazy(
  () => import("@/features/customers/pages/CustomerProfilePage"),
);
const BookingListPage = lazy(
  () => import("@/features/bookings/pages/BookingListPage"),
);
const NewBookingPage = lazy(() => import("@/features/bookings/pages/NewBookingPage"));
const BookingDetailPage = lazy(
  () => import("@/features/bookings/pages/BookingDetailPage"),
);
const SubscriptionListPage = lazy(
  () => import("@/features/subscriptions/pages/SubscriptionListPage"),
);
const SubscriptionDetailPage = lazy(
  () => import("@/features/subscriptions/pages/SubscriptionDetailPage"),
);
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const ServiceCalendarPage = lazy(
  () => import("@/features/visits/pages/ServiceCalendarPage"),
);
const VisitDetailPage = lazy(() => import("@/features/visits/pages/VisitDetailPage"));
const PaymentListPage = lazy(
  () => import("@/features/payments/pages/PaymentListPage"),
);
const InvoiceListPage = lazy(
  () => import("@/features/invoices/pages/InvoiceListPage"),
);
const RolesPage = lazy(() => import("@/features/administration/roles/pages/RolesPage"));
const PermissionsPage = lazy(() => import("@/features/administration/permissions/pages/PermissionsPage"));
const SettingsPage = lazy(() => import("@/features/settings/pages/SettingsPage"));

function Suspended({ children }) {
  return <Suspense fallback={<InlineSpinner />}>{children}</Suspense>;
}

function isSuperAdminRole(roleName) {
  return typeof roleName === "string" && roleName.toLowerCase().includes("super");
}

function ProtectedSuperAdminRoute() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(null);

  useEffect(() => {
    let active = true;

    getCurrentUserApi()
      .then((user) => {
        if (!active) return;
        const roleName = user?.roleReference?.roleName || user?.role?.roleName || user?.role || "";
        setIsSuperAdmin(isSuperAdminRole(roleName));
      })
      .catch(() => {
        if (!active) return;
        setIsSuperAdmin(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (isSuperAdmin === null) {
    return <InlineSpinner />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function ProtectedAppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasAuthToken, setHasAuthToken] = useState(() => Boolean(getAuthToken()));
  const [authStatus, setAuthStatus] = useState(hasAuthToken ? "checking" : "guest");

  useEffect(() => {
    const redirectToLogin = () => {
      setHasAuthToken(false);
      setAuthStatus("guest");
      navigate("/login", {
        replace: true,
        state: { from: location.pathname + location.search },
      });
    };

    const handleLogoutEvent = () => {
      queryClient.clear();
      redirectToLogin();
    };
    const handleStorage = (event) => {
      if (event.key === "auth_token") {
        const isAuthPresent = Boolean(getAuthToken());
        setHasAuthToken(isAuthPresent);
        if (!isAuthPresent) {
          queryClient.clear();
          redirectToLogin();
        }
      }
    };

    window.addEventListener("auth_logout", handleLogoutEvent);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("auth_logout", handleLogoutEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, [navigate, location.pathname, location.search]);

  useEffect(() => {
    let cancelled = false;

    if (!hasAuthToken) {
      setAuthStatus("guest");
      return undefined;
    }

    setAuthStatus("checking");
    getCurrentUserApi()
      .then(() => {
        if (!cancelled) setAuthStatus("authed");
      })
      .catch(() => {
        if (cancelled) return;
        logout();
        setHasAuthToken(false);
        setAuthStatus("guest");
      });

    return () => {
      cancelled = true;
    };
  }, [hasAuthToken]);

  if (authStatus === "guest" || !hasAuthToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (authStatus === "checking") {
    return <InlineSpinner />;
  }

  return <AppShell />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedAppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Suspended>
              <DashboardPage />
            </Suspended>
          }
        />

        <Route
          path="/customers"
          element={
            <Suspended>
              <CustomerListPage />
            </Suspended>
          }
        />
        <Route
          path="/customers/:customerNumber"
          element={
            <Suspended>
              <CustomerProfilePage />
            </Suspended>
          }
        />

        <Route
          path="/bookings"
          element={
            <Suspended>
              <BookingListPage />
            </Suspended>
          }
        />
        <Route
          path="/bookings/new"
          element={
            <Suspended>
              <NewBookingPage />
            </Suspended>
          }
        />
        <Route
          path="/bookings/:bookingNumber"
          element={
            <Suspended>
              <BookingDetailPage />
            </Suspended>
          }
        />

        <Route
          path="/subscriptions"
          element={
            <Suspended>
              <SubscriptionListPage />
            </Suspended>
          }
        />
        <Route
          path="/subscriptions/:subscriptionNumber"
          element={
            <Suspended>
              <SubscriptionDetailPage />
            </Suspended>
          }
        />
        <Route
          path="/visits"
          element={<Navigate to="/visits/calendar" replace />}
        />
        <Route
          path="/visits/calendar"
          element={
            <Suspended>
              <ServiceCalendarPage />
            </Suspended>
          }
        />
        <Route
          path="/visits/:visitNumber"
          element={
            <Suspended>
              <VisitDetailPage />
            </Suspended>
          }
        />
        <Route
          path="/payments"
          element={
            <Suspended>
              <PaymentListPage />
            </Suspended>
          }
        />
        <Route
          path="/invoices"
          element={
            <Suspended>
              <InvoiceListPage />
            </Suspended>
          }
        />
        <Route path="/reports" element={<ComingSoonPage title="Reports" />} />
        <Route
          path="/masters/:masterType"
          element={<ComingSoonPage title="Masters" />}
        />
        <Route
          path="/admin/roles"
          element={
            <Suspended>
              <RolesPage />
            </Suspended>
          }
        />
        <Route
          path="/admin/permissions"
          element={
            <Suspended>
              <PermissionsPage />
            </Suspended>
          }
        />
        <Route
          path="/admin/*"
          element={<ComingSoonPage title="Administration" />}
        />
        <Route element={<ProtectedSuperAdminRoute />}>
          <Route
            path="/settings"
            element={
              <Suspended>
                <SettingsPage />
              </Suspended>
            }
          />
        </Route>
        <Route
          path="/download-center"
          element={<ComingSoonPage title="Download Center" />}
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
