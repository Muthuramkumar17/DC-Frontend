import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPayments,
  recordPayment,
  reversePayment,
  getDailyCollection,
  fetchPaymentMethods,
} from "../api/payments.api.js";
import { paymentKeys } from "../api/paymentKeys.js";

export function usePaymentsList(filters = {}) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: () => listPayments(filters),
  });
}

export function useDailyCollection(date) {
  return useQuery({
    queryKey: paymentKeys.dailyCollection(date),
    queryFn: () => getDailyCollection(date),
    enabled: Boolean(date),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => recordPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

export function useReversePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentNumber, reason }) => reversePayment(paymentNumber, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentKeys.methods(),
    queryFn: () => fetchPaymentMethods(),
  });
}
