export const bookingKeys = {
  all: ['bookings'],
  lists: () => [...bookingKeys.all, 'list'],
  list: (filters) => [...bookingKeys.lists(), filters],
  details: () => [...bookingKeys.all, 'detail'],
  detail: (id) => [...bookingKeys.details(), id],
  masters: () => [...bookingKeys.all, 'masters'],
  availability: (filters) => [...bookingKeys.all, 'availability', filters],
};
