import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCustomers,
  getCustomerByNumber,
  getCustomer360,
  listAddressesForCustomer,
  createCustomerWithAddress,
  updateCustomer,
  addAddress,
  deactivateCustomer,
} from "../api/customers.api.js";
import { customerKeys } from "../api/customerKeys.js";

export function useCustomersList(filters = {}) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => listCustomers(filters),
  });
}

export function useCustomerDetail(customerNumber) {
  return useQuery({
    queryKey: customerKeys.detail(customerNumber),
    queryFn: () => getCustomerByNumber(customerNumber),
    enabled: Boolean(customerNumber),
  });
}

export function useCustomer360(customerNumber) {
  return useQuery({
    queryKey: [...customerKeys.detail(customerNumber), "360"],
    queryFn: () => getCustomer360(customerNumber),
    enabled: Boolean(customerNumber),
  });
}

export function useCustomerAddresses(customerId) {
  return useQuery({
    queryKey: [...customerKeys.all, "addresses", customerId],
    queryFn: () => listAddressesForCustomer(customerId),
    enabled: Boolean(customerId),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createCustomerWithAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useUpdateCustomer(customerNumber) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateCustomer(customerNumber, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      if (customerNumber) {
        queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerNumber) });
      }
    },
  });
}

export function useAddAddress(customerNumber) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => addAddress(customerNumber, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      if (customerNumber) {
        queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerNumber) });
      }
    },
  });
}

export function useDeactivateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerNumber) => deactivateCustomer(customerNumber),
    onSuccess: (_, customerNumber) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      if (customerNumber) {
        queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerNumber) });
      }
    },
  });
}
