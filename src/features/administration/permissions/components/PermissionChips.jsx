import React from "react";
import { Chip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

export function BooleanFlag({ value, trueLabel = "Yes", falseLabel = "No" }) {
  const theme = useTheme();
  const color = value ? theme.palette.success.main : theme.palette.text.secondary;
  return (
    <Chip
      size="small"
      label={value ? trueLabel : falseLabel}
      sx={{ color, backgroundColor: alpha(color, 0.1), height: 20, fontSize: 11, fontWeight: 600 }}
    />
  );
}

export function StatusChip({ isActive }) {
  const theme = useTheme();
  const color = isActive ? theme.palette.success.main : theme.palette.text.secondary;
  return (
    <Chip
      size="small"
      label={isActive ? "Active" : "Inactive"}
      sx={{ color, backgroundColor: alpha(color, 0.12), fontWeight: 600, height: 22, fontSize: 12 }}
    />
  );
}

export function ModuleChip({ module }) {
  const theme = useTheme();
  return (
    <Chip
      size="small"
      label={module}
      sx={{
        color: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        fontWeight: 600,
        height: 22,
        fontSize: 11,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    />
  );
}
