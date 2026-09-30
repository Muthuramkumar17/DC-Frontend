export const dashboardKeys = {
  all: ['dashboard'],
  summary: (date) => [...dashboardKeys.all, 'summary', date],
};
