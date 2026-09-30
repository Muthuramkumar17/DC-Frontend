import React, { useEffect } from "react";
import {
  Box, Stack, Typography, Button, IconButton, TextField, MenuItem,
  Chip, Drawer, Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import LockIcon from "@mui/icons-material/Lock";

import { ModuleChip, StatusChip } from "./PermissionChips";

export const permissionSchema = yup.object({
  permissionCode: yup.string().trim().matches(/^[A-Z0-9_.]+$/, "Use uppercase letters, numbers, dot and underscore only.").max(80).required("Permission code is required."),
  module: yup.string().required("Module is required."),
  description: yup.string().max(200, "Maximum 200 characters."),
});

export function PermissionFormDrawer({ open, mode, record, onClose, onSubmit, onRequestUnsavedGuard, submitting, modules }) {
  const theme = useTheme();
  const isEdit = mode === "edit";
  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: yupResolver(permissionSchema),
    defaultValues: { permissionCode: "", module: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      reset(isEdit && record
        ? { permissionCode: record.permissionCode, module: record.module, description: record.description }
        : { permissionCode: "", module: "", description: "" });
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
          <Typography variant="h6" fontWeight={700}>
            {isEdit ? "Edit Permission" : "Create Permission"}
          </Typography>
          <IconButton onClick={handleAttemptClose} size="small"><CloseIcon /></IconButton>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2.5, flex: 1 }}>
          <TextField
            label="Permission code"
            required
            disabled={isEdit || submitting}
            {...control.register("permissionCode")}
            error={Boolean(errors.permissionCode)}
            helperText={errors.permissionCode?.message || "Uppercase code format."}
          />
          <Controller
            name="module"
            control={control}
            render={({ field }) => (
              <TextField select label="Module" required disabled={submitting} {...field} error={Boolean(errors.module)}>
                {modules.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            )}
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
                {isEdit ? "Save changes" : "Create permission"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

export function PermissionDetailDrawer({ open, record, onClose, onEdit, onActivate, onDeactivate, can }) {
  if (!record) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 480 } } }}>
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight={700}>
              {record.permissionCode}
            </Typography>
            {record.isSystemPermission && (
              <Chip size="small" icon={<LockIcon fontSize="small" />} label="System" color="default" />
            )}
          </Stack>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2} sx={{ flex: 1, overflowY: "auto" }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Module</Typography>
            <Box sx={{ mt: 0.5 }}><ModuleChip module={record.module} /></Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Box sx={{ mt: 0.5 }}><StatusChip isActive={record.isActive} /></Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Description</Typography>
            <Typography variant="body2">{record.description || "—"}</Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          {!record.isSystemPermission && can("PERMISSION.UPDATE") && (
            <Button startIcon={<EditIcon />} onClick={() => { onClose(); onEdit(record); }}>Edit</Button>
          )}
          {!record.isSystemPermission && record.isActive && can("PERMISSION.DEACTIVATE") && (
            <Button color="error" startIcon={<ToggleOffIcon />} onClick={() => { onClose(); onDeactivate(record); }}>Deactivate</Button>
          )}
          {!record.isSystemPermission && !record.isActive && can("PERMISSION.ACTIVATE") && (
            <Button color="success" startIcon={<ToggleOnIcon />} onClick={() => { onClose(); onActivate(record); }}>Activate</Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
