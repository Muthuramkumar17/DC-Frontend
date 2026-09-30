import React, { useEffect } from "react";
import {
  Box, Stack, Typography, Button, IconButton, TextField, Chip, Drawer, Divider, Alert, List, ListItem, ListItemText,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import LockIcon from "@mui/icons-material/Lock";

import { StatusChip } from "./RoleChips";

const COLORS = {
  primary: "#0F5C57",
  heading: "#112220",
};

export const roleSchema = yup.object({
  roleCode: yup.string().trim().matches(/^[A-Z0-9_]+$/, "Use uppercase letters, numbers, and underscore only.").max(40).required("Role code is required."),
  roleName: yup.string().trim().max(80).required("Role name is required."),
  description: yup.string().max(240, "Maximum 240 characters."),
});

export function RoleFormDrawer({ open, mode, record, onClose, onSubmit, onRequestUnsavedGuard, submitting }) {
  const isEdit = mode === "edit";
  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: yupResolver(roleSchema),
    defaultValues: { roleCode: "", roleName: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      reset(isEdit && record
        ? { roleCode: record.roleCode, roleName: record.roleName, description: record.description }
        : { roleCode: "", roleName: "", description: "" });
    }
  }, [open, isEdit, record, reset]);

  const handleAttemptClose = () => {
    if (isDirty) onRequestUnsavedGuard();
    else onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleAttemptClose} PaperProps={{ sx: { width: { xs: "100%", sm: 460 } } }}>
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color={COLORS.heading}>
            {isEdit ? "Edit Role" : "Create Role"}
          </Typography>
          <IconButton onClick={handleAttemptClose} size="small"><CloseIcon /></IconButton>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2.5, flex: 1 }}>
          <TextField
            label="Role code"
            required
            disabled={isEdit || submitting}
            {...control.register("roleCode")}
            error={Boolean(errors.roleCode)}
            helperText={errors.roleCode?.message || "Uppercase alphanumeric and underscores."}
          />
          <TextField
            label="Role name"
            required
            disabled={submitting}
            {...control.register("roleName")}
            error={Boolean(errors.roleName)}
            helperText={errors.roleName?.message}
          />
          <TextField
            label="Description"
            multiline
            minRows={3}
            disabled={submitting}
            {...control.register("description")}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
          />

          <Box sx={{ mt: "auto", pt: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={handleAttemptClose} disabled={submitting}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {isEdit ? "Save changes" : "Create role"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

export function RoleDetailDrawer({ open, record, onClose, onEdit, onActivate, onDeactivate, can }) {
  if (!record) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 480 } } }}>
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight={700} color={COLORS.heading}>
              {record.roleName}
            </Typography>
            {record.isSystemRole && (
              <Chip size="small" icon={<LockIcon fontSize="small" />} label="System Role" color="default" />
            )}
          </Stack>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2} sx={{ flex: 1, overflowY: "auto" }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Role Code</Typography>
            <Typography variant="body2" fontWeight={600}>{record.roleCode}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Box sx={{ mt: 0.5 }}><StatusChip isActive={record.isActive} /></Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Description</Typography>
            <Typography variant="body2">{record.description || "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Permissions ({record.permissionCodes?.length || 0})</Typography>
            <List dense sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid #E0E0E0", borderRadius: 2, mt: 1 }}>
              {(record.permissionCodes || []).map((code) => (
                <ListItem key={code}><ListItemText primary={code} primaryTypographyProps={{ variant: "caption" }} /></ListItem>
              ))}
            </List>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          {!record.isSystemRole && can("ROLE.UPDATE") && (
            <Button startIcon={<EditIcon />} onClick={() => { onClose(); onEdit(record); }}>Edit</Button>
          )}
          {!record.isSystemRole && record.isActive && can("ROLE.DEACTIVATE") && (
            <Button color="error" startIcon={<ToggleOffIcon />} onClick={() => { onClose(); onDeactivate(record); }}>Deactivate</Button>
          )}
          {!record.isSystemRole && !record.isActive && can("ROLE.ACTIVATE") && (
            <Button color="success" startIcon={<ToggleOnIcon />} onClick={() => { onClose(); onActivate(record); }}>Activate</Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
