export const subscriptionKeys = {
  all: ['subscriptions'],
  lists: () => [...subscriptionKeys.all, 'list'],
  list: (filters) => [...subscriptionKeys.lists(), filters],
  details: () => [...subscriptionKeys.all, 'detail'],
  detail: (id) => [...subscriptionKeys.details(), id],
  receipt: (id) => [...subscriptionKeys.details(), id, 'receipt'],
};
