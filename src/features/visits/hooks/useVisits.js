import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listVisits,
  getVisitByNumber,
  completeVisit,
  rescheduleVisit,
  cancelVisit,
  updateVisit,
  batchCompleteVisits,
} from "../api/visits.api.js";
import { visitKeys } from "../api/visitKeys.js";

export function useVisitsList(filters = {}) {
  return useQuery({
    queryKey: visitKeys.list(filters),
    queryFn: () => listVisits(filters),
  });
}

export function useVisitDetail(visitNumber) {
  return useQuery({
    queryKey: visitKeys.detail(visitNumber),
    queryFn: () => getVisitByNumber(visitNumber),
    enabled: Boolean(visitNumber),
  });
}

export function useCompleteVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitNumber, payload }) => completeVisit(visitNumber, payload),
    onSuccess: (_, { visitNumber }) => {
      queryClient.invalidateQueries({ queryKey: visitKeys.all });
      if (visitNumber) {
        queryClient.invalidateQueries({ queryKey: visitKeys.detail(visitNumber) });
      }
    },
  });
}

export function useRescheduleVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitNumber, payload }) => rescheduleVisit(visitNumber, payload),
    onSuccess: (_, { visitNumber }) => {
      queryClient.invalidateQueries({ queryKey: visitKeys.all });
      if (visitNumber) {
        queryClient.invalidateQueries({ queryKey: visitKeys.detail(visitNumber) });
      }
    },
  });
}

export function useCancelVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitNumber, reason }) => cancelVisit(visitNumber, reason),
    onSuccess: (_, { visitNumber }) => {
      queryClient.invalidateQueries({ queryKey: visitKeys.all });
      if (visitNumber) {
        queryClient.invalidateQueries({ queryKey: visitKeys.detail(visitNumber) });
      }
    },
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }) => updateVisit(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitKeys.all });
    },
  });
}

export function useBatchCompleteVisits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ visitNumbers, payload }) => batchCompleteVisits(visitNumbers, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitKeys.all });
    },
  });
}

