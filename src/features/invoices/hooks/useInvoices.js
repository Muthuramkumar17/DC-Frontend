import { useQuery } from "@tanstack/react-query";
import { listInvoices, getInvoiceByNumber } from "../api/invoices.api.js";
import { invoiceKeys } from "../api/invoiceKeys.js";

export function useInvoicesList(filters = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => listInvoices(filters),
  });
}

export function useInvoiceDetail(invoiceNumber) {
  return useQuery({
    queryKey: invoiceKeys.detail(invoiceNumber),
    queryFn: () => getInvoiceByNumber(invoiceNumber),
    enabled: Boolean(invoiceNumber),
  });
}
