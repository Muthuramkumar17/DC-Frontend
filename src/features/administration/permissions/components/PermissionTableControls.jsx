import React, { useState, useRef } from "react";
import {
  Paper, Grid, TextField, MenuItem, InputAdornment, Button, Tooltip, IconButton, Menu,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  GridToolbarContainer, GridToolbarColumnsButton, GridToolbarDensitySelector,
} from "@mui/x-data-grid";

import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

export function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ px: 1.5, py: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  );
}

export function RowActionsMenu({ row, can, onView, onEdit, onActivate, onDeactivate }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const close = () => setAnchorEl(null);
  return (
    <>
      <Tooltip title="More actions">
        <IconButton size="small" aria-label={`Actions for ${row.permissionCode}`} onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem onClick={() => { close(); onView(row); }}><VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View</MenuItem>
        {!row.isSystemPermission && can("PERMISSION.UPDATE") && (
          <MenuItem onClick={() => { close(); onEdit(row); }}><EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit</MenuItem>
        )}
        {!row.isSystemPermission && row.isActive && can("PERMISSION.DEACTIVATE") && (
          <MenuItem onClick={() => { close(); onDeactivate(row); }} sx={{ color: theme.palette.error.main }}><ToggleOffIcon fontSize="small" sx={{ mr: 1 }} /> Deactivate</MenuItem>
        )}
        {!row.isSystemPermission && !row.isActive && can("PERMISSION.ACTIVATE") && (
          <MenuItem onClick={() => { close(); onActivate(row); }}><ToggleOnIcon fontSize="small" sx={{ mr: 1 }} /> Activate</MenuItem>
        )}
      </Menu>
    </>
  );
}

export function FiltersBar({ filters, setFilters, modules, defaultFilters }) {
  const [local, setLocal] = useState(filters);
  const debounceRef = useRef(null);
  const updateSearch = (value) => {
    setLocal((s) => ({ ...s, search: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setFilters((f) => ({ ...f, search: value })), 350);
  };
  const apply = (patch) => { const next = { ...local, ...patch }; setLocal(next); setFilters(next); };
  const reset = () => { setLocal(defaultFilters); setFilters(defaultFilters); };
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth size="small" placeholder="Search permission code, description" value={local.search}
            onChange={(e) => updateSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
        </Grid>
        <Grid item xs={6} sm={3} md={2.5}>
          <TextField select fullWidth size="small" label="Module" value={local.module} onChange={(e) => apply({ module: e.target.value })}>
            <MenuItem value="ALL">All</MenuItem>
            {modules.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <TextField select fullWidth size="small" label="Status" value={local.status} onChange={(e) => apply({ status: e.target.value })}>
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Button size="small" startIcon={<FilterAltOffIcon />} onClick={reset}>Reset filters</Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
