import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClientProvider } from "@tanstack/react-query";

import theme from "@/theme/index";
import AppSnackbarProvider from "@/components/feedback/SnackbarProvider";
import GlobalPrintStyle from "@/components/layout/GlobalPrintStyle";
import { queryClient } from "./queryClient";

export function AppProviders({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalPrintStyle />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <QueryClientProvider client={queryClient}>
          <AppSnackbarProvider>{children}</AppSnackbarProvider>
        </QueryClientProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
