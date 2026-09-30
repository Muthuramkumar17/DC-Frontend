import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Stack, Paper, Typography,
  Button, IconButton, Tooltip, Snackbar, Alert,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

import PageHeader from "@/components/layout/PageHeader";
import {
  BooleanFlag, StatusChip, ModuleChip,
  CustomToolbar, RowActionsMenu, FiltersBar,
  PermissionFormDrawer, PermissionDetailDrawer,
  DeactivateDialog, UnsavedChangesDialog,
} from "../components";

const MODULES = ["MASTER.COMPONENT", "MASTER.SUBCOMPONENT", "USER", "PETTY_CASH.ENTRY", "PETTY_CASH.REIMBURSEMENT"];
const DEFAULT_FILTERS = { search: "", module: "ALL", status: "ALL" };

function seedMockPermissions() {
  const raw = [
    ["MASTER.COMPONENT.VIEW", "MASTER.COMPONENT", "View Components list and details."],
    ["MASTER.COMPONENT.CREATE", "MASTER.COMPONENT", "Create new Components."],
    ["MASTER.COMPONENT.UPDATE", "MASTER.COMPONENT", "Edit existing Components."],
    ["MASTER.COMPONENT.ACTIVATE", "MASTER.COMPONENT", "Reactivate a deactivated Component."],
    ["MASTER.COMPONENT.DEACTIVATE", "MASTER.COMPONENT", "Deactivate a Component."],
    ["MASTER.SUBCOMPONENT.VIEW", "MASTER.SUBCOMPONENT", "View Subcomponents list and details."],
    ["MASTER.SUBCOMPONENT.CREATE", "MASTER.SUBCOMPONENT", "Create new Subcomponents."],
    ["MASTER.SUBCOMPONENT.UPDATE", "MASTER.SUBCOMPONENT", "Edit existing Subcomponents."],
    ["MASTER.SUBCOMPONENT.ACTIVATE", "MASTER.SUBCOMPONENT", "Reactivate a deactivated Subcomponent."],
    ["MASTER.SUBCOMPONENT.DEACTIVATE", "MASTER.SUBCOMPONENT", "Deactivate a Subcomponent."],
    ["USER.VIEW", "USER", "View Users list and details."],
    ["USER.CREATE", "USER", "Create new Users."],
    ["USER.UPDATE", "USER", "Edit existing Users."],
    ["USER.ACTIVATE", "USER", "Reactivate a deactivated User."],
    ["USER.DEACTIVATE", "USER", "Deactivate a User."],
    ["USER.PERMISSION.VIEW", "USER", "View a User's effective permissions."],
    ["PETTY_CASH.ENTRY.VIEW", "PETTY_CASH.ENTRY", "View Petty Cash Entries list and details."],
    ["PETTY_CASH.ENTRY.CREATE", "PETTY_CASH.ENTRY", "Create an Entry Draft."],
    ["PETTY_CASH.ENTRY.UPDATE_DRAFT", "PETTY_CASH.ENTRY", "Edit a Draft Entry."],
    ["PETTY_CASH.ENTRY.POST", "PETTY_CASH.ENTRY", "Post a Draft Entry."],
    ["PETTY_CASH.ENTRY.VOID", "PETTY_CASH.ENTRY", "Void a Posted Entry."],
    ["PETTY_CASH.REIMBURSEMENT.CREATE", "PETTY_CASH.REIMBURSEMENT", "Create a Reimbursement Draft."],
    ["PETTY_CASH.REIMBURSEMENT.VIEW", "PETTY_CASH.REIMBURSEMENT", "View Reimbursement entries."],
  ];
  return raw.map(([permissionCode, module, description], i) => ({
    id: `perm-${i}`, version: 1, permissionCode, module, description,
    isSystemPermission: true, isActive: true, roleCount: [1, 2, 3][i % 3],
    createdAt: dayjs().subtract(120, "day").toISOString(), updatedAt: dayjs().subtract(10 + i, "day").toISOString(),
  }));
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

function useMockAuthPermissions() {
  const granted = useMemo(() => new Set(["PERMISSION.VIEW", "PERMISSION.CREATE", "PERMISSION.UPDATE", "PERMISSION.ACTIVATE", "PERMISSION.DEACTIVATE"]), []);
  const can = useCallback((c) => granted.has(c), [granted]);
  return { can };
}

function useMockSnackbar() {
  const [state, setState] = useState({ open: false, message: "", severity: "success" });
  const notify = useCallback((message, severity = "success") => setState({ open: true, message, severity }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  return { state, notify, close };
}

function useMockPermissionsCatalog() {
  const allRef = useRef(seedMockPermissions());
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });

  const applyFilters = useCallback((rows, f) => rows.filter((r) => {
    if (f.search) {
      const hay = `${r.permissionCode} ${r.description}`.toLowerCase();
      if (!hay.includes(f.search.toLowerCase())) return false;
    }
    if (f.module !== "ALL" && r.module !== f.module) return false;
    if (f.status !== "ALL" && String(r.isActive) !== f.status) return false;
    return true;
  }), []);

  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      await delay(300);
      const filtered = applyFilters(allRef.current, filters);
      const start = pagination.page * pagination.pageSize;
      setRowCount(filtered.length);
      setData(filtered.slice(start, start + pagination.pageSize));
    } catch { setError({ message: "Unable to load permissions." }); }
    finally { setLoading(false); }
  }, [applyFilters, filters, pagination]);

  useEffect(() => { reload(); }, [filters, pagination]);

  const createRecord = useCallback(async (payload) => {
    await delay(350);
    const record = {
      id: `perm-${allRef.current.length}`, version: 1, isSystemPermission: false, isActive: true, roleCount: 0,
      ...payload, createdAt: dayjs().toISOString(), updatedAt: dayjs().toISOString(),
    };
    allRef.current = [record, ...allRef.current];
    return record;
  }, []);

  const updateRecord = useCallback(async (id, payload, version) => {
    await delay(300);
    let updated = null;
    allRef.current = allRef.current.map((r) => {
      if (r.id !== id) return r;
      if (r.version !== version) { const e = new Error("Version conflict"); e.status = 409; throw e; }
      updated = { ...r, ...payload, version: r.version + 1, updatedAt: dayjs().toISOString() };
      return updated;
    });
    return updated;
  }, []);

  const activateRecord = useCallback(async (id) => {
    await delay(300);
    allRef.current = allRef.current.map((r) => (r.id === id ? { ...r, isActive: true, version: r.version + 1, updatedAt: dayjs().toISOString() } : r));
  }, []);

  const deactivateRecord = useCallback(async (id, version, reason) => {
    await delay(300);
    allRef.current = allRef.current.map((r) => (r.id === id ? { ...r, isActive: false, version: r.version + 1, deactivationReason: reason, updatedAt: dayjs().toISOString() } : r));
  }, []);

  return { data, rowCount, loading, error, pagination, setPagination, filters, setFilters, reload, createRecord, updateRecord, activateRecord, deactivateRecord };
}

