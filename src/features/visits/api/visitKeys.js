export const visitKeys = {
  all: ['visits'],
  lists: () => [...visitKeys.all, 'list'],
  list: (filters) => [...visitKeys.lists(), filters],
  details: () => [...visitKeys.all, 'detail'],
  detail: (id) => [...visitKeys.details(), id],
};
