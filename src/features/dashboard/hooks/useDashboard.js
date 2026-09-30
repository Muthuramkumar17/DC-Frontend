import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../api/dashboard.api.js";
import { dashboardKeys } from "../api/dashboardKeys.js";

export function useDashboardSummary(date) {
  return useQuery({
    queryKey: dashboardKeys.summary(date),
    queryFn: () => getDashboardSummary({ date }),
  });
}
