import React, { useMemo, useState } from "react";
import {
  Stack, Paper, Typography, Button, IconButton, Tooltip, Snackbar, Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import RuleIcon from "@mui/icons-material/Rule";

import PageHeader from "@/components/layout/PageHeader";
import {
  BooleanFlag, StatusChip,
  CustomToolbar, RowActionsMenu, FiltersBar,
  RoleFormDrawer, RoleDetailDrawer,
  DeactivateDialog, UnsavedChangesDialog,
  useMockPermissions, useMockSnackbar, useMockRoles,
  DEFAULT_FILTERS, formatDateTime,
} from "../components";

export default function RolesPage() {
  const { can } = useMockPermissions();
  const snackbar = useMockSnackbar();
  const {
    data, rowCount, loading, error, pagination, setPagination, filters, setFilters,
    reload, createRecord, updateRecord, activateRecord, deactivateRecord,
  } = useMockRoles();

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
      if (formDrawer.mode === "create") {
        await createRecord(values);
        snackbar.notify("Role created successfully.");
      } else {
        await updateRecord(formDrawer.record.id, values, formDrawer.record.version);
        snackbar.notify("Changes saved successfully.");
      }
      closeForm();
      reload();
    } catch (e) {
      snackbar.notify(
        e.status === 409
          ? "This role changed since you opened it. Reload and retry."
          : "Unable to save role.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const doActivate = async (row) => {
    setSubmitting(true);
    try {
      await activateRecord(row.id, row.version);
      snackbar.notify("Role activated successfully.");
      setDetailDrawer({ open: false, record: null });
      reload();
    } catch {
      snackbar.notify("Unable to activate role.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const doDeactivate = async (reason) => {
    setSubmitting(true);
    try {
      await deactivateRecord(
        deactivateDialog.record.id,
        deactivateDialog.record.version,
        reason
      );
      snackbar.notify("Role deactivated successfully.");
      setDeactivateDialog({ open: false, record: null });
      setDetailDrawer({ open: false, record: null });
      reload();
    } catch {
      snackbar.notify("Unable to deactivate role.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      { field: "roleCode", headerName: "Role Code", width: 160 },
      {
        field: "roleName",
        headerName: "Role Name",
        width: 170,
        renderCell: (p) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {p.value}
          </Typography>
        ),
      },
      { field: "description", headerName: "Description", flex: 1, minWidth: 240 },
      { field: "isSystemRole", headerName: "System Role", width: 130, renderCell: (p) => <BooleanFlag value={p.value} /> },
      { field: "permissionCodes", headerName: "Permissions", width: 120, align: "right", headerAlign: "right", valueGetter: (p) => p.row.permissionCodes.length },
      { field: "isActive", headerName: "Status", width: 110, renderCell: (p) => <StatusChip isActive={p.value} /> },
      { field: "updatedAt", headerName: "Updated", width: 170, valueFormatter: (p) => formatDateTime(p.value) },
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
    ],
    [can]
  );

  return (
    <>
      <PageHeader
        title="Roles & Security"
        subtitle="Configure default permission bundles assignable to system users."
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={reload} aria-label="Refresh roles">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open Role–Permission Matrix">
              <IconButton aria-label="Open role permission matrix">
                <RuleIcon />
              </IconButton>
            </Tooltip>
            {can("ROLE.CREATE") && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                Add Role
              </Button>
            )}
          </Stack>
        }
      />

      <FiltersBar filters={filters} setFilters={setFilters} defaultFilters={DEFAULT_FILTERS} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button size="small" onClick={reload}>Retry</Button>}>
          {error.message}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", height: 580 }}>
        <DataGrid
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
            "& .MuiDataGrid-row": { "&:hover": { bgcolor: "#F3F7F6" } },
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#F3F7F6" },
          }}
          localeText={{ noRowsLabel: "No roles found." }}
        />
      </Paper>

      <RoleFormDrawer
        open={formDrawer.open}
        mode={formDrawer.mode}
        record={formDrawer.record}
        onClose={closeForm}
        onSubmit={submitForm}
        onRequestUnsavedGuard={requestUnsavedGuard}
        submitting={submitting}
      />

      <RoleDetailDrawer
        open={detailDrawer.open}
        record={detailDrawer.record}
        onClose={() => setDetailDrawer({ open: false, record: null })}
        can={can}
        onEdit={(r) => {
          setDetailDrawer({ open: false, record: null });
          openEdit(r);
        }}
        onActivate={doActivate}
        onDeactivate={(r) => setDeactivateDialog({ open: true, record: r })}
        formatDateTime={formatDateTime}
      />

      <DeactivateDialog
        open={deactivateDialog.open}
        record={deactivateDialog.record}
        onClose={() => setDeactivateDialog({ open: false, record: null })}
        onConfirm={doDeactivate}
        submitting={submitting}
      />

      <UnsavedChangesDialog
        open={unsavedGuard.open}
        onKeepEditing={() => setUnsavedGuard({ open: false, onDiscard: null })}
        onDiscard={() => {
          unsavedGuard.onDiscard && unsavedGuard.onDiscard();
          setUnsavedGuard({ open: false, onDiscard: null });
        }}
      />

      <Snackbar
        open={snackbar.state.open}
        autoHideDuration={3000}
        onClose={snackbar.close}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={snackbar.close} severity={snackbar.state.severity} sx={{ width: "100%" }}>
          {snackbar.state.message}
        </Alert>
      </Snackbar>
    </>
  );
}