function formatDateTime(v) { return v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "—"; }

export default function PermissionsPage() {
  const theme = useTheme();
  const { can } = useMockAuthPermissions();
  const snackbar = useMockSnackbar();
  const {
    data, rowCount, loading, error, pagination, setPagination, filters, setFilters,
    reload, createRecord, updateRecord, activateRecord, deactivateRecord,
  } = useMockPermissionsCatalog();

  const [formDrawer, setFormDrawer] = useState({ open: false, mode: "create", record: null });
  const [detailDrawer, setDetailDrawer] = useState({ open: false, record: null });
  const [deactivateDialog, setDeactivateDialog] = useState({ open: false, record: null });
  const [unsavedGuard, setUnsavedGuard] = useState({ open: false, onDiscard: null });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => setFormDrawer({ open: true, mode: "create", record: null });
  const openEdit = (record) => setFormDrawer({ open: true, mode: "edit", record });
  const closeForm = () => setFormDrawer((s) => ({ ...s, open: false }));
  const requestUnsavedGuard = (onDiscard) => setUnsavedGuard({ open: true, onDiscard });

  const submitForm = async (values) => {
    setSubmitting(true);
    try {
      if (formDrawer.mode === "create") { await createRecord(values); snackbar.notify("Permission created successfully."); }
      else { await updateRecord(formDrawer.record.id, values, formDrawer.record.version); snackbar.notify("Changes saved successfully."); }
      closeForm(); reload();
    } catch (e) {
      snackbar.notify(e.status === 409 ? "This permission changed since you opened it. Reload and retry." : "Unable to save permission.", "error");
    } finally { setSubmitting(false); }
  };

  const doActivate = async (row) => {
    setSubmitting(true);
    try { await activateRecord(row.id); snackbar.notify("Permission activated successfully."); setDetailDrawer({ open: false, record: null }); reload(); }
    catch { snackbar.notify("Unable to activate permission.", "error"); }
    finally { setSubmitting(false); }
  };

  const doDeactivate = async (reason) => {
    setSubmitting(true);
    try {
      await deactivateRecord(deactivateDialog.record.id, deactivateDialog.record.version, reason);
      snackbar.notify("Permission deactivated successfully.");
      setDeactivateDialog({ open: false, record: null });
      setDetailDrawer({ open: false, record: null });
      reload();
    } catch { snackbar.notify("Unable to deactivate permission.", "error"); }
    finally { setSubmitting(false); }
  };

  const columns = useMemo(() => [
    {
      field: "permissionCode",
      headerName: "Permission Code",
      width: 250,
      renderCell: (p) => (
        <Typography variant="body2" sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: theme.palette.text.primary }}>
          {p.value}
        </Typography>
      ),
    },
    { field: "module", headerName: "Module", width: 180, renderCell: (p) => <ModuleChip module={p.value} /> },
    { field: "description", headerName: "Description", width: 280 },
    { field: "isSystemPermission", headerName: "System", width: 100, renderCell: (p) => <BooleanFlag value={p.value} /> },
    { field: "roleCount", headerName: "Used By Roles", width: 130, align: "right", headerAlign: "right" },
    { field: "isActive", headerName: "Status", width: 110, renderCell: (p) => <StatusChip isActive={p.value} /> },
    { field: "updatedAt", headerName: "Updated", width: 180, valueFormatter: (p) => formatDateTime(p.value) },
    {
      field: "actions", headerName: "Actions", width: 90, sortable: false, filterable: false, align: "right", headerAlign: "right",
      renderCell: (p) => (
        <RowActionsMenu row={p.row} can={can}
          onView={(row) => setDetailDrawer({ open: true, record: row })}
          onEdit={(row) => openEdit(row)}
          onActivate={(row) => doActivate(row)}
          onDeactivate={(row) => setDeactivateDialog({ open: true, record: row })}
        />
      ),
    },
  ], [can, theme.palette.text.primary]);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, sm: 3.5 } }}>
      <PageHeader
        title="Permissions"
        subtitle="Catalog of permission codes used to build Roles. System codes are protected."
        breadcrumbs={[
          { label: "Access Control" },
          { label: "Permissions" },
        ]}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh permissions">
              <IconButton onClick={reload} aria-label="Refresh permissions">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {can("PERMISSION.CREATE") && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                Add Permission
              </Button>
            )}
          </Stack>
        }
      />

      <FiltersBar filters={filters} setFilters={setFilters} modules={MODULES} defaultFilters={DEFAULT_FILTERS} />

      {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button size="small" onClick={reload}>Retry</Button>}>{error.message}</Alert>}

      <Paper variant="outlined" sx={{ borderRadius: 1, overflow: "hidden" }}>
        <DataGrid
          autoHeight
          rows={data}
          columns={columns}
          loading={loading}
          density="compact"
          rowHeight={48}
          disableRowSelectionOnClick
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          pageSizeOptions={[10, 25, 50]}
          slots={{ toolbar: CustomToolbar }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#F3F7F6",
              borderBottom: `1px solid ${theme.palette.divider}`,
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
                color: theme.palette.text.secondary,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              },
            },
            "& .MuiDataGrid-row": {
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              },
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
          }}
          localeText={{ noRowsLabel: "No permissions found." }}
        />
      </Paper>

      <PermissionFormDrawer open={formDrawer.open} mode={formDrawer.mode} record={formDrawer.record} onClose={closeForm}
        onSubmit={submitForm} onRequestUnsavedGuard={requestUnsavedGuard} submitting={submitting} modules={MODULES} />

      <PermissionDetailDrawer open={detailDrawer.open} record={detailDrawer.record} onClose={() => setDetailDrawer({ open: false, record: null })}
        can={can} onEdit={(r) => { setDetailDrawer({ open: false, record: null }); openEdit(r); }}
        onActivate={doActivate} onDeactivate={(r) => setDeactivateDialog({ open: true, record: r })} formatDateTime={formatDateTime} />

      <DeactivateDialog open={deactivateDialog.open} record={deactivateDialog.record}
        onClose={() => setDeactivateDialog({ open: false, record: null })} onConfirm={doDeactivate} submitting={submitting} />

      <UnsavedChangesDialog open={unsavedGuard.open} onKeepEditing={() => setUnsavedGuard({ open: false, onDiscard: null })}
        onDiscard={() => { unsavedGuard.onDiscard && unsavedGuard.onDiscard(); setUnsavedGuard({ open: false, onDiscard: null }); }} />

      <Snackbar open={snackbar.state.open} autoHideDuration={3000} onClose={snackbar.close} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={snackbar.close} severity={snackbar.state.severity} sx={{ width: "100%" }}>{snackbar.state.message}</Alert>
      </Snackbar>
    </Box>
  );
}
