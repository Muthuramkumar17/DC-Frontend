import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loginApi, getCurrentUserApi, logout } from "../api/auth.api.js";
import { authKeys } from "../api/authKeys.js";

export function useCurrentUser(options = {}) {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUserApi,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useLogout() {
  return () => {
    logout();
  };
}
