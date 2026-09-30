import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBookings,
  getBookingByNumber,
  getBookingMasters,
  checkSlotAvailability,
  createBooking,
  cancelBooking,
} from "../api/bookings.api.js";
import { bookingKeys } from "../api/bookingKeys.js";

export function useBookingMasters() {
  return useQuery({
    queryKey: bookingKeys.masters(),
    queryFn: getBookingMasters,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBookingsList(filters = {}) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => listBookings(filters),
  });
}

export function useBookingDetail(bookingNumber) {
  return useQuery({
    queryKey: bookingKeys.detail(bookingNumber),
    queryFn: () => getBookingByNumber(bookingNumber),
    enabled: Boolean(bookingNumber),
  });
}

export function useSlotAvailability(params) {
  return useQuery({
    queryKey: bookingKeys.availability(params),
    queryFn: () => checkSlotAvailability(params),
    enabled: Boolean(params?.date && (params?.bathroomCountId || params?.bathrooms)),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingNumber, reason }) => cancelBooking(bookingNumber, reason),
    onSuccess: (_, { bookingNumber }) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      if (bookingNumber) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingNumber) });
      }
    },
  });
}
