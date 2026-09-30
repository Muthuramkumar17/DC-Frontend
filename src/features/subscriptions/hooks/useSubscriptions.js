import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSubscriptions,
  getSubscriptionByNumber,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  getSubscriptionReceiptData,
} from "../api/subscriptions.api.js";
import { subscriptionKeys } from "../api/subscriptionKeys.js";

export function useSubscriptionsList(filters = {}) {
  return useQuery({
    queryKey: subscriptionKeys.list(filters),
    queryFn: () => listSubscriptions(filters),
  });
}

export function useSubscriptionReceiptData(subscription) {
  const subId = subscription?._id || subscription?.id;
  return useQuery({
    queryKey: subscriptionKeys.receipt(subId),
    queryFn: () => getSubscriptionReceiptData(subscription),
    enabled: Boolean(subId),
  });
}

export function useSubscriptionDetail(subscriptionNumber) {
  return useQuery({
    queryKey: subscriptionKeys.detail(subscriptionNumber),
    queryFn: () => getSubscriptionByNumber(subscriptionNumber),
    enabled: Boolean(subscriptionNumber),
  });
}

export function usePauseSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionNumber, pauseUntilDate, notes }) =>
      pauseSubscription(subscriptionNumber, pauseUntilDate, notes),
    onSuccess: (_, { subscriptionNumber }) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      if (subscriptionNumber) {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(subscriptionNumber) });
      }
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionNumber) => resumeSubscription(subscriptionNumber),
    onSuccess: (_, subscriptionNumber) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      if (subscriptionNumber) {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(subscriptionNumber) });
      }
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionNumber, reason }) =>
      cancelSubscription(subscriptionNumber, reason),
    onSuccess: (_, { subscriptionNumber }) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      if (subscriptionNumber) {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(subscriptionNumber) });
      }
    },
  });
}
