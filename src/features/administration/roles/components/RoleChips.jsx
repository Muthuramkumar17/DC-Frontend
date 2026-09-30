import React from "react";
import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

const COLORS = {
  green: "#1F8A55",
  gray: "#70807D",
};

export function BooleanFlag({ value, trueLabel = "Yes", falseLabel = "No" }) {
  return (
    <Chip size="small" label={value ? trueLabel : falseLabel}
      sx={{ color: value ? COLORS.green : COLORS.gray, backgroundColor: alpha(value ? COLORS.green : COLORS.gray, 0.1), height: 20, fontSize: 11 }} />
  );
}

export function StatusChip({ isActive }) {
  return (
    <Chip size="small" label={isActive ? "Active" : "Inactive"}
      sx={{ color: isActive ? COLORS.green : COLORS.gray, backgroundColor: alpha(isActive ? COLORS.green : COLORS.gray, 0.12), fontWeight: 600, height: 22, fontSize: 12 }} />
  );
}
