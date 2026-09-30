export const paymentKeys = {
  all: ['payments'],
  lists: () => [...paymentKeys.all, 'list'],
  list: (filters) => [...paymentKeys.lists(), filters],
  details: () => [...paymentKeys.all, 'detail'],
  detail: (id) => [...paymentKeys.details(), id],
  dailyCollection: (date) => [...paymentKeys.all, 'dailyCollection', date],
  methods: () => [...paymentKeys.all, 'methods'],
};
