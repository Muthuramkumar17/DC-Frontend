export const invoiceKeys = {
  all: ['invoices'],
  lists: () => [...invoiceKeys.all, 'list'],
  list: (filters) => [...invoiceKeys.lists(), filters],
  details: () => [...invoiceKeys.all, 'detail'],
  detail: (id) => [...invoiceKeys.details(), id],
};
