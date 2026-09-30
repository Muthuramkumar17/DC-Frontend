import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBathroomConfigs, saveBathroomConfig } from "../api/settings.api.js";
import { settingKeys } from "../api/settingKeys.js";

export function useBathroomConfigs() {
  return useQuery({
    queryKey: settingKeys.bathroomConfigs(),
    queryFn: fetchBathroomConfigs,
  });
}

export function useSaveBathroomConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item) => saveBathroomConfig(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.all });
    },
  });
}
